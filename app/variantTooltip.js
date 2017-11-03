function VariantTooltip() {
	this.examinedVariant = null;
	this.WIDTH_LOCK         = 680;
	this.WIDTH_EXTRA_WIDE   = 840;
	this.WIDTH_HOVER        = 360;
	this.WIDTH_SIMPLE       = 280;
	this.WIDTH_SIMPLE_WIDER = 500;
	this.WIDTH_ALLELE_COUNT_BAR = 160;
	this.WIDTH_ALLELE_COUNT_ROW = 300;
	this.VALUE_EMPTY        = "-";
	this.AFFECTED_GLYPH =   "<i class='material-icons tooltip-affected-symbol'>spellcheck</i>";

}

VariantTooltip.prototype.fillAndPositionTooltip = function(tooltip, variant, lock, screenX, screenY, variantCard, html, adjustPosition=true) {
	var me = this;
	tooltip.style("z-index", 1032);
	tooltip.transition()        
	 .duration(1000)      
	 .style("opacity", .9)	
	 .style("pointer-events", "all");

	if (isLevelEdu || isLevelBasic) {
		tooltip.classed("level-edu", "true");
	} 

	tooltip.classed("tooltip-wide", lock && !isLevelEdu);

	var extraWide = lock && !isLevelEdu && variant.genericAnnots && Object.keys(variant.genericAnnots).length > 0;
	tooltip.classed("tooltip-extra-wide", extraWide);
	
	if (html == null) {
		if (lock) {
			html = variantTooltip.formatContent(variant, null, 'tooltip-wide', null, null, null, variantCard);
		} else {	
			var pinMessage = variantCard ? "click on variant for more details" : "click on column for more details";
			html = variantTooltip.formatContent(variant, pinMessage, null, null, null, null, variantCard);
		}		
	}
	tooltip.html(html);
	me.injectVariantGlyphs(tooltip, variant, lock ? '.tooltip-wide' : '.tooltip');

	
	if (variantCard == null) {
		variantCard = window.getProbandVariantCard();
	}
	var selection = tooltip.select("#coverage-svg");
	me.createAlleleCountSVGTrio(variantCard, selection, variant, me.WIDTH_ALLELE_COUNT_BAR);



	var hasLongText = $(tooltip[0]).find('.col-sm-8').length > 0  || $(tooltip[0]).find('.col-sm-9').length > 0;
 	var w = isLevelEdu || isLevelBasic ? (hasLongText ? me.WIDTH_SIMPLE_WIDER : me.WIDTH_SIMPLE) : (lock ? (extraWide ? me.WIDTH_EXTRA_WIDE : me.WIDTH_LOCK) : me.WIDTH_HOVER);
	var h = d3.round(tooltip[0][0].offsetHeight);

	var x = screenX;
	var y = screenY;
	var navbarHeight = (+$('body #container').css('top').split("px")[0] - 5);
	if (adjustPosition) {
		y -= navbarHeight;
		if (lock && y - h < (navbarHeight * -1)) {
			y = h - navbarHeight;
		}
		x = sidebarAdjustX(x);
	}


	if (lock && !isLevelEdu) {
		me.showScrollButtons($(tooltip[0]));
	}



	if (x > 0 && (x+w) < $('#matrix-panel').outerWidth()) {
		tooltip.classed("arrow-down-left", true);
		tooltip.classed("arrow-down-right", false);
		tooltip.classed("arrow-down-center", false);
		tooltip.style("width", w + "px")
		       .style("left", (x-33) + "px") 
		       .style("text-align", 'left')    
		       .style("top", (y - h) + "px");   

	} else if (x - w > 0 ) {
		tooltip.classed("arrow-down-right", true);
		tooltip.classed("arrow-down-left", false);
		tooltip.classed("arrow-down-center", false);
		tooltip.style("width", w + "px")
		       .style("left", (x - w + 2) + "px") 
		       .style("text-align", 'left')    
		       .style("top", (y - h) + "px");   
	}	else {
		tooltip.classed("arrow-down-right", false);
		tooltip.classed("arrow-down-left", false);
		tooltip.classed("arrow-down-center", true);
		tooltip.style("width", w + "px")
		       .style("left", (x - w/2) + "px") 
		       .style("text-align", 'left')    
		       .style("top", (y - h) + "px");   
	}		

}


VariantTooltip.prototype.injectVariantGlyphs = function(tooltip, variant, selector) {
	var tooltipNode = $(tooltip.node());

	var injectClinvarBadge = function(clinsig, key, translate) {
		clinsig.split(",").forEach( function(clinsigToken) {
			if (matrixCard.clinvarMap.hasOwnProperty(clinsigToken)) {
			    var clazz = matrixCard.clinvarMap[clinsigToken].clazz;
			    var badge = matrixCard.clinvarMap[clinsigToken].examineBadge;

			    var linkSelector =  ".tooltip-clinsig-link" + key;
			    if (badge && tooltipNode.find(linkSelector).length > 0) {
			    	var div = tooltipNode.find(linkSelector);
					$(div).prepend("<svg class=\"clinvar-badge\" style=\"float:left\"  height=\"12\" width=\"14\">");
					var svg = d3.select($(div).find("svg.clinvar-badge")[0]);
					var selection = svg.data([{width:10, height:10, transform: (translate ? translate : 'translate(0,1)'), clazz: clazz}]);
					matrixCard.showClinVarSymbol(selection);						    			    	
			    }			

			}

		})
	}


	var translate = variant.type.toLowerCase() == "snp" || variant.type.toLowerCase() == "mnp" ? 'translate(1,2)' : 'translate(5,6)';
	
	var impactList =  (filterCard.annotationScheme == null || filterCard.annotationScheme.toLowerCase() == 'snpeff' ? variant.impact : variant[IMPACT_FIELD_TO_COLOR]);
	var impactDivSelector = selector == '.tooltip-wide' ? '.tooltip-value' : '.tooltip-title';
	var impactStyle       = selector == '.tooltip-wide' ? " style='float:left' "             : " style='padding-top:2px;float:none' ";
	for (impact in impactList) {
		var theClazz = 'impact_' + impact;	
		if (tooltipNode.find(impactDivSelector  + '.impact-badge').length > 0) {			
			tooltipNode.find(impactDivSelector  + '.impact-badge').prepend("<svg class=\"impact-badge\" height=\"12\" width=\"14\" " + impactStyle + ">" );
			var selection = tooltip.select(impactDivSelector + '.impact-badge svg.impact-badge ').data([{width:10, height:10,clazz: theClazz,  transform: translate, type: variant.type}]);
			matrixCard.showImpactBadge(selection);	
		}
	}		

	if ($(selector + ' ' + impactDivSelector + '.highest-impact-badge').length > 0) {
		var highestImpactList =  (filterCard.annotationScheme == null || filterCard.annotationScheme.toLowerCase() == 'snpeff' ? variant.highestImpact : variant.highestImpactVep);
		for (impact in highestImpactList) {
			var theClazz = 'impact_' + impact;	
			if (tooltipNode.find(impactDivSelector  + '.highest-impact-badge').length > 0) {				
				tooltipNode.find(impactDivSelector  + '.highest-impact-badge').prepend("<svg class=\"impact-badge\" height=\"12\" width=\"14\" " + impactStyle + ">");
				var selection = tooltip.select(impactDivSelector + '.highest-impact-badge svg.impact-badge').data([{width:10, height:10,clazz: theClazz, transform: translate, type: variant.type}]);
				matrixCard.showImpactBadge(selection);	
			}
		}
	}


	if (selector == ".tooltip") {

		for (key in variant.vepSIFT) {
			if (matrixCard.siftMap[key]) {
				var clazz = matrixCard.siftMap[key].clazz;
				if (clazz) {
					if (!tooltip.select(".sift").empty()) {
						$(tooltip[0]).find(".sift").prepend("<svg class=\"sift-badge\" height=\"12\" width=\"13\">");
						var selection = tooltip.select('.sift-badge').data([{width:11, height:11, transform: 'translate(0,1)', clazz: clazz }]);					
						matrixCard.showSiftSymbol(selection);				
					}
				}			
			}

		}

		for (key in variant.vepPolyPhen) {
			if (matrixCard.polyphenMap[key]) {
				var clazz = matrixCard.polyphenMap[key].clazz;
				if (clazz) {
					if (!tooltip.select(".polyphen").empty()) {
						$(tooltip[0]).find(".polyphen").prepend("<svg class=\"polyphen-badge\" height=\"12\" width=\"12\">");
						var selection = tooltip.select('.polyphen-badge').data([{width:10, height:10, transform: 'translate(0,2)', clazz: clazz }]);					
						matrixCard.showPolyPhenSymbol(selection);				
					}
				}
			}
		}	

		if (variant.clinvarSubmissions && variant.clinvarSubmissions.length > 0) {
			var clinsigUniq = {};
			variant.clinvarSubmissions.forEach(function(submission) {
				submission.clinsig.split(",").forEach(function(clinsig) {
					clinsigUniq[clinsig] = "";
				})
			})
			for (var clinsig in clinsigUniq) {
				injectClinvarBadge(clinsig, clinsig, 'translate(0,0)');
			}
		} else if (variant.clinVarClinicalSignificance) {
		    for (clinsig in variant.clinVarClinicalSignificance) {
		    	var key = variant.clinVarClinicalSignificance[clinsig];
		    	injectClinvarBadge(clinsig, key);
			}
		}		

	} else {



		if (variant.clinvarSubmissions && variant.clinvarSubmissions.length > 0) {
			for (var idx = 0; idx < variant.clinvarSubmissions.length; idx++) {
				var submission = variant.clinvarSubmissions[idx];
				injectClinvarBadge(submission.clinsig, idx.toString());
			}
		} else if (variant.clinVarClinicalSignificance) {
		    for (clinsig in variant.clinVarClinicalSignificance) {
		    	var key = variant.clinVarClinicalSignificance[clinsig];
		    	injectClinvarBadge(clinsig, key);
			}
		}

	}






	for (key in variant.vepSIFT) {
		if (matrixCard.siftMap[key]) {
			var clazz = matrixCard.siftMap[key].clazz;
			if (clazz && tooltipNode.find(".tooltip-value.sift-glyph").length > 0) {
				tooltipNode.find(".tooltip-value.sift-glyph").prepend("<svg class=\"sift-badge\" style=\"float:left\"  height=\"12\" width=\"13\">");
				var selection = tooltip.select('.sift-badge').data([{width:11, height:11, transform: 'translate(0,1)', clazz: clazz }]);					
				matrixCard.showSiftSymbol(selection);				
			}			
		}

	}

	for (key in variant.vepPolyPhen) {
		if (matrixCard.polyphenMap[key]) {
			var clazz = matrixCard.polyphenMap[key].clazz;
			if (clazz && tooltipNode.find(".tooltip-value.polyphen-glyph").length > 0) {
				tooltipNode.find(".tooltip-value.polyphen-glyph").prepend("<svg class=\"polyphen-badge\" style=\"float:left\"   height=\"12\" width=\"12\">");
				var selection = tooltip.select('.polyphen-badge').data([{width:10, height:10, transform: 'translate(0,2)', clazz: clazz }]);					
				matrixCard.showPolyPhenSymbol(selection);				
			}
		}
	}



	if (variant.inheritance && variant.inheritance != '') {
		var clazz = matrixCard.inheritanceMap[variant.inheritance].clazz;
		var symbolFunction = matrixCard.inheritanceMap[variant.inheritance].symbolFunction;
		if ($(selector + " .tooltip-title:contains('inheritance')").length > 0) {
			$(selector + " .tooltip-title:contains('inheritance')").prepend("<svg class=\"inheritance-badge\"  height=\"15\" width=\"16\">");
			var options = {width:15, height:15, transform: 'translate(0,0)'};
			var selection = d3.select(selector + ' .inheritance-badge').data([{clazz: clazz}]);
			symbolFunction(selection, options);					
		}
	}	


	
}


VariantTooltip.prototype.formatContent = function(variant, pinMessage, type, rec, geneObject, theTranscript, variantCard) {
	var me = this;

	geneObject = geneObject ? geneObject : window.gene;
	theTranscript  = theTranscript ? theTranscript : window.selectedTranscript;

	if (type == null) {
		type = 'tooltip';
	}

	var exonDisplay = "";
	if (variant.hasOwnProperty("vepExon") && !$.isEmptyObject(variant.vepExon)) {
		exonDisplay += "Exon ";
		exonDisplay += Object.keys(variant.vepExon).join(",");
	}

	var calledVariantRow = "";
	if (variant.hasOwnProperty("fbCalled") && variant.fbCalled == "Y") {
		var calledGlyph = '<i id="gene-badge-called" class="material-icons glyph" style="display: inline-block;font-size: 15px;vertical-align: top;float:initial">check_circle</i>';
		var marginTop = type == 'tooltip-wide' ? ';margin-top: 1px;' : ';margin-top: 3px;';
		calledGlyph    += '<span style="display: inline-block;vertical-align: top;margin-left:3px' + marginTop + '">Called variant</span>';
		calledVariantRow = me._tooltipMainHeaderRow(calledGlyph, '', '', '');
	}

	var effectDisplay = "";
	for (var key in variant.effect) {
		if (effectDisplay.length > 0) {
		  	effectDisplay += ", ";
		}
		// Strip out "_" from effect
		var tokens = key.split("_");
		if (isLevelEdu) {
			effectDisplay = tokens.join(" ");
		} else {
			effectDisplay += tokens.join(" ");
		}
	}    
	var impactDisplay = "";
	for (var key in variant.impact) {
		if (impactDisplay.length > 0) {
		  	impactDisplay += ", ";
		}
		if (isLevelEdu) {
			impactDisplay = levelEduImpact[key];
		} else {
			impactDisplay += key;
		}
	} 

	var coord = variant.chrom + ":" + variant.start;
	var refalt = variant.ref + "->" + variant.alt;
	if (variant.ref == '' && variant.alt == '') {
		refalt = '(' + variant.len + ' bp)';
	}

	var clinSigDisplay = "";
	for (var key in variant.clinVarClinicalSignificance) {
		if (key != 'none' && key != 'undefined' ) {
			if (!isLevelEdu || (key.indexOf("uncertain_significance") >= 0 || key.indexOf("pathogenic") >= 0)) {
				if (clinSigDisplay.length > 0 ) {
				  	clinSigDisplay += ", ";
				}
				clinSigDisplay += key.split("_").join(" ");	
			}		
		}
	}

	var phenotypeDisplay = "";
	for (var key in variant.clinVarPhenotype) {
		if (key != 'not_specified'  && key != 'undefined') {
			if (phenotypeDisplay.length > 0) {
			  	phenotypeDisplay += ", ";
			}
			phenotypeDisplay += key.split("_").join(" ").split("\\x2c").join(", ");
		}
	} 


	var clinvarUrl = "";
	var clinvarLink = "";
	var clinvarSimpleRow1 = '';
	var clinvarSimpleRow2 = '';
	var knownVariantsClinvarLink = '';	
	if (isLevelEdu) {
		if (clinSigDisplay != null && clinSigDisplay != "") {
			clinvarSimpleRow1 = me._tooltipWideHeadingRow('Known from research', clinSigDisplay, '6px');	
			if (phenotypeDisplay) {
				clinvarSimpleRow2 = me._tooltipWideHeadingSecondRow('', phenotypeDisplay, null, 'tooltip-clinvar-pheno');			
			}
		}
	}

	if (clinSigDisplay != null && clinSigDisplay != "") {
		if (variant.clinVarUid != null && variant.clinVarUid != '') {
			clinvarUrl = 'http://www.ncbi.nlm.nih.gov/clinvar/variation/' + variant.clinVarUid;

			clinvarLink  = '<div class="tooltip-clinsig-link0" style="clear:both">';			
			clinvarLink += '<a  href="' + clinvarUrl + '" target="_new"' + '>' + clinSigDisplay + '</a>';
			clinvarLink += '</div>';
			
			clinvarSimpleRow1 = me._tooltipWideHeadingSecondRow('ClinVar', '<span class="tooltip-clinsig-link0">' + clinSigDisplay + '</span>', null);		
			if (phenotypeDisplay) {
				clinvarSimpleRow2 = me._tooltipWideHeadingSecondRow('&nbsp;', phenotypeDisplay, null, 'tooltip-clinvar-pheno');		
			}

		} else if (variant.clinvarSubmissions != null && variant.clinvarSubmissions.length > 0) {
			phenotypeDisplay = "";
			var simplePhenotypeDisplay = "";
			var clinsigUniq = {};
			for (var idx = 0; idx < variant.clinvarSubmissions.length; idx++) {
				var submission = variant.clinvarSubmissions[idx];

				submission.clinsig.split(",").forEach(function(clinsig) {
					clinsigUniq[clinsig] = "";					
				})

				clinvarLink += "<div style='clear:both' class='tooltip-clinsig-link" + idx.toString() + "'>";

				var accessions = submission.accession.split(",");
				var clinsigs   = submission.clinsig.split(",");
				for (var i = 0; i < accessions.length; i++) {
					var accessionSingle = accessions[i];
					var clinsigSingle   = clinsigs.length > i ? clinsigs[i] : "?";

					clinvarUrl   = 'http://www.ncbi.nlm.nih.gov/clinvar/' + accessionSingle;
					clinvarLink +=  '<a class="tooltip-clinvar-link"' + '" href="' + clinvarUrl + '" style="float:left;padding-right:4px" target="_new"' + '>' + clinsigSingle.split("_").join(" ") + '</a>';

					knownVariantsClinvarLink += "<span style='clear:both' class='tooltip-clinsig-link" + clinsigSingle + "'>";
					knownVariantsClinvarLink += '<a class="tooltip-clinvar-link"' + '" href="' + clinvarUrl + '" style="padding-right:4px" target="_new"' + '>' + clinsigSingle.split("_").join(" ") + '</a>';

				}	
				if (submission.phenotype != 'not_provided' && submission.phenotype != "not_specified") {
					clinvarLink += '<span class="tooltip-clinvar-pheno" style="float:left;word-break:break-word">' + submission.phenotype.split("_").join(" ").split("\\x2c").join(", ") + '</span>';
					if (simplePhenotypeDisplay.length > 0) {
						simplePhenotypeDisplay += ", ";
					}
					simplePhenotypeDisplay += submission.phenotype.split("_").join(" ").split("\\x2c").join(", ");
				}

				clinvarLink += "</div>"
			};

			var clinsigSummary = "";
			for (var clinsig in clinsigUniq) {
				var style = 'display:inline-block;'
				if (clinsigSummary.length > 0) {
					style += 'padding-left:5px';
				}
				clinsigSummary += "<span style='" + style +"' class='tooltip-clinsig-link" + clinsig + "'>";
				clinsigSummary += "<span style='float:left'>" + clinsig.split("_").join(" ") + "</span>";
				clinsigSummary += "</span>";
			}	
			clinvarSimpleRow1 = me._tooltipSimpleClinvarSigRow('ClinVar', clinsigSummary );	
			clinvarSimpleRow2 = me._tooltipHeaderRow(simplePhenotypeDisplay, '', '', '', '', null, 'style=padding-top:0px');	
		} else {
			clinvarLink = clinSigDisplay;
		}		
	}

	var zygosity = "";
	if (variant.zygosity && variant.zygosity.toLowerCase() == 'het') {
		zygosity = "Heterozygous";
	} else if (variant.zygosity && variant.zygosity.toLowerCase() == 'hom') {
		zygosity = "Homozygous";
	}

	var vepImpactDisplay = "";
	for (var key in variant.vepImpact) {
		if (vepImpactDisplay.length > 0) {
		  	vepImpactDisplay += ", ";
		}
		if (isLevelEdu) {
			vepImpactDisplay = levelEduImpact[key];
		} else {
			vepImpactDisplay += key.toLowerCase();
		}
	} 
	
	// If the highest impact occurs in a non-canonical transcript, show the impact followed by
	// the consequence and corresponding transcripts
	var vepHighestImpacts = VariantModel.getNonCanonicalHighestImpactsVep(variant);
	var vepHighestImpactDisplay = "";	
	var vepHighestImpactDisplaySimple = "";
	var vepHighestImpactSimple = "";
	var vepHighestImpactInfo = "";
	var vepHighestImpactValue = "";
	for (impactKey in vepHighestImpacts) {


		var nonCanonicalEffects = vepHighestImpacts[impactKey];
		if (vepHighestImpactDisplay.length > 0) {
		  	vepHighestImpactDisplay += ", ";
		  	vepHighestImpactDisplaySimple += ", ";
		  	vepHighestImpactInfo += ", ";
		}

		vepHighestImpactDisplay       += impactKey.toLowerCase();
		vepHighestImpactDisplaySimple += impactKey.toLowerCase();
		vepHighestImpactInfo          += impactKey.toLowerCase();
		vepHighestImpactValue          = impactKey.toUpperCase();
		
		nonCanonicalEffects.forEach(function(nonCanonicalEffect) {
			vepHighestImpactDisplay += "<span>  ("; 
			for (effectKey in nonCanonicalEffect) {
				var transcriptString = nonCanonicalEffect[effectKey].url;
				vepHighestImpactDisplay += " " + effectKey.split("\&").join(" & ") + 'in ' + transcriptString;
				vepHighestImpactInfo += " " + effectKey.split("\&").join(" & ") + " in " + nonCanonicalEffect[effectKey].display;

			}
			vepHighestImpactDisplay += ")</span> "; 
		})
		vepHighestImpactDisplaySimple += " in non-canonical transcripts";
	}

	var vepHighestImpactRow = "";
	var vepHighestImpactExamineRow = "";
	if (vepHighestImpactDisplay.length > 0) {
		vepHighestImpactRow = me._tooltipHeaderRow(vepHighestImpactDisplaySimple, '', '', '', 'highest-impact-badge');
		vepHighestImpactExamineRow = me._tooltipRow('Most severe impact', vepHighestImpactDisplay, null, true, 'highest-impact-badge');
	}

	var vepConsequenceDisplay = "";
	for (var key in variant.vepConsequence) {
		if (vepConsequenceDisplay.length > 0) {
		  	vepConsequenceDisplay += ", ";
		}
		if (isLevelEdu) {
			vepConsequenceDisplay = key.split("_").join(" ").toLowerCase();
		} else {
			vepConsequenceDisplay += key.split("_").join(" ").toLowerCase();
		}
	}     	
	var vepHGVScDisplay = "";
	var vepHGVSpDisplay = "";
	if (variant.fbCalled == 'Y' || variant.extraAnnot) {
		for (var key in variant.vepHGVSc) {
			if (key.length > 0) {
				if (vepHGVScDisplay.length > 0) {
				  	vepHGVScDisplay += ", ";
				}
				vepHGVScDisplay += key;				
			}
		}   		
		for (var key in variant.vepHGVSp) {
			if (key.length > 0) {
				if (vepHGVSpDisplay.length > 0) {
				  	vepHGVSpDisplay += ", ";
				}			
				vepHGVSpDisplay += key;
			}
		}   
	} else {
		// Show the loading gif for the hgvs notations (for tooltips only; not export record)
		if (!rec) {
			var loading = '<img class="gene-badge-loader glyph" style="width: 12px;height: 12px;" src="assets/images/wheel.gif"><span style="font-style:italic;margin-left:4px">loading</span>';
			vepHGVScDisplay = loading;
			vepHGVSpDisplay = loading;
		}
	}

	var vepSIFTDisplay = "";
	for (var key in variant.vepSIFT) {
		if (vepSIFTDisplay.length > 0) {
		  	vepSIFTDisplay += ", ";
		}
		vepSIFTDisplay += key.split("_").join(" ");
	} 
	var vepPolyPhenDisplay = "";
	for (var key in variant.vepPolyPhen) {
		if (vepPolyPhenDisplay.length > 0) {
		  	vepPolyPhenDisplay += ", ";
		}
		if (isLevelEdu) {
			vepPolyPhenDisplay = key.split("_").join(" ");
		} else {
			vepPolyPhenDisplay += key.split("_").join(" ");
		}
	} 
	
	var vepRegDisplay = "";
	for (var key in variant.regulatory) {
		// Bypass motif-based features
		if (key.indexOf("mot_") == 0) {
			continue;
 		}
 		if (vepRegDisplay.length > 0) {
		  	vepRegDisplay += ", ";
		}
		var value = variant.regulatory[key];
		vepRegDisplay += value;
	} 
	var vepRegMotifDisplay = "";
	if (variant.vepRegs) {
		for (var i = 0; i < variant.vepRegs.length; i++) {
			vr = variant.vepRegs[i];
			if (vr.motifName != null && vr.motifName != '') {
				
				if (vepRegMotifDisplay.length > 0) {
				  	vepRegMotifDisplay += ", ";
				}

				var tokens = vr.motifName.split(":");
				var baseMotifName;
				if (tokens.length == 2) {
					baseMotifName = tokens[1];
				}

				var regUrl = "http://jaspar.genereg.net/cgi-bin/jaspar_db.pl?ID=" + baseMotifName + "&rm=present&collection=CORE"
				vepRegMotifDisplay += '<a href="' + regUrl + '" target="_motif">' + vr.motifName + '</a>';
			}
		} 		
	}

	var dbSnpLink = "";
	var dbSnpUrl = "";
	for (var key in variant.vepVariationIds) {
		if (key != 0 && key != '') {
			var tokens = key.split("&");
			tokens.forEach( function(id) {
				if (id.indexOf("rs") == 0) {
					if (dbSnpLink.length > 0) {
						dbSnpLink += ",";
					}
					dbSnpUrl   = "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=" + id;
					dbSnpLink +=  '<a href="' + dbSnpUrl + '" target="_dbsnp"' + '>' + id + '</a>';					
				}
			});
		}
	};
	if (dbSnpLink.length == 0 && variant.rsid && variant.rsid.length > 0) {
		dbSnpUrl   = "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=" + variant.rsid;
		dbSnpLink +=  '<a href="' + dbSnpUrl + '" target="_dbsnp"' + '>' + 'rs' + variant.rsid + '</a>';							
	}

	var inheritanceModeRow =  variant.inheritance == null || variant.inheritance == '' || variant.inheritance == 'none' 
	                          ? ''
						      : me._tooltipHeaderRow('<span class="tooltip-inheritance-mode-label">' + matrixCard.getInheritanceLabel(variant.inheritance) + ' inheritance</span>', '', '', '', null, 'padding-top:0px;');


	var siftLabel = vepSIFTDisplay != ''  && vepSIFTDisplay != 'unknown' 
	                ? 'SIFT ' + vepSIFTDisplay
	                : "";
	var polyphenLabel = vepPolyPhenDisplay != '' && vepPolyPhenDisplay != 'unknown' 
	                    ? 'PolyPhen ' + vepPolyPhenDisplay
	                    : "";
	var sep = siftLabel != '' && polyphenLabel != '' ? '&nbsp;&nbsp;&nbsp;&nbsp;' : ''
	var siftPolyphenRow = '';
	if (siftLabel || polyphenLabel) {
		siftPolyphenRow = me._tooltipClassedRow(polyphenLabel + sep, 'polyphen', siftLabel, 'sift', 'padding-top:3px;');
	}


	var polyphenRowSimple = vepPolyPhenDisplay != "" ? me._tooltipWideHeadingRow('Predicted effect', vepPolyPhenDisplay + ' to protein', '3px') : "";

	
	var dbSnpId = getRsId(variant);	

	var genotypeRow = isLevelEdu && eduTourNumber == 2 ? me._tooltipHeaderRow('Genotype', switchGenotype(variant.eduGenotype), '','')  : "";


	var formatPopAF = function(afObject) {
		var popAF = "";
		if (afObject['AF'] != ".") {
			for (var key in afObject) {
				if (key != "AF") {
					var label = key.split("_")[0];
					if (popAF.length > 0) {
						popAF += ", ";
					}
					popAF += label + " " + (afObject[key] == "." ? "0%" : percentage(afObject[key]));					
				}
			}
		}		
		return popAF;
	}

	var gnomADAfRow = "";
	var gnomADAfRowWide = "";
	var exacAfRow = "";
	var exacAfRowWide = "";	
	if (global_vepAF && genomeBuildHelper.getCurrentBuildName() == "GRCh37" && variant.vepAf.gnomAD.hasOwnProperty("AF")) {
		gnomADAfRow = me._tooltipLabeledRow('Allele Freq gnomAD', (variant.vepAf.gnomAD.AF == "." ? "0%" : percentage(variant.vepAf.gnomAD.AF)), '6px');
		var af   =  variant.vepAf.gnomAD.AF == "." ? "0%" : percentage(variant.vepAf.gnomAD.AF);
		var link =  "<a target='_gnomad' href='http://gnomad.broadinstitute.org/variant/" + variant.chrom + "-" + variant.start + "-" + variant.ref + "-" + variant.alt + "'>" + af + "</a>";
		var popAF = formatPopAF(variant.vepAf.gnomAD);
		gnomADAfRowWide  = me._tooltipRow('Allele Freq gnomAD', '<span style="float:left">' + (variant.vepAf.gnomAD.AF == "." ? af : link) + '</span>', null, true, null, '0px');
		if (popAF.length > 0) {
			gnomADAfRowWide += me._tooltipRow('&nbsp;', '<span style="float:left">' + popAF + '</span>', null, true, null, '0px');
		}

	} 	

	exacAfRow = me._tooltipLabeledRow('Allele Freq ExAC', (variant.afExAC == -100 ? "n/a" : percentage(variant.afExAC)),  '0px' );
	exacAfRowWide = me._tooltipRow('Allele Freq ExAC', '<span style="float:left">' + (variant.afExAC == -100 ? "n/a" : percentage(variant.afExAC) + '</span>'), null, true, null, '0px');
	
	var popAf1000GRow = "";
	var af1000GRow = "";
	if (global_vepAF && variant.vepAf['1000G']) {
		popAF = formatPopAF(variant.vepAf['1000G']);
		if (variant.af1000G) {
			af1000GRow    = me._tooltipRow('Allele Freq 1000G', '<span style="float:left">' + percentage(variant.af1000G) + '</span>', null, true, null, popAF.length > 0 ? '0px' : null);
			if (popAF.length > 0) {
				popAf1000GRow = me._tooltipRow('&nbsp;', '<span style="float:left">' + popAF + '</span>');
			}
		} else {
			popAf1000GRow =  me._tooltipRow('Allele Freq 1000G', '<span style="float:left">' + popAF + '</span>');

		}
	}

	var bookmarkBadge = '';
	if (window.clickedVariant && window.clickedVariant.hasOwnProperty('isBookmark') && window.clickedVariant.isBookmark == 'Y') {
		bookmarkBadge = '<svg class="bookmark-badge" height="14" width="14" style="padding-top:2px" ><g class="bookmark" transform="translate(0,0)"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#bookmark-symbol" width="14" height="14"></use></g></svg>';
	}

	


	if (rec) {
		rec.inheritance      = variant.inheritance ? matrixCard.getInheritanceLabel(variant.inheritance) : "";
		rec.impact           = vepImpactDisplay;
		rec.highestImpact    = vepHighestImpactValue;
 		rec.highestImpactInfo = vepHighestImpactInfo;
 		rec.consequence      = vepConsequenceDisplay;
		rec.polyphen         = vepPolyPhenDisplay;
		rec.type             = variant.type;
		rec.SIFT             = vepSIFTDisplay;
		rec.regulatory       = vepRegDisplay;
		rec.rsId             = dbSnpId;
		rec.dbSnpUrl         = dbSnpUrl;
		rec.clinvarUrl       = clinvarUrl;
		rec.clinvarClinSig   = clinSigDisplay;
		rec.clinvarPhenotype = phenotypeDisplay;
		rec.HGVSc            = vepHGVScDisplay;
		rec.HGVSp            = vepHGVSpDisplay;
		rec.afExAC           = (variant.afExAC == -100 ? "n/a" : variant.afExAC);
		rec.af1000G          = variant.af1000G;
		rec.afgnomAD         = variant.afgnomAD == "." ? 0 : variant.afgnomAD;
		rec.qual             = variant.qual;
		rec.filter           = variant.filter;
		rec.freebayesCalled  = variant.fbCalled;

		rec.zygosityProband  = variant.zygosity;
		rec.altCountProband  = variant.genotypeAltCount;
		rec.refCountProband  = variant.genotypeRefCount;
		rec.depthProband     = variant.genotypeDepth;
		rec.bamDepthProband  = variant.bamDepth;

		rec.zygosityMother   = variant.motherZygosity;
		rec.altCountMother   = variant.genotypeAltCountMother;
		rec.refCountMother   = variant.genotypeRefCountMother;
		rec.depthMother      = variant.genotypeDepthMother;
		rec.bamDepthMother   = variant.bamDepthMother;

		rec.zygosityFather   = variant.fatherZygosity;
		rec.altCountFather   = variant.genotypeAltCountFather;
		rec.refCountFather   = variant.genotypeRefCountFather;
		rec.depthFather      = variant.genotypeDepthFather;
		rec.bamDepthFather   = variant.bamDepthFather;

		return rec;
	} else if (isLevelEdu) {
		return (
			genotypeRow
			+ me._tooltipMainHeaderRow('Severity - ' + vepImpactDisplay , '', '', '')
			+ inheritanceModeRow
			+ polyphenRowSimple
			+ clinvarSimpleRow1
			+ clinvarSimpleRow2 );
	} else if (type == 'tooltip') {
		return (
			me._tooltipMainHeaderRow(geneObject ? geneObject.gene_name : "", variant.type ? variant.type.toUpperCase() : "", refalt + " " + coord, dbSnpLink, 'ref-alt')
			+ calledVariantRow
			+ me._tooltipMainHeaderRow(vepImpactDisplay, vepConsequenceDisplay, '', '', 'impact-badge')
			+ vepHighestImpactRow
			+ inheritanceModeRow
			+ siftPolyphenRow
			+ gnomADAfRow
			+ exacAfRow
			+ me._tooltipLabeledRow('Allele Freq 1000G', percentage(variant.af1000G), null)
			+ (variantCard.getRelationship() == 'known-variants' ? me._tooltipRow('&nbsp;', knownVariantsClinvarLink, '6px')  : clinvarSimpleRow1)
			+ (variantCard.getRelationship() == 'known-variants' ? clinvarSimpleRow2 : '')	
			+ me._linksRow(variant, pinMessage, variantCard)
		);                  

	} else if (type == 'tooltip-wide') {

		var leftDiv =  
		    '<div class="tooltip-left-column">' 
		    +   me._tooltipRow('VEP Consequence', vepConsequenceDisplay)
			+   me._tooltipRow('VEP Impact', ' '  + vepImpactDisplay, null, true, 'impact-badge')
			+   vepHighestImpactExamineRow			
			+   me._tooltipRow('ClinVar', '<span style="float:left">' + (clinvarLink != '' ? clinvarLink : me.VALUE_EMPTY) + '</span>', null, true)
			+   me._tooltipRow('&nbsp;', phenotypeDisplay, null, false, 'tooltip-clinvar-pheno')
			+   me._tooltipRow('HGVSc', vepHGVScDisplay, null, true)
			+   me._tooltipRow('HGVSp', vepHGVSpDisplay, null, true)
			+   me._tooltipRow('PolyPhen', vepPolyPhenDisplay, null, true, 'polyphen-glyph')
			+   me._tooltipRow('SIFT', vepSIFTDisplay, null, true, 'sift-glyph')
			+   me._tooltipRowURL('Regulatory', vepRegDisplay, null, true)
			+ "</div>";

		var rightDiv = 
			'<div class="tooltip-right-column">'
			+ gnomADAfRowWide
			+ exacAfRowWide
			+ af1000GRow
			+ popAf1000GRow
			+ me._tooltipRowAlleleCounts() 
			+   me._tooltipRow('Qual', variant.qual, null, true) 
			+   me._tooltipRow('VCF filter status', (variant.recfilter == '.' ? '. (unassigned)' : variant.recfilter), null, true) 
			+ "</div>";


		var clazzMap = {container: 'tooltip-info-column', row: 'tooltip-row', label: 'tooltip-header', value: 'tooltip-value'};
		var otherDiv = genericAnnotation.formatContent(variant, clazzMap, this.VALUE_EMPTY);


		var div =
		    '<div class="tooltip-wide">'
			+ me._tooltipMainHeaderRow(bookmarkBadge + (geneObject ? geneObject.gene_name : ""), variant.type ? variant.type.toUpperCase() : "", refalt + " " + coord + " " + exonDisplay, dbSnpLink , 'ref-alt')
			+ calledVariantRow
			+ inheritanceModeRow
			+ '<div id="tooltip-body" class="row" style="max-height:205px;overflow-y:scroll">' 
				+ leftDiv
				+ rightDiv
				+ otherDiv
			+ '</div>'
			+ me._linksRow(variant, null, variantCard)	
			+ "</div>";

		return div;

	} else {
		return (
			 me._tooltipMainHeaderRow(variant.type ? variant.type.toUpperCase() : "", refalt, '   ', dbSnpLink, 'ref-alt')
			+ me._tooltipHeaderRow(geneObject ? geneObject.gene_name : "", coord, exonDisplay, '')
			+ inheritanceModeRow

			+ me._tooltipRow('VEP Consequence', vepConsequenceDisplay, "10px")
			+ me._tooltipRow('VEP Impact', vepImpactDisplay.toLowerCase(), null, true, 'impact-badge')
			+ vepHighestImpactExamineRow			
			+ me._tooltipRow('SIFT', vepSIFTDisplay, null, false, 'sift-glyph')
			+ me._tooltipRow('PolyPhen', vepPolyPhenDisplay, null, false, 'polyphen-glyph')
			+ me._tooltipRow('ClinVar', clinvarLink, null, false, 'tooltip-clinvar-pheno')
			+ me._tooltipRow('&nbsp;', phenotypeDisplay)
			+ me._tooltipRow('Allele Freq gnomAD', percentage(variant.afgnomAD))
			+ me._tooltipRow('Allele Freq ExAC', (variant.afExAC == -100 ? "n/a" : percentage(variant.afExAC)))
			+ me._tooltipRow('Allele Freq 1000G', percentage(variant.af1000G))
			+ me._tooltipRowURL('Regulatory', vepRegDisplay)
			+ me._tooltipRow('HGVSc', vepHGVScDisplay)
			+ me._tooltipRow('HGVSp', vepHGVSpDisplay)
			+ me._tooltipRow('Qual', variant.qual) 
			+ me._tooltipRow('Filter', variant.recfilter) 
			+ me._tooltipRowAlleleCounts() 
			+ me._linksRow(variant, null, variantCard)
		);                  

	}
	

	        

}



VariantTooltip.prototype.variantTooltipMinimalHTML = function(variant) {
	var me = this;

	var zygosity = "";
	if (variant.zygosity.toLowerCase() == 'het') {
		zygosity = "Heterozygous";
	} else if (variant.zygosity.toLowerCase() == 'hom') {
		zygosity = "Homozygous";
	}
	
	
	return (
		me._tooltipRow('Zygosity',  zygosity)
		+ me._tooltipRow('Qual &amp; Filter', variant.qual + ', ' + variant.filter) 
		);
              

}


VariantTooltip.prototype._linksRow = function(variant, pinMessage, variantCard) {
	if (pinMessage == null) {
		pinMessage = 'Click on variant for more details';
	}
	var scrollUpButton = '<button id="tooltip-scroll-up" class="tooltip-button  btn btn-raised btn-default" ><i class="material-icons">arrow_upward</i>up</button>'
	var scrollDownButton = '<button id="tooltip-scroll-down" class="tooltip-button btn btn-raised btn-default" ><i class="material-icons">arrow_downward</i>more</button>'


	var bookmarkLink =  '<button id="bookmarkLink"  class="tooltip-button btn btn-raised btn-default" onclick="bookmarkVariant();showAsBookmarked(this);">bookmark</button>';
	
	var removeBookmarkLink  =  '<button id="remove-bookmark-link" class="tooltip-button btn btn-raised btn-default" onclick="removeBookmarkOnVariant();showAsNotBookmarked(this)">remove bookmark</button>'
	showAsBookmarked = function(container) {
		$(container).parent().html(bookmarkBadge + removeBookmarkLink);
	};
	showAsNotBookmarked = function(container) {
		$(container).parent().html(bookmarkLink);
	};

	var unpin =  '<button id="unpin"  class="tooltip-button btn btn raised btn-default"  >close</button>'

	if (window.clickedVariant) {
		if (window.clickedVariant.hasOwnProperty('isBookmark') && window.clickedVariant.isBookmark == 'Y') {
			return '<div class="row tooltip-footer">'
			  + '<div class="col-sm-4" id="bookmarkLink" style="text-align:left;">' +  removeBookmarkLink  + '</div>'
			  + '<div class="col-sm-4"  style="text-align:center;">' +  (variantCard == null || variantCard.getRelationship() == 'known-variants' ? '' : scrollUpButton + scrollDownButton) + '</div>'
			  + '<div class="col-sm-4" style="text-align:right;">' + unpin + '</div>'
			  + '</div>';

		} else {
			return '<div class="row tooltip-footer" style="">'
			  + '<div class="col-sm-4" style="text-align:left;">' + bookmarkLink + '</div>'
			  + '<div class="col-sm-4"  style="text-align:center;">' +  (variantCard == null || variantCard.getRelationship() == 'known-variants' ? '' : scrollUpButton + scrollDownButton) + '</div>'
			  + '<div class="col-sm-4" style="text-align:right;">' + unpin + '</div>'
			  + '</div>';

		}
		
	} else {
		return '<div class="row tooltip-footer">'
		  + '<div class="col-md-12 " style="text-align:right;">' +  '<em>' + pinMessage + '</em>' + '</div>'
		  + '</div>';
	}
}

VariantTooltip.prototype._tooltipBlankRow = function() {
	return '<div class="row">'
	  + '<div class="col-md-12">' + '  ' + '</div>'
	  + '</div>';
}

VariantTooltip.prototype._tooltipHeaderRow = function(value1, value2, value3, value4, clazz, style) {
	var theStyle = style ? style : '';
	var clazzList = "col-md-12 tooltip-title";
	if (clazz) {
		clazzList += " " + clazz;
	}
	return '<div class="row" style="' + theStyle + '">'
	      + '<div class="' + clazzList + '" style="text-align:center">' + value1 + ' ' + value2 + ' ' + value3 +  ' ' + value4 + '</div>'
	      + '</div>';	
}
VariantTooltip.prototype._tooltipMainHeaderRow = function(value1, value2, value3, value4, clazz) {
	var theClass = "col-md-12 tooltip-title main-header";
	if (clazz) {
		theClass += " " + clazz;
	}
	return '<div class="row">'
	      + '<div class="' + theClass + '" style="text-align:center">' + value1 + ' ' + value2 + ' ' + value3 +  ' ' + value4 + '</div>'
	      + '</div>';	
}
VariantTooltip.prototype._tooltipLowQualityHeaderRow = function() {
	return '<div class="row">'
	      + '<div class="col-md-12 tooltip-title danger" style="text-align:center">' + 'FLAGGED FOR NOT MEETING FILTERING CRITERIA' + '</div>'
	      + '</div>';	
}

VariantTooltip.prototype._tooltipHeaderLeftJustifyRow = function(value1, value2, value3, value4) {
	return '<div class="row">'
	      + '<div class="col-md-12 tooltip-title" style="text-align:left">' + value1 + ' ' + value2 + ' ' + value3 +  ' ' + value4 + '</div>'
	      + '</div>';	
}

VariantTooltip.prototype._tooltipHeaderLeftJustifySimpleRow = function(value1) {
	return '<div class="row">'
	      + '<div class="col-md-12 tooltip-title" style="text-align:left">' + value1 + '</div>'
	      + '</div>';	
}

VariantTooltip.prototype._tooltipClassedRow = function(value1, class1, value2, class2, style) {
	var theStyle = style ? style : '';
	return '<div class="row" style="' + theStyle + '">'
	      +  '<div class="col-md-12 tooltip-title" style="text-align:center">' 
	      +    "<span class='" + class1 + "'>" + value1 + '</span>' 
	      +    "<span class='" + class2 + "'>" + value2 + '</span>' 
	      +  '</div>'
	      + '</div>';	
}

VariantTooltip.prototype._tooltipLabeledRow = function(value1, value2, paddingTop, paddingBottom) {
	var thePaddingTop    = paddingTop    ? "padding-top:"    + paddingTop    + ";" : "";
	var thePaddingBottom = paddingBottom ? "padding-bottom:" + paddingBottom + ";" : "";
	return '<div class="row" style="' + thePaddingTop + thePaddingBottom + '">'
	      + '<div class="col-sm-6 tooltip-title"  style="text-align:right;word-break:normal">' + value1  +'</div>'
	      + '<div class="col-sm-6 tooltip-title" style="text-align:left;word-break:normal">' + value2 + '</div>'
	      + '</div>';	
}

VariantTooltip.prototype._tooltipWideHeadingRow = function(value1, value2, paddingTop) {
	var thePaddingTop = paddingTop ? "padding-top:" + paddingTop + ";" : "";
	return '<div class="row" style="padding-bottom:5px;' + thePaddingTop + '">'
	      + '<div class="col-sm-4 tooltip-title"  style="text-align:right;word-break:normal">' + value1  +'</div>'
	      + '<div class="col-sm-8 tooltip-title" style="text-align:left;word-break:normal">' + value2 + '</div>'
	      + '</div>';	
}
VariantTooltip.prototype._tooltipWideHeadingSecondRow = function(value1, value2, paddingTop, valueClazz) {
	var thePaddingTop = paddingTop ? "padding-top:" + paddingTop + ";" : "";
	return '<div class="row" style="padding-bottom:5px;' + thePaddingTop + '">'
	      + '<div class="col-sm-4 tooltip-title" style="text-align:right;word-break:normal">' + value1  +'</div>'
	      + '<div class="col-sm-8 tooltip-title' + (valueClazz ? ' ' + valueClazz : '') + '" style="text-align:left;word-break:normal">' + value2 + '</div>'
	      + '</div>';	
}
VariantTooltip.prototype._tooltipSimpleClinvarSigRow = function(value1, value2) {
	return '<div class="row" style="padding-bottom:0px;padding-top: 5px">'
	      + '<div class="col-sm-4 tooltip-title" style="text-align:right;word-break:normal">' + value1  +'</div>'
	      + '<div class="col-sm-8 tooltip-title style="text-align:left;word-break:normal">' + value2 + '</div>'
	      + '</div>';	
}

VariantTooltip.prototype._tooltipLongTextRow = function(value1, value2, paddingTop) {
	var thePaddingTop = paddingTop ? "padding-top:" + paddingTop + ";" : "";
	return '<div class="row" style="' + thePaddingTop + '">'
	      + '<div class="col-sm-3 tooltip-title" style="text-align:left;word-break:normal">' + value1  +'</div>'
	      + '<div class="col-sm-9 tooltip-title" style="text-align:left;word-break:normal">' + value2 + '</div>'
	      + '</div>';	
}
VariantTooltip.prototype._tooltipShortTextRow = function(value1, value2, value3, value4, paddingTop) {
	var thePaddingTop = paddingTop ? "padding-top:" + paddingTop + ";" : "";

	return '<div class="row" style="padding-bottom:5px;' + thePaddingTop + '">'
	      + '<div class="col-sm-4 tooltip-label" style="text-align:right;word-break:normal;padding-right:5px;">' + value1  +'</div>'
	      + '<div class="col-sm-2 " style="text-align:left;word-break:normal;padding-left:0px;">' + value2 + '</div>'
	      + '<div class="col-sm-4 tooltip-label" style="text-align:right;word-break:normal;padding-right:5px;">' + value3  +'</div>'
	      + '<div class="col-sm-2 " style="text-align:left;word-break:normal;padding-left:0px">' + value4 + '</div>'
	      + '</div>';			

}



VariantTooltip.prototype._tooltipRow = function(label, value, paddingTop, alwaysShow, valueClazz, paddingBottom) {
	if (alwaysShow || (value && value != '')) {
		var style = paddingTop || paddingBottom ? 
		              (' style="' 
		               + (paddingTop    ? 'padding-top:'    + paddingTop + ';'  : '' )
		               + (paddingBottom ? 'padding-bottom:' + paddingBottom + ';' : '') 
		               + '"') : '';
		var valueClazzes = "tooltip-value";
		if (valueClazz) {
			valueClazzes += " " + valueClazz;
		}
		if (value == "") {
			value = this.VALUE_EMPTY;
		}
		return '<div class="tooltip-row"' + style + '>'
		      + '<div class="tooltip-header" style="text-align:right">' + label + '</div>'
		      + '<div class="' + valueClazzes + '">' + value + '</div>'
		      + '</div>';
	} else {
		return "";
	}
}

VariantTooltip.prototype._tooltipRowURL = function(label, value, paddingTop, alwaysShow) {
	if (alwaysShow || (value && value != '')) {
		var style = paddingTop ? ' style="padding-top:' + paddingTop + '" '  : '';
		if (value == "") {
			value = this.VALUE_EMPTY;
		}
		return '<div class="tooltip-row"' + style + '>'
		      + '<div class="tooltip-header" style="text-align:right">' + label + '</div>'
		      + '<div class="tooltip-value">' + value + '</div>'
		      + '</div>';
	} else {
		return "";
	}
}

VariantTooltip.prototype._tooltipRowAF = function(label, afExAC, af1000g) {
	return '<div class="tooltip-row">'
		      + '<div class="tooltip-header" style="text-align:right">' + label + '</div>'
		      + '<div class="tooltip-value">' + 'ExAC: ' + afExAC  + '    1000G: ' + af1000g + '</div>'
		 + '</div>';
}

VariantTooltip.prototype._tooltipRowAlleleCounts = function(label) {
	return '<div  id="coverage-svg" style="padding-top:0px">'
		 + '</div>';
}

VariantTooltip.prototype.scroll = function(dir="down", parentContainerSelector) {
	var me = this;

	var topPos = $(parentContainerSelector + ' #tooltip-body').scrollTop();
	scrollHeight = $(parentContainerSelector + ' #tooltip-body').innerHeight();
	var multiplier = 1;
	if (dir == "up") {
		multiplier =  -1;
	}
	$(parentContainerSelector + ' #tooltip-body').animate({
	    scrollTop: (topPos + scrollHeight) * multiplier
	}, 1000, function() {
		me.showScrollButtons($(parentContainerSelector));
	});	
}

VariantTooltip.prototype.showScrollButtons = function(parentNode) {
		var pos = parentNode.find('#tooltip-body').scrollTop();
		var contentHeight = parentNode.find('#tooltip-body')[0].scrollHeight - parentNode.find('.tooltip-wide .tooltip-row').css('padding-bottom').split("px")[0];
		scrollHeight = parentNode.find('#tooltip-body').innerHeight();

		if (scrollHeight + pos < contentHeight) {
			parentNode.find('#tooltip-scroll-down').removeClass("hide");
		} else {
			parentNode.find('#tooltip-scroll-down').addClass("hide");
		}

		if (pos == 0) {
			parentNode.find('#tooltip-scroll-up').addClass("hide");
		} else {
			parentNode.find('#tooltip-scroll-up').removeClass("hide");
		}	
}

VariantTooltip.prototype.createAlleleCountSVGTrio = function(variantCard, container, variant, barWidth) {
	var me = this;
	

	container.select("div.ped-info").remove();

	var firstTime = true;
	getAffectedInfo().forEach(function(info) {			
	
		var affectedStatus = info.status;
		var sampleName     = info.variantCard.getSampleName();
		var genotype       = variant.genotypes[sampleName];

		if (genotype == null || genotype.absent && dataCard.mode == 'single') {
			// If vcf doesn't have any genotypes, skip showing this

		} else {

			var selectedClazz  = dataCard.mode == 'trio' && info.variantCard == variantCard ? 'selected' : '';

			var rel      = info.relationship;
			row = container.append("div")
	                       .attr("class", rel + "-alt-count tooltip-row ped-info");	

	        if (firstTime) {
	        	me._appendReadCountHeading(row);
	        	firstTime = false;
	        }
			row.append("div")
		       .attr("class", rel + "-alt-count tooltip-header-small")
		       .html("<span class='tooltip-ped-label " 
		       	+ selectedClazz + "'>" 
		       	+ " " + (rel == 'sibling' ? 'Sib' : capitalizeFirstLetter(rel)) 
		       	+ " " + (rel == 'sibling' ? sampleName : '') 
		       	+ "</span>"
		        + (affectedStatus == 'affected' ? me.AFFECTED_GLYPH : ''));

	        var zyg = genotype ? (!genotype.hasOwnProperty('zygosity') || genotype.zygosity == null || genotype.zygosity == "gt_unknown" ? "unknown" : genotype.zygosity.toLowerCase()) : "none";
			row.append("div")
			   .attr("class",  "tooltip-zygosity label " + zyg)
			   .text(capitalizeFirstLetter(zyg));


			var barContainer = row.append("div")
		                          .attr("class", rel + "-alt-count tooltip-allele-count-bar")
			if (genotype) {
				getProbandVariantCard().promiseGetMaxAlleleCount()
				 .then(function(maxAlleleCount) {
					me._appendAlleleCountSVG(barContainer, 
						genotype.altCount, 
						genotype.refCount, 
						genotype.genotypeDepth, 
						null,
						barWidth,
						maxAlleleCount);

				 });
			}
		}


	});

    
}




VariantTooltip.prototype._appendReadCountHeading = function(container) {
	var me = this;
	var svg = container.append("div")	
					   .attr("id", "allele-count-legend")	
		           	   .style("padding-top", "0px")		           	   
				       .append("svg")
				       .attr("width", me.WIDTH_ALLELE_COUNT_ROW)
	           		   .attr("height", "20");
	svg.append("text")
		   .attr("x", "0")
		   .attr("y", "14")
		   .attr("anchor", "start")		 
		   .attr("class", "tooltip-header-small")
		   .text("Read Counts");	  	           		   

	var g = svg.append("g")
	           .attr("transform", "translate(77,0)");

	g.append("text")
		   .attr("x", "13")
		   .attr("y", "9")
		   .attr("class", "alt-count-under")
		   .attr("anchor", "start")
		   .text("alt");	           		   
	g.append("text")
		   .attr("x", "37")
		   .attr("y", "9")
		   .attr("class", "other-count-under")
		   .attr("anchor", "start")
		   .text("other");	           		   
	g.append("text")
		   .attr("x", "70")
		   .attr("y", "9")
		   .attr("class", "ref-count")
		   .attr("anchor", "start")
		   .text("ref");	
	g.append("text")
		   .attr("x", "90")
		   .attr("y", "14")
		   .attr("class", "ref-count")
		   .attr("anchor", "start")
		   .text("total");	  		              		   

	g.append("rect")
	   .attr("x", "1")
	   .attr("y", "10")
	   .attr("height", 4)
	   .attr("width",28)
	   .attr("class", "alt-count");
	g.append("rect")
	   .attr("x", "29")
	   .attr("y", "10")
	   .attr("height", 4)
	   .attr("width",28)
	   .attr("class", "other-count");
	g.append("rect")
	   .attr("x", "57")
	   .attr("y", "10")
	   .attr("height", 4)
	   .attr("width",28)
	   .attr("class", "ref-count");

}

VariantTooltip.prototype._appendAlleleCountSVG = function(container, genotypeAltCount, 
	genotypeRefCount, genotypeDepth, bamDepth, barWidth, maxAlleleCount) {
	var me = this;

	var MAX_BAR_WIDTH = barWidth ? barWidth : me.ALLELE_COUNT_BAR_WIDTH;
	var PADDING = 20;
	var BAR_WIDTH = 0;
	if ((genotypeDepth == null || genotypeDepth == '') && (genotypeAltCount == null || genotypeAltCount.indexOf(",") >= 0)) {
		container.text("");
		var svg = container
	            .append("svg")
	            .attr("width", MAX_BAR_WIDTH + PADDING)
	            .attr("height", "21");
	    return;
	}



	if (genotypeAltCount == null || genotypeAltCount.indexOf(",") >= 0) {
		BAR_WIDTH = d3.round(MAX_BAR_WIDTH * (genotypeDepth / maxAlleleCount));
		container.select("svg").remove();
		var svg = container
	            .append("svg")
	            .attr("width", MAX_BAR_WIDTH + PADDING)
	            .attr("height", "12");
		svg.append("rect")
		   .attr("x", "1")
  	  	   .attr("y", "1")
  		   .attr("height", 10)
		   .attr("width",BAR_WIDTH)
		   .attr("class", "ref-count");
		
		svg.append("text")
		   .attr("x", BAR_WIDTH + 5)
		   .attr("y", "9")
		   .text(genotypeDepth);

		var g = svg.append("g")
		           .attr("transform", "translate(0,0)");
		g.append("text")
		    .attr("x", BAR_WIDTH / 2)
		    .attr("y", "9")
		    .attr("text-anchor", "middle")
		    .attr("class", "ref-count")
	   		.text("?");
		return;
	} 

	var totalCount = genotypeDepth;
	var otherCount = totalCount - (+genotypeRefCount + +genotypeAltCount);

	// proportion the widths of alt, other (for multi-allelic), and ref
	BAR_WIDTH      = d3.round((MAX_BAR_WIDTH) * (totalCount / maxAlleleCount));
	if (BAR_WIDTH < 10) {
		BAR_WIDTH = 10;
	}
	if (BAR_WIDTH > PADDING + 10) {
		BAR_WIDTH = BAR_WIDTH - PADDING;
	}
	var altPercent = +genotypeAltCount / totalCount;
	var altWidth   = d3.round(altPercent * BAR_WIDTH);
	var refPercent = +genotypeRefCount / totalCount;
	var refWidth   = d3.round(refPercent * BAR_WIDTH);
	var otherWidth = BAR_WIDTH - (altWidth+refWidth); 

	// Force a separate line if the bar width is too narrow for count to fit inside or
	// this is a multi-allelic.
	var separateLineForLabel = (altWidth > 0 && altWidth / 2 < 11) || (refWidth > 0 && refWidth / 2 < 11) || (otherWidth > 0);

	container.select("svg").remove();
	var svg = container
	            .append("svg")
	            .attr("width", MAX_BAR_WIDTH + PADDING)
	            .attr("height", separateLineForLabel ? "21" : "12");
	
	if (altWidth > 0) {
		svg.append("rect")
		 .attr("x", "1")
		 .attr("y", "1")
		 .attr("height", 10)
		 .attr("width",altWidth)
		 .attr("class", "alt-count");

	}

	if (otherWidth > 0) {
		svg.append("rect")
			 .attr("x", altWidth)
			 .attr("y", "1")
			 .attr("height", 10)
			 .attr("width", otherWidth)
			 .attr("class", "other-count");			
	}
	 
	if (refWidth > 0) {
		svg.append("rect")
		 .attr("x",  altWidth + otherWidth)
		 .attr("y", "1")
		 .attr("height", 10)
		 .attr("width", refWidth)
		 .attr("class", "ref-count");		
	}

	

	svg.append("text")
	   .attr("x", BAR_WIDTH + 5)
	   .attr("y", "9")
	   .text(totalCount);



	var altX = 0;
	var otherX = 0;
	var refX = 0;
	var g = svg.append("g")
	           .attr("transform", (separateLineForLabel ? "translate(-6,11)" : "translate(0,0)"));
	if (altWidth > 0) {
		var altX = d3.round(altWidth / 2);
		if (altX < 6) {
			altX = 6;
		}
		 g.append("text")
		   .attr("x", altX)
		   .attr("y", "9")
		   .attr("text-anchor", separateLineForLabel ? "start" : "middle")
		   .attr("class", separateLineForLabel ? "alt-count-under" : "alt-count")
		   .text(genotypeAltCount);

	}

 	if (otherCount > 0) {
 		otherX = altWidth  + d3.round(otherWidth / 2);
 		// Nudge the multi-allelic "other" count over to the right if it is
 		// too close to the alt count.
 		if (otherX - 11 < altX) {
 			otherX = altX + 10;
 		} 		
 		g.append("text")
		   .attr("x", otherX)
		   .attr("y", "9")
		   .attr("text-anchor", separateLineForLabel ? "start" : "middle")
		   .attr("class", separateLineForLabel ? "other-count-under" : "other-count")
		   .text(otherCount);

		var gNextLine = g.append("g")
		                 .attr("transform", "translate(-15,9)");
		svg.attr("height", 31);
		gNextLine.append("text")
		         .attr("x", otherX < 20 ? 20 : otherX)
				 .attr("y", "9")
				 .attr("text-anchor", "start")
				 .attr("class", "other-count-under" )
				 .text("(multi-allelic)");
	}	 
	if (genotypeRefCount > 0  && (altWidth > 0 || otherWidth > 0)) {
		refX = altWidth + otherWidth + d3.round(refWidth / 2);
		if (refX - 11 < otherX || refX - 11 < altX) {
			refX = refX + 10;
		}
		g.append("text")
			   .attr("x", refX)
			   .attr("y", "9")
			   .attr("text-anchor", separateLineForLabel ? "start" : "middle")
			   .attr("class", "ref-count")
			   .text(genotypeRefCount);
	}
	 
}


