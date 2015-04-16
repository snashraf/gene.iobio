//
// Global Variables
//
//var geneiobio_server = "http://localhost:3000/";
var geneiobio_server = "http://geneinfo.iobio.io/";


// Engine for gene search suggestions
var gene_engine = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  local: [],
  limit: 10
});

// the variant filter panel
var trackLegendTemplate = Handlebars.compile($('#track-legend-template').html());	
var variantCardTemplate = Handlebars.compile($('#variant-card-template').html());

// A view finder, showing a single transcript which
// is a union of all transcripts.  This chart
// allows the user to select a sub-region of the
// gene and view all of the tracks at this zoomed in
// level.
var viewFinderChart = null;

// The x-axis for the zoomed-in region (the region
// selected in the view finder.)
var zoomRegionChart = null;

// The selected (sub-) region of the gene.  Null
// when there is not an active selection.
var regionStart = null;
var regionEnd = null;

// Transcript data and chart
var gene = '';
var selectedTranscript = null;
var transcriptChart =  null;
var transcriptViewMode = "single";
var transcriptMenuChart = null;
var transcriptPanelHeight = null;
var transcriptCollapse = true;

// filters

// Filters
clickedAnnotIds = new Object();
var annotsToInclude = new Object();
var afMin = null;
var afMax = null;
var coverageMin = 10;



// feature matrix (ranked variants)
var featureVcfData = null;
var sourceVcfData = null;
var featureMatrix  = null;

var showClinVarSymbol = function (selection) {
	selection.append("g")
	         .attr("transform", "translate(7,7)")
	         .append("use")
	         .attr("xlink:href", "#clinvar-symbol")
	         .attr("width", "16")
	         .attr("height", "16")
	         .style("pointer-events", "none")
	         .style("fill", function(d,i) {


	         	if (selection.datum().clazz == 'clinvar_path') {
	         		return "#ad494A";
	         	} else if (selection.datum().clazz == 'clinvar_uc') {
	         		return "rgba(231, 186, 82, 1)";
	         	} else if (selection.datum().clazz == 'clinvar_benign') {
	         		return "rgba(181, 207, 107, 1)";
	         	} else if (selection.datum().clazz == 'clinvar_other') {
	         		return "rgb(189, 189, 189)";
	         	} else if (selection.datum().clazz == 'clinvar_cd') {
	         		return "rgb(150, 150, 150)";
	         	}
	         });
};
var showAfExacSymbol = function(selection) {
	selection.append("g")
	         .attr("class", selection.datum().clazz)
	         .attr("transform", "translate(7,7)")
	         .append("use")
	         .attr("xlink:href", "#af-symbol")
	         .style("pointer-events", "none")
	         .style("fill", function(d,i) {


	         	if (selection.datum().clazz == 'afexac_unique') {
	         		return "rgb(215,48,39)";
	         	} else if (selection.datum().clazz == 'afexac_uberrare') {
	         		return "rgb(252,141,89)";
	         	} else if (selection.datum().clazz == 'afexac_superrare') {
	         		return "rgb(203, 174, 95);";
	         	} else if (selection.datum().clazz == 'afexac_rare') {
	         		return "rgb(158, 186, 194)";
	         	} else if (selection.datum().clazz == 'afexac_uncommon') {
	         		return "rgb(145,191,219)";
	         	} else if (selection.datum().clazz == 'afexac_common') {
	         		return "rgb(69,117,180)";
	         	}
	         })
	         .attr("width", function(d,i) {
	         	if (selection.datum().clazz == 'afexac_unique') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'afexac_uberrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_superrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_rare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_uncommon') {
	         		return "16";
	         	} else if (selection.datum().clazz == 'afexac_common') {
	         		return "20";
	         	}
	         })
	         .attr("height", function(d,i) {
	         	if (selection.datum().clazz == 'afexac_unique') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'afexac_uberrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_superrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_rare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'afexac_uncommon') {
	         		return "16";
	         	} else if (selection.datum().clazz == 'afexac_common') {
	         		return "20";
	         	}
	         });
};
var showAf1000gSymbol = function(selection) {
	selection.append("g")
	         .attr("class", selection.datum().clazz)
	         .attr("transform", "translate(7,7)")
	         .append("use")
	         .attr("xlink:href", "#af-symbol")
	         .style("pointer-events", "none")
	         .style("fill", function(d,i) {


	         	if (selection.datum().clazz == 'af1000g_unique') {
	         		return "rgb(215,48,39)";
	         	} else if (selection.datum().clazz == 'af1000g_uberrare') {
	         		return "rgb(252,141,89)";
	         	} else if (selection.datum().clazz == 'af1000g_superrare') {
	         		return "rgb(203, 174, 95);";
	         	} else if (selection.datum().clazz == 'af1000g_rare') {
	         		return "rgb(158, 186, 194)";
	         	} else if (selection.datum().clazz == 'af1000g_uncommon') {
	         		return "rgb(145,191,219)";
	         	} else if (selection.datum().clazz == 'af1000g_common') {
	         		return "rgb(69,117,180)";
	         	}
	         })
	         .attr("width", function(d,i) {
	         	if (selection.datum().clazz == 'af1000g_unique') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'af1000g_uberrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_superrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_rare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_uncommon') {
	         		return "16";
	         	} else if (selection.datum().clazz == 'af1000g_common') {
	         		return "20";
	         	}
	         })
	         .attr("height", function(d,i) {
	         	if (selection.datum().clazz == 'af1000g_unique') {
	         		return "10";
	         	} else if (selection.datum().clazz == 'af1000g_uberrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_superrare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_rare') {
	         		return "12";
	         	} else if (selection.datum().clazz == 'af1000g_uncommon') {
	         		return "16";
	         	} else if (selection.datum().clazz == 'af1000g_common') {
	         		return "20";
	         	}
	         });
};
var showRecessiveSymbol = function (selection) {
	selection.append("g")
	         .attr("transform", "translate(0,3)")
	         .append("use")
	         .attr("xlink:href", '#recessive-symbol')
	         .style("pointer-events", "none");

};
var showDeNovoSymbol = function (selection) {
	selection.append("g")
	         .attr("transform", "translate(0,3)")
	         .append("use")
	         .attr("xlink:href", '#denovo-symbol')
	         .style("pointer-events", "none");
	
};
var showNoInheritSymbol = function (selection) {
	
};
var showImpactSymbol = function(selection) {
	selection.append("g")
	         .attr("transform", "translate(9,9)")
	         .append("rect")
	         .attr("width", 10)
	         .attr("height", 10)
	         .attr("class", "filter-symbol " + selection.datum().clazz)
	         .style("pointer-events", "none");

}
var clinvarMap     = {  
						'pathogenic'            : {value: 1, clazz: 'clinvar_path', symbolFunction: showClinVarSymbol},
                        'likely_pathogenic'     : {value: 2, clazz: 'clinvar_path', symbolFunction: showClinVarSymbol},
                        'uncertain_significance': {value: 3, clazz: 'clinvar_uc', symbolFunction: showClinVarSymbol},
                        'benign'                : {value: 4, clazz: 'clinvar_benign', symbolFunction: showClinVarSymbol},
                        'likely_benign'         : {value: 5, clazz: 'clinvar_benign', symbolFunction: showClinVarSymbol},
                        'drug_response'         : {value: 6, clazz: 'clinvar_other', symbolFunction: showClinVarSymbol},
                        'confers_sensivity'     : {value: 7, clazz: 'clinvar_other', symbolFunction: showClinVarSymbol},
                        'risk_factor'           : {value: 8, clazz: 'clinvar_other', symbolFunction: showClinVarSymbol},
                        'other'                 : {value: 9, clazz: 'clinvar_other', symbolFunction: showClinVarSymbol},
                        'association'           : {value: 10, clazz: 'clinvar_other', symbolFunction: showClinVarSymbol},
                        'protective'            : {value: 11, clazz: 'clinvar_other', symbolFunction: showClinVarSymbol},
                        'conflicting_data_from_submitters': {value: 12, clazz: 'clinvar_cd', symbolFunction: showClinVarSymbol},
                        'not_provided'          : {value: 13, clazz: 'clinvar_other', symbolFunction: showClinVarSymbol},
                        'none'                  : {value: 14, clazz: ''}
                     };
var impactMap      = {  HIGH:     {value: 1, clazz: 'impact_HIGH',     symbolFunction: showImpactSymbol},    
                        MODERATE: {value: 2, clazz: 'impact_MODERATE', symbolFunction: showImpactSymbol},  
                        MODIFIER: {value: 3, clazz: 'impact_MODIFIER', symbolFunction: showImpactSymbol},
                        LOW:      {value: 4, clazz: 'impact_LOW',      symbolFunction: showImpactSymbol}
                     };
var inheritanceMap = {  denovo:    {value: 1, clazz: 'denovo',    symbolFunction: showDeNovoSymbol},  
                        recessive: {value: 2, clazz: 'recessive', symbolFunction: showRecessiveSymbol},
                        none:      {value: 3, clazz: 'noinherit', symbolFunction: showNoInheritSymbol}
                     };
// For af range, value must be > min and <= max
var afExacMap      = [ {min: -1.1,  max: +0,     value: +2,  clazz: 'afexac_unique',     symbolFunction: showAfExacSymbol},	
                       {min: +0,    max: +.0001, value: +3,  clazz: 'afexac_uberrare',   symbolFunction: showAfExacSymbol},	
                       {min: +0,    max: +.001,  value: +4,  clazz: 'afexac_superrare',  symbolFunction: showAfExacSymbol},	
                       {min: +0,    max: +.01,   value: +5,  clazz: 'afexac_rare',       symbolFunction: showAfExacSymbol},	
                       {min: +.01,  max: +.05,   value: +6,  clazz: 'afexac_uncommon',   symbolFunction: showAfExacSymbol},	
                       {min: +.05,  max: +1,     value: +7,  clazz: 'afexac_common',     symbolFunction: showAfExacSymbol},	
                      ];
var af1000gMap      = [ {min: -1.1, max: +0,     value: +2,  clazz: 'af1000g_unique',     symbolFunction: showAf1000gSymbol},	
                       {min: +0,    max: +.0001, value: +3,  clazz: 'af1000g_uberrare',   symbolFunction: showAf1000gSymbol},	
                       {min: +0,    max: +.001,  value: +4,  clazz: 'af1000g_superrare',  symbolFunction: showAf1000gSymbol},	
                       {min: +0,    max: +.01,   value: +5,  clazz: 'af1000g_rare',       symbolFunction: showAf1000gSymbol},	
                       {min: +.01,  max: +.05,   value: +6,  clazz: 'af1000g_uncommon',   symbolFunction: showAf1000gSymbol},	
                       {min: +.05,  max: +1,     value: +7,  clazz: 'af1000g_common',     symbolFunction: showAf1000gSymbol},	
                      ];                      


var matrixRows = [
	{name:'Impact'              ,order:0, index:0, match: 'exact', attribute: 'impact',      map: impactMap},
	{name:'ClinVar'             ,order:1, index:1, match: 'exact', attribute: 'clinVarClinicalSignificance',     map: clinvarMap },
	{name:'Inheritance'         ,order:2, index:2, match: 'exact', attribute: 'inheritance', map: inheritanceMap},
	{name:'AF (1000G)'          ,order:3, index:3, match: 'range', attribute: 'af1000G',     map: af1000gMap},
	{name:'AF (ExAC)'           ,order:4, index:4, match: 'range', attribute: 'afExAC',      map: afExacMap}
];

var featureUnknown = 99;

var vcf1000G= null;
var vcfExAC = null;
var vcf1000GData = null;
var vcfExACData = null;
var vcf1000GUrl = "http://s3.amazonaws.com/vcf.files/ALL.wgs.phase3_shapeit2_mvncall_integrated_v5.20130502.sites.vcf.gz";
var vcfExACUrl  = "http://s3.amazonaws.com/vcf.files/ExAC.r0.2.sites.vep.vcf.gz";


// Format the start and end positions with commas
var formatRegion = d3.format(",");

// variant card
var variantCards = [];

// The smaller the region, the wider we can
// make the rect of each variant
var widthFactors = [
	{'regionStart':     0, 'regionEnd':    8000,  'factor': 6},
	{'regionStart':  8001, 'regionEnd':   10000,  'factor': 5},
	{'regionStart': 10001, 'regionEnd':   15000,  'factor': 4},
	{'regionStart': 15001, 'regionEnd':   20000,  'factor': 3},
	{'regionStart': 20001, 'regionEnd':   30000,  'factor': 2},
	{'regionStart': 30001, 'regionEnd': 90000000,  'factor': 1},
];


$(document).ready(function(){
	init();
});


function init() {
	var me = this;

    $.material.init();

    $('#filter-panel').html(trackLegendTemplate());

	loadGeneWidget();
	$('#bloodhound .typeahead').focus();

	// listen for enter key on af amount input range
	$('#af-amount-start').on('keydown', function() {
		if(event.keyCode == 13) {
			filterVariants();
	    }
	});
	$('#af-amount-end').on('keydown', function() {
		if(event.keyCode == 13) {
			filterVariants();
	    }
	});
	// listen for enter key on min coverage
	$('#coverage-min').on('keydown', function() {
		if(event.keyCode == 13) {
			filterVariants();
	    }
	});

	
	
	// Create transcript chart
	transcriptChart = geneD3()
	    .width(1000)
	    .widthPercent("100%")
	    .heightPercent("100%")
	    .margin({top:20, right: 4, bottom: 0, left: 4})
	    .showXAxis(true)
	    .showBrush(true)
	    .trackHeight(16)
	    .cdsHeight(12)
	    .showLabel(false)
	    .on("d3brush", function(brush) {
	    	if (!brush.empty()) {
				regionStart = d3.round(brush.extent()[0]);
				regionEnd   = d3.round(brush.extent()[1]);
				if (!selectedTranscript) {
					selectedTranscript = window.gene.transcripts.length > 0 ? window.gene.transcripts[0] : null;
				}
			} else {
				regionStart = window.gene.start;
				regionEnd   = window.gene.end;
			}

			variantCards.forEach(function(variantCard) {
		    	variantCard.onBrush(brush);
			});

		});	

    transcriptMenuChart = geneD3()
	    .width(600)
	    .margin({top: 5, right: 5, bottom: 5, left: 120})
	    .showXAxis(false)
	    .showBrush(false)
	    .trackHeight(12)
	    .cdsHeight(8)
	    .showLabel(true)
	    .on("d3selected", function(d) {
	    	window.selectedTranscript = d;
	    	showTranscripts();

			variantCards.forEach(function(variantCard) {
		    	variantCard.showBamDepth();
			});

	    });

	featureMatrix = featureMatrixD3()
					    .margin({top: 0, right: 40, bottom: 4, left: 24})
					    .cellSize(30)
					    .columnLabelHeight(100)
					    .rowLabelWidth(100)
					    .tooltipHTML(variantTooltipHTML)
					    .on('d3click', function(variant) {
					    	if (variantCards.length > 0) {
						    	variantCards[0].highlightVariants(d3.selectAll("#feature-matrix .col.current").data());
					    	}
					    })
					     .on('d3mouseover', function(variant) {
					    })
					    .on('d3mouseout', function() {
					    })
					    .on('d3rowup', function(i) {
					    	var column = null;
					    	var columnPrev = null;
					    	matrixRows.forEach(function(col) {
					    		if (col.order == i) {
					    			column = col;
					    		} else if (col.order == i - 1) {
					    			columnPrev = col;
					    		}
					    	});
					    	if (column && columnPrev) {
					    		column.order = column.order - 1;
					    		columnPrev.order = columnPrev.order + 1;
					    	}
					    	fillFeatureMatrix();
					    	
					    })
					    .on('d3rowdown', function(i) {
					    	var column = null;
					    	var columnNext = null;
					    	matrixRows.forEach(function(col) {
					    		if (col.order == i) {
					    			column = col;
					    		} else if (col.order == i + 1) {
					    			columnNext = col;
					    		}
					    	});
					    	if (column && columnNext) {
					    		column.order = column.order + 1;
					    		columnNext.order = columnNext.order - 1;
					    	}
					    	fillFeatureMatrix();

					    });

	// Initialize variant legend
	initFilterTrack();

	// Initialize transcript view buttons
	initTranscriptControls();

	initDataSourceDialog();

	// Autoload data specified in url
	loadUrlSources();	
}

function onCollapseTranscriptPanel() {
	transcriptCollapse = !transcriptCollapse;
	d3.select('#track-section').style("padding-top", transcriptCollapse ? transcriptPanelHeight + "px" : "89" + "px");

}

function initDataSourceDialog() {
	// listen for data sources open event
	$( "#datasource-dialog" ).on('shown.bs.modal', function (e) {
		initVariantCards();

  	});
}

function moveDataSourcesButton() {
	$('#add-datasource-button').css('display', 'none');
	$('#datasource-button').css('visibility', 'visible');
}

function loadUrlSources() {
	var gene = getUrlParameter('gene');
	if (gene != undefined) {
		// move data source button
		moveDataSourcesButton();
		// load gene
		// For some reason, this trigger event is fired twice, so keep track of whether it
		// has already been fired so that we don't load data sources twice.
		var loadCount = 0;
		$('#bloodhound .typeahead.tt-input').val(gene).trigger('typeahead:selected', {"name": gene, callback:function(){
				if (loadCount == 0) {
					// run after gene has been loaded
					// initialize variant cards
					initVariantCards();
					var addVC = false;

					// load bam and vcf sources
					// get all bam and vcf url params in hash
					var bam  = getUrlParameter(/bam*/);
					var vcf  = getUrlParameter(/vcf*/);	
					var rel  = getUrlParameter(/rel*/);
					var dsname = getUrlParameter(/name*/);	
					// load all bams and vcfs that have a bam pair
					if (bam != undefined) {
						Object.keys(bam).forEach(function(name) {
							if (addVC) addVariantCard();
							else addVC = true;
							$('#bam-url-input').val(bam[name])
							onBamUrlEntered();

							// check if there is a corresponding vcf file
							var vcfName = 'vcf' + name.replace('bam','');
							if( vcf && vcf[vcfName] != undefined ) {
								$('#url-input').val(vcf[vcfName]);
								delete vcf[vcfName];
								onVcfUrlEntered();
							}
												
							
							variantCards.forEach( function(variantCard) {							
									variantCard.showDataSources(variantCard.getName());						
							});				
						})
					}		
					// load vcfs that don't have a bam pair
					if (vcf != undefined) {						
						Object.keys(vcf).forEach(function(name) {
							if (addVC) addVariantCard();
							else addVC = true;
							$('#url-input').val(vcf[name]);
							onVcfUrlEntered();
							
							variantCards.forEach( function(variantCard) {							
								variantCard.showDataSources(variantCard.getName());						
							});				
						});
					}
					if ( rel != undefined) {
						var cardIndex = 0;
						Object.keys(rel).forEach(function(idx) {
							$('#card-index').val(cardIndex);
							$('#datasource-relationship').val(rel[idx]);
							setDataSourceRelationship();
							cardIndex++;
						});
						variantCards.forEach( function(variantCard) {							
							variantCard.showDataSources(variantCard.getName());						
						});		
					}
					if ( dsname != undefined) {
						var cardIndex = 0;
						Object.keys(dsname).forEach(function(idx) {
							$('#card-index').val(cardIndex);
							$('#datasource-name').val(dsname[idx]);
							setDataSourceName();
							cardIndex++;
						});
						variantCards.forEach( function(variantCard) {							
							variantCard.showDataSources(variantCard.getName());						
						});							
					}
					loadCount++;

				}

			}
		});		
	}
}

function selectVariantCard(cardIndex) {
	$('#datasource-dialog #card-index').val(+cardIndex);
	$('#variant-card-buttons a.selected').removeClass("selected");
	$('#variant-card-button-' + +cardIndex).addClass("selected");
	initDataSourceFields();

}

function initVariantCards() {
	if (variantCards.length == 0) {
		addVariantCard();
		$('#datasource-dialog #card-index').val(0);

	} else {
		$('#variant-card-buttons').removeClass("hide");
	}
	
	initDataSourceFields();
}

function initDataSourceFields() {
	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];

	$('#datasource-dialog .material-dropdown li').removeClass('disabled')
	if (cardIndex > 0) {
    	$('#datasource-dialog .material-dropdown li[value="proband"]').addClass('disabled')    	
    } else {    	
    	$('#datasource-dialog .material-dropdown li[value!="proband"]').addClass('disabled')    	
    }


	if (variantCard.getBamName().indexOf("http") == 0) {
		$('#datasource-dialog #bam-file-info').addClass("hide");
		$('#datasource-dialog #bam-url-input').removeClass("hide");
		$('#datasource-dialog #bam-url-input').val(variantCard.getBamName());
	} else {
		$('#datasource-dialog #bam-url-input').addClass("hide");
		$('#datasource-dialog #bam-file-info').removeClass("hide");
		$('#datasource-dialog #bam-file-info').val(variantCard.getBamName());
	}

	if (variantCard.getVcfName().indexOf("http") == 0) {
		$('#datasource-dialog #vcf-file-info').addClass("hide");
		$('#datasource-dialog #url-input').removeClass("hide");
		$('#datasource-dialog #url-input').val(variantCard.getVcfName());
	} else {
		$('#datasource-dialog #url-input').addClass("hide");
		$('#datasource-dialog #vcf-file-info').removeClass("hide");
		$('#datasource-dialog #vcf-file-info').val(variantCard.getVcfName());
	}	
	$('#datasource-dialog #datasource-name').val(variantCard.getName());
	var rel = variantCard.getRelationship();	
	$('.material-dropdown li[value="' + rel + '"]').click();	
}

function initTranscriptControls() {

	$('#transcript-btn-group').data('open', false);

	$('#transcript-dropdown-button').click(function () {
        if ($('#transcript-btn-group').data('open')) {
            $('#transcript-btn-group').data('open', false);
            onCloseTranscriptMenuEvent();
        } else {
        	$('#transcript-btn-group').data('open', true);        	
        }
    });

    $(document).click(function () {
        if ($('#transcript-btn-group').data('open')) {
            $('#transcript-btn-group').data('open', false);
            onCloseTranscriptMenuEvent();
        }
    });
}

function onCloseTranscriptMenuEvent() {
	if (selectedTranscript.transcript_id != transcriptMenuChart.selectedTranscript().transcript_id) {
		d3.selectAll("#gene-viz .transcript").remove();
	 	selectedTranscript = transcriptMenuChart.selectedTranscript();
	 	loadTracksForGene();
	 }
}

function getCanonicalTranscript() {
	var canonical;
	var maxCdsLength = 0;
	window.gene.transcripts.forEach(function(transcript) {
		var cdsLength = 0;
		transcript.features.forEach(function(feature) {
			if (feature.feature_type == 'CDS') {
				cdsLength += Math.abs(parseInt(feature.end) - parseInt(feature.start));
			}
		})
		if (cdsLength > maxCdsLength) {
			maxCdsLength = cdsLength;
			canonical = transcript;
		}
	})
	return canonical;
}


function clearFilters() {
	clickedAnnotIds = [];
	annotsToInclude = [];
	d3.selectAll('#filter-track .impact').classed('current', false);
	d3.selectAll('#filter-track .effect').classed('current', false);
	d3.selectAll('#filter-track .type').classed('current', false);
	d3.selectAll('#filter-track .zygosity').classed('current', false);
	$('af-amount-start').val(0);
	$('af-amount-end').val(100);
	$('coverage-min').val('');
}


function initFilterTrack() {


	d3.selectAll(".type, .impact, .effectCategory, .zygosity, .afexaclevel, .af1000glevel, .inheritance, .clinvar")
	  .on("mouseover", function(d) {  	  	
		var id = d3.select(this).attr("id");

		d3.selectAll(".variant")
		   .style("opacity", .1);

	    d3.selectAll(".variant")
	      .filter( function(d,i) {
	      	var theClasses = d3.select(this).attr("class");
	    	if (theClasses.indexOf(id) >= 0) {
	    		return true;
	    	} else {
	    		return false;
	    	}
	      })
	      .style("opacity", 1);
	  })
	  .on("mouseout", function(d) {
	  	d3.selectAll(".variant")
		   .style("opacity", 1);
	  })
	  .on("click", function(d) {
	  	var on = null;
	  	if (d3.select(this).attr("class").indexOf("current") >= 0) {
	  		on = false;
	  	} else {
	  		on = true;
	  	}
	  	var schemeClass = d3.select(this).attr("class");
	  	// strip out extraneous 'no color' and 'current' class
	  	// so that we are left with the attribute name of the
	  	// annotation we will be filtering on.
	  	if (schemeClass.indexOf('nocolor') >= 0) {
	  		var tokens = schemeClass.split(' ');
	  		tokens.forEach(function(clazz) {
	  			if (clazz != 'nocolor') {
	  				schemeClass = clazz;
	  			}
	  		})
	  	}
	  	if (schemeClass.indexOf('current') >= 0) {
	  		var tokens = schemeClass.split(' ');
	  		tokens.forEach(function(clazz) {
	  			if (clazz != 'current') {
	  				schemeClass = clazz;
	  			}
	  		})
	  	}


	  	// Remove from or add to list of clicked ids
	  	window.clickedAnnotIds[d3.select(this).attr("id")] = on;
	  	window.annotsToInclude[d3.select(this).attr("id")] = {'key':   schemeClass , 
	  														  'value': d3.select(this).attr("id"),  
	  														  'state': on};

	  	d3.select(this).classed("current", on);
	  	filterVariants();
	  });

	  d3.selectAll('#impact-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", true);
	    	d3.select('#effect-scheme' ).classed("current", false);

	    	d3.selectAll(".impact").classed("nocolor", false);
	    	d3.selectAll(".effectCategory").classed("nocolor", true);

			variantCards.forEach(function(variantCard) {
				variantCard.variantClass(classifyByImpact);
		    	if (variantCard.getCardIndex() == 0) {
		    		filterVariants();
				}

			});


	    });
	  d3.selectAll('#effect-scheme')
	    .on("click", function(d) {
	    	d3.select('#impact-scheme').classed("current", false);
	    	d3.select('#effect-scheme' ).classed("current", true);


	    	d3.selectAll(".impact").classed("nocolor", true);
	    	d3.selectAll(".effectCategory").classed("nocolor", false);

			variantCards.forEach(function(variantCard) {
		    	variantCard.variantClass(classifyByEffect);
		    	if (variantCard.getCardIndex() == 0) {
		    		filterVariants();
				}
			});


	    });
	   d3.selectAll('#afexac-scheme')
	    .on("click", function(d) {
	    	d3.select('#afexac-scheme' ).classed("current", true);
	    	d3.select('#af1000g-scheme' ).classed("current", false);

	    	d3.selectAll(".afexaclevel").classed("nocolor", false);
	    	d3.selectAll(".af1000glevel").classed("nocolor", true);

	    });
	   d3.selectAll('#af1000g-scheme')
	    .on("click", function(d) {
	    	d3.select('#afexac-scheme' ).classed("current", false);
	    	d3.select('#af1000g-scheme' ).classed("current", true);

	    	d3.selectAll(".afexaclevel").classed("nocolor", true);
	    	d3.selectAll(".af1000glevel").classed("nocolor", false);

	    });
	  
}

function filterVariants() {
	if (variantCards.length > 0) {
  		var filteredVcfData = variantCards[0].filterVariants();
  		variantCards[0].fillVariantChart(filteredVcfData, regionStart, regionEnd);



  		var filteredFBData = variantCards[0].filterFreebayesVariants();
  		if (filteredFBData != null) {
	  		variantCards[0].fillFreebayesChart(filteredFBData, regionStart, regionEnd, true);
  		}

	 }
}

function updateUrl(paramName, value) {
	var params = {};
	// turn params into hash
	window.location.search.split('&').forEach(function(param){
		if (param != '') {
			param = param.split('?').length == 1 ? param : param.split('?')[1];
			var fields = param.split('=');
			params[fields[0]] = fields[1];
		}
	});
	params[paramName] = value;
	var search = [];
	Object.keys(params).forEach(function(key) {
		search.push(key + '=' + params[key]);
	})
	window.history.pushState({'index.html' : 'bar'},null,'?'+search.join('&'));	
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    var hits = {};
    for (var i = 0; i < sURLVariables.length; i++) 
    {    	
        var sParameterName = sURLVariables[i].split('=');        
        if (typeof sParam == 'string' || sParam instanceof String) {
	        if (sParameterName[0] == sParam) 
	        {
	            return sParameterName[1];
	        }
	    } else {
	    	var matches = sParameterName[0].match(sParam);
	    	if ( matches != undefined && matches.length > 0 ) {
	    		hits[sParameterName[0]] = sParameterName[1];
	    	}
	    }
    }
    if (Object.keys(hits).length == 0)
    	return undefined;
    else
    	return hits;
}

function classifyByImpact(d) {
	var impacts = "";
	var colorimpacts = "";
	var effects = "";
	
	for (key in d.impact) {
	  impacts += " " + key;
	  colorimpacts += " " + 'impact_'+key;
	}
	for (key in d.effectCategory) {
	  effects += " " + key;
	}
	
	return  'variant ' + d.type.toLowerCase() + ' ' + d.zygosity.toLowerCase() + ' ' + d.inheritance.toLowerCase() + ' ' + d.afexaclevel + ' ' + d.af1000glevel + ' ' + d.clinvar + ' ' + impacts + effects + ' ' + d.consensus + ' ' + colorimpacts; 
}
function classifyByEffect(d) { 
	var effects = "";
	var coloreffects = "";
	var impacts = "";
	
    for (key in d.effectCategory) {
      effects += " " + key;
      coloreffects += " " + 'effect_'+key;
    }
    for (key in d.impact) {
      impacts += " " + key;
    }
    
    return  'variant ' + d.type.toLowerCase() + ' ' + d.zygosity.toLowerCase() + ' ' + + d.inheritance.toLowerCase() + ' ' + d.afexaclevel+ ' ' + d.af1000glevel + ' ' + d.clinvar + ' ' + effects + impacts + ' ' + d.consensus + ' ' + coloreffects; 
}

function applyVariantFilters() {

	// Find out if there are any filters set
  	var filtersApply = false;
  	for (key in clickedAnnotIds) {
		var on = clickedAnnotIds[key];
		if (on ) {
			filtersApply = true;
		}
	}

	// If there existing filters set, take
	// opacity of previous hover down to .1
	if (filtersApply) {

	  	d3.selectAll(".variant")
	  	   .filter( function(d,i) {
	    	var theClasses = d3.select(this).attr("class");
	    	var theParentClasses = d3.select(this.parentNode).attr("class");
	    	
	    	var aClickedId = false;
    		if (theParentClasses.indexOf("impact" ) >= 0 
    			|| theParentClasses.indexOf("effect") >= 0 
    			|| theParentClasses.indexOf("zygosity") >= 0 ) {
    			return false;
    		} else {
		    	for (key in clickedAnnotIds) {
	    			var on = clickedAnnotIds[key];
	    			if (on && theClasses.indexOf(key) >= 0) {
	    				aClickedId = true;
	    			}
	    		}
	    		if (aClickedId) {
	    			false
	    		} else {
		    		return true;
	    		}
    		}
	      })
	      .style("opacity", .1);
	     

	// Otherwise, if no filters exist, everything
	// is set back to opacity of 1.
	} else {
    	d3.selectAll(".variant").style("opacity", 1);
	}
}

function loadGeneWidget() {
	// kicks off the loading/processing of `local` and `prefetch`
	gene_engine.initialize();
	
	 	
	var typeahead = $('#bloodhound .typeahead').typeahead({
	  hint: true,
	  highlight: true,
	  minLength: 1
	},
	{
	  name: 'name',
	  displayKey: 'name',
	  templates: {
	    empty: [
	      '<div class="empty-message">',
	      'no genes match the current query',
	      '</div>'
	    ].join('\n'),
	    suggestion: Handlebars.compile('<p><strong>{{name}}</strong></p>')
	  },
	  // `ttAdapter` wraps the suggestion engine in an adapter that
	  // is compatible with the typeahead jQuery plugin
	  source: gene_engine.ttAdapter()
	});
	
	typeahead.on('typeahead:selected',function(evt,data){		
		if (data.name.indexOf(':') != -1) var searchType = 'region';
		else var searchType = 'gene';
		var url = geneiobio_server + 'api/' + searchType + '/' + data.name;

		
		$.ajax({
		    url: url,
		    jsonp: "callback",
		    type: "GET",
		    dataType: "jsonp",
		    success: function( response ) {

		    	// We have successfully return the gene model data.
		    	// Load all of the tracks for the gene's region.
		    	window.gene = response[0];		    
		    	// set all searches to correct gene	
		    	$('.typeahead.tt-input').val(window.gene.gene_name);
		    	moveDataSourcesButton();
		    	
		    	window.selectedTranscript = null;
		    	loadTracksForGene();
		    	// add gene to url params
		    	updateUrl('gene', window.gene.gene_name);
		    	if(data.callback != undefined) data.callback();

	       	},
		    error: function( xhr, status, errorThrown ) {
		        
		        console.log( "Error: " + errorThrown );
		        console.log( "Status: " + status );
		        console.dir( xhr );
		    },
		    complete: function( xhr, status ) {
		    }
		});
	});	

	// check if gene_list is stored locally	
	var gene_list = localStorage.getItem("gene_list");
	if ( gene_list === null ) {
		// fetch gene list from server			
		$.ajax({url: 'gene_names.json'}).done(function(data, status, res) {
			gene_engine.add($.map(data, function(gene) { return { name: gene }; }));
			localStorage.setItem('gene_list', JSON.stringify(data));
		})
	} else {
		// grab gene list from localStorage			
		gene_engine.add(
			$.map(JSON.parse(gene_list), function(gene) { return { name: gene }; })
		);
	}	


}

/* 
* A gene has been selected.  Load all of the tracks for the gene's region.
*/
function loadTracksForGene() {

	regionStart = null;
	regionEnd = null;
	window.vcf1000GData = null;
	window.vcfExACData = null;

	$('#transcript-card').removeClass("hide");

    $('#gene-track').removeClass("hide");
    $('#view-finder-track').removeClass("hide");
	$('#datasource-button').css("visibility", "visible");
	$('#transcript-btn-group').removeClass("hide");

	d3.select("#region-chart .x.axis .tick text").style("text-anchor", "start");
	var h = d3.select("#nav-section").node().offsetHeight;
	d3.select('#track-section').style("padding-top", h + "px");


	d3.select('#impact-scheme').classed("current", true);
	d3.select('#effect-scheme' ).classed("current", false);
	d3.selectAll(".impact").classed("nocolor", false);
	d3.selectAll(".effectCategory").classed("nocolor", true);
	
	gene.regionStart = formatRegion(window.gene.start);
	gene.regionEnd   = formatRegion(window.gene.end);

    $('#gene-name').text(window.gene.gene_name);   
    $('#gene-region-info').text(window.gene.chr + ' ' + window.gene.regionStart + "-" + window.gene.regionEnd);


   	// This will be the view finder, allowing the user to select
	// a subregion of the gene to zoom in on the tracks.
	// ??????  TODO:  Need to figure out the cannonical transcript.	
	var transcript = [];
	if (window.gene.transcripts && window.gene.transcripts.length > 0 ) {
		transcript = getCanonicalTranscript();
	}


	// Load the read coverage and variant charts.  If a bam hasn't been
	// loaded, the read coverage chart and called variant charts are
	// not rendered.  If the vcf file hasn't been loaded, the vcf variant
	// chart is not rendered.
	showTranscripts();
	
	variantCards.forEach(function(variantCard) {
		variantCard.loadTracksForGene(classifyByImpact);
	});

	transcriptPanelHeight = d3.select("#nav-section").node().offsetHeight;


	
}

function showTranscripts(regionStart, regionEnd) {

	var transcripts = null;


	if (regionStart && regionEnd) {
		transcriptChart.regionStart(regionStart);
		transcriptChart.regionEnd(regionEnd);
		// ???????  TODO:
		// Need change the regionstart and region end of transcripts
		// to stay within selected region.  
		transcripts = window.gene.transcripts.filter(function(d) {
			if (d.end < regionStart && d.start > regionEnd ) {
				return false;
			} else {				
				return true;
			}
		});

	} else {
		transcriptChart.regionStart(+window.gene.start);
		transcriptChart.regionEnd(+window.gene.end);
		transcripts = window.gene.transcripts;

		// TODO:  Need a way of selecting the transcript that you want to
		// use when determining the variant's effect and impact (snpEff annotation)
		// For now, let's just grab the first one in the list.
		if (!selectedTranscript) {
			selectedTranscript = getCanonicalTranscript();
		}
	}


	// Show the gene transcripts.
    // Compress the tracks if we have more than 10 transcripts
    if (transcripts.length > 10) {
    	transcriptChart.trackHeight(10);
    	transcriptChart.cdsHeight(8);
    } else {
    	transcriptChart.trackHeight(16);
    	transcriptChart.cdsHeight(12);
    }

    if (transcriptViewMode == "single") {
    	transcripts = [selectedTranscript];
    	var cache = $('#transcript-dropdown-button').children();
   		$('#transcript-dropdown-button').text(selectedTranscript.transcript_id).append(cache);
   		getTranscriptSelector(selectedTranscript).attr("class", "transcript selected");
	} 


	selection = d3.select("#gene-viz").datum(transcripts);    
	transcriptChart(selection);

	selection = d3.select("#transcript-menu-item").datum(window.gene.transcripts);
	transcriptMenuChart(selection);

	d3.select("#gene-viz .x.axis .tick text").style("text-anchor", "start");

	// update track starting position after transcripts have been rendered
	var h = d3.select("#nav-section").node().offsetHeight;
	d3.select('#track-section').style("padding-top", h + "px");
}

function getTranscriptSelector(selectedTranscript) {
	var selector = '#transcript-menu-item #transcript_' + selectedTranscript.transcript_id.split(".").join("_");
	return $(selector);
}

function addVariantCard() {

	var variantCard = new VariantCard();
	variantCards.push(variantCard);	

	var cardIndex = variantCards.length - 1;
	var defaultName = "sample " + (+cardIndex + 1);
	variantCard.setName(defaultName);

	// TODO:  Should really test to make sure that first card is proband, but
	var cardSelectorString = null;
	if (cardIndex == 0) {
		$('#proband-variant-card').append(variantCardTemplate());  
		cardSelectorString = "#proband-variant-card .variant-card:eq(" + cardIndex + ")" ;
	} else {
		$('#other-variant-cards').append(variantCardTemplate());  
		cardSelectorString = "#other-variant-cards .variant-card:eq(" + (+cardIndex - 1) + ")" ;
	}

	var d3CardSelector = d3.selectAll(".variant-card").filter(function(d, i) { return i == +cardIndex; });


	variantCard.init($(cardSelectorString), d3CardSelector, cardIndex);


	$('#datasource-dialog #card-index').val(cardIndex);


	$('#datasource-dialog #datasource-name').val(defaultName);
	$('#datasource-dialog #bam-file-info').addClass("hide");
	$('#datasource-dialog #bam-url-input').addClass("hide");
	$('#datasource-dialog #vcf-file-info').addClass("hide");
	$('#datasource-dialog #url-input').addClass("hide");
	$('#datasource-dialog #bam-file-info').val("");
	$('#datasource-dialog #bam-url-input').val("");
	$('#datasource-dialog #vcf-file-info').val("");
	$('#datasource-dialog #url-input').val("");

	$('#datasource-dialog #bam-file-upload').val("");
	$('#datasource-dialog #vcf-file-upload').val("");


    $('#variant-card-buttons')
         .append($("<a></a>")
         .attr("id", "variant-card-button-" + cardIndex)
         .attr("href", "javascript:void(0)")
         .attr("onclick", 'selectVariantCard("'+ cardIndex + '")')
         .attr("class", "btn btn-default")
         .text(defaultName));

    if (cardIndex > 0) {
    	$('#datasource-dialog .material-dropdown li').removeClass('disabled')
    	$('#datasource-dialog .material-dropdown li[value="proband"]').addClass('disabled')
    	$('.material-dropdown li[value="none"]').click();	
    } else {
    	$('.material-dropdown li[value="proband"]').click();	
    }
}


function onBamFileButtonClicked() {	
	$('#datasource-dialog #bam-file-info').removeClass("hide");

	$('#bam-url-input').addClass('hide');
	$('#bam-url-input').val('');
}

function onBamFilesSelected(event) {
	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];
	variantCard.onBamFilesSelected(event);
	variantCard.setDirty();
}


function onBamUrlEntered() {
	$('#bam-url-input').removeClass("hide");

	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];
	variantCard.onBamUrlEntered($('#bam-url-input').val());	
	updateUrl('bam' + cardIndex, $('#bam-url-input').val());
	variantCard.setDirty();
}

function displayBamUrlBox() {
	$('#bam-file-info').addClass('hide');
    $('#bam-file-info').val('');
    $('#datasource-dialog #bam-url-input').removeClass("hide");
    $("#datasource-dialog #bam-url-input").focus();
    $('#datasource-dialog #bam-url-input').val('http://s3.amazonaws.com/iobio/NA12878_S1.bam');
    onBamUrlEntered();
	

}

function displayUrlBox() {
    $('#url-input').val('http://s3.amazonaws.com/iobio/platinum/NA12878.vcf.gz');
	$("#url-input").removeClass('hide');
    $("#url-input").focus();
    $('#datasource-dialog #vcf-file-info').addClass('hide');
    $('#datasource-dialog #vcf-file-info').val('');
    onVcfUrlEntered();
}
function onVcfFileButtonClicked() {	
	$('#datasource-dialog #vcf-file-info').removeClass("hide");

	$('#url-input').addClass('hide');
	$('#url-input').val('');
}

function onVcfFilesSelected(event) {
	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];
	variantCard.onVcfFilesSelected(event);
	variantCard.setDirty();
}

function onVcfUrlEntered() {
	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];

	var vcfUrl = $('#url-input').val();

	variantCard.onVcfUrlEntered(vcfUrl);
	updateUrl('vcf'+cardIndex, vcfUrl);
	variantCard.setDirty();
}


function setDataSourceName() {	
	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];

	var dsName = $('#datasource-name').val();
	variantCard.setName(dsName);
	$('#variant-card-button-' + cardIndex ).text(dsName);
	updateUrl('name' + cardIndex, dsName);

}

function setDataSourceRelationship() {		
	var cardIndex = $('#datasource-dialog #card-index').val();
	var variantCard = variantCards[+cardIndex];

	var dsRelationship = $('#datasource-relationship').val();
	variantCard.setRelationship(dsRelationship);	
	updateUrl('rel' + cardIndex, dsRelationship);
}

function loadNewDataSources() {
	// check if gene is selected
	if(window.gene && window.gene != "") {
		$('#datasource-dialog').modal('hide');
		loadDataSources();	
		// set search box back to no border
		$('#datasource-dialog .twitter-typeahead').css('border', 'none');		
	}
	else {
		$('#datasource-dialog .twitter-typeahead').css('border', '1px solid red');
	}
	
}

function loadDataSources() {	
	// hide add data button
	$('#add-datasource-container').css('display', 'none');

	variantCards.forEach( function(variantCard) {
		if (variantCard.isDirty()) {
			variantCard.loadDataSources(variantCard.getName());
			variantCard.setDirty(false);
		}
	});


}

function showFeatureMatrix(theVariantCard, theVcfData, regionStart, regionEnd) {

	$("#matrix-panel .loader").css("display", "block");
	$("#feature-matrix").addClass("hide");

	sourceVcfData = theVcfData;
	// we need to compare the proband variants to mother and father variants to determine
	// the inheritance mode.  After this completes, we are ready to show the
	// feature matrix.
	$("#matrix-panel .loader-label").text("Comparing variants to family data");

	window.compareVariantsToPedigree(theVcfData, fillFeatureMatrix);

	//_getPopulationVariants(theVariantCard, theVcfData, regionStart, regionEnd, fillFeatureMatrix);	
}


function _getPopulationVariants(theVariantCard, theVcfData, regionStart, regionEnd, callback) {
	if (window.vcf1000GData && window.vcfExACData) {
		var filteredVcf1000GData = {};
		var filteredVcfExACData = {};
		filteredVcf1000GData.features = window.vcf1000GData.features.filter(function(variant) {
			return variant.start >= regionStart && variant.end <= regionEnd;
		});
		filteredVcfExACData.features = window.vcfExACData.features.filter(function(variant) {
			return variant.start >= regionStart && variant.end <= regionEnd;
		});
		compareVariantsToPopulation(theVcfData, filteredVcf1000GData, filteredVcfExACData, callback);

	} else {
		vcf1000G = vcfiobio();
		vcf1000G.openVcfUrl(this.vcf1000GUrl);
		var refName = theVariantCard.stripRefName(window.gene.chr);
		$("#matrix-panel .loader-label").text("Loading 1000G data");

		vcf1000G.getVariants(refName, 
							   window.gene.start, 
					           window.gene.end, 
					           window.gene.strand, 
					           window.selectedTranscript,
					           0,
					           1,
					           function(data) {
	        window.vcf1000GData = data;
	        window.vcf1000GData.features = window.vcf1000GData.features.sort(orderVariantsByPosition);

			vcfExAC= vcfiobio();
			vcfExAC.openVcfUrl(window.vcfExACUrl);
			$("#matrix-panel .loader-label").text("Loading ExAC data");
			vcfExAC.getVariants(refName, 
									   window.gene.start, 
							           window.gene.end, 
							           window.gene.strand, 
							           window.selectedTranscript,
							           0,
							           1,
							           function(data) {
			    window.vcfExACData = data;
			    window.vcfExACData.features = window.vcfExACData.features.sort(orderVariantsByPosition);

				$("#matrix-panel .loader-label").text("Comparing variants to population");
			    compareVariantsToPopulation(theVcfData, window.vcf1000GData, window.vcfExACData, callback);
			});

	    });
	}




}

function orderVariantsByPosition(a, b) {
	var refAltA = a.type.toLowerCase() + " " + a.ref + "->" + a.alt;
	var refAltB = b.type.toLowerCase() + " " + b.ref + "->" + b.alt;

	if (a.start == b.start) {
		if (refAltA == refAltB) {
			return 0;
		} else if ( refAltA < refAltB ) {
			return -1;
		} else {
			return 1;
		}
	} else if (a.start < b.start) {
		return -1;
	} else {
		return 1;
	}
}


function compareVariantsToPopulation(theVcfData, theVcf1000GData, theVcfExACData, callback) {
	theVcfData.features.forEach(function(variant) {
		variant.compare1000G = null;
		variant.compareExAC = null;
		variant.af1000G = -1;
		variant.afExAC= -1;		
	});
	theVcf1000GData.features.forEach(function(variant) {
		variant.compare1000G = null;
	});
	theVcfExACData.features.forEach(function(variant) {
		variant.compareExAC = null;
	});
	theVcfData.features = theVcfData.features.sort(orderVariantsByPosition);

    window.vcf1000G.compareVcfRecords(theVcfData, theVcf1000GData, 
    	// This is the function that is called after all the variants have been compared
    	// to the 1000G variant set.  In this case, we now move on to comparing the
    	// proband variant set to the ExAC variant set.
    	function() {
	        window.vcfExAC.compareVcfRecords(theVcfData, theVcfExACData, 
	        	// This is the function that is called after the variants have been compared
	        	// to the ExAC population variant set. In this case, we have performed
	        	// all comparisons (1000G in outer function and ExAc in this function), so we 
	        	// can move on to building the feature matrix.
	        	function(){

	        		// Fill in the af level on each variant.  Use the af in the vcf if
	        		// present, otherwise, use the 1000g af if present, otherwise use
	        		// the ExAC af.
	        		theVcfData.features.forEach(function(variant) {

						afExacMap.forEach( function(rangeEntry) {
							if (+variant.afExAC > rangeEntry.min && +variant.afExAC <= rangeEntry.max) {
								variant.afexaclevel = rangeEntry.clazz;
							}
						});
						af1000gMap.forEach( function(rangeEntry) {
							if (+variant.af1000G > rangeEntry.min && +variant.af1000G <= rangeEntry.max) {
								variant.af1000glevel = rangeEntry.clazz;
							}
						});


					});

					// Now that we have compared the variants to the population get get the allele frequency,
					// we need to compare the proband variants to mother and father variants to determine
					// the inheritance mode.  After this completes, we are ready to show the
					// feature matrix.
					$("#matrix-panel .loader-label").text("Comparing variants to family data");

					window.compareVariantsToPedigree(theVcfData, callback);

		        }, 
		        // This is the attribute on variant a (proband) and variant b (ExAC)
		        // that will store whether the variant is unique or matches.
		        'compareExAC',
		    	// This is the callback function called every time we find the same variant
		    	// in both sets. Here we take the ExAC variant's af and store it in the
		    	// proband's variant for further sorting/display in the feature matrix.
		        function(variantA, variantB) {
		        	variantA.afExAC = variantB.af;
		        	if (variantA.afExAC == null || variantA.afExAC == '') {
		        		variantA.afExAC = 0;
		        	}
		        });
    	}, 
    	// This is the attribute on variant a (proband) and variant b (1000G)
		// that will store whether the variant is unique or matches.
    	'compare1000G',
    	// This is the callback function called every time we find the same variant
    	// in both sets. Here we take the 1000G variant's af and store it in the
    	// proband's variant for further sorting/display in the feature matrix.
    	function(variantA, variantB) {
    		variantA.af1000G = variantB.af;
			if (variantA.af1000G == null || variantA.af1000G == '') {
        		variantA.af1000G = 0;
        	}

    	});

}

function compareVariantsToPedigree(theVcfData, callback) {
	theVcfData.features.forEach(function(variant) {
		variant.compareMother = null;
		variant.compareFather = null;
		variant.inheritance = 'none';
	});
	var motherVariantCard = null;
	var fatherVariantCard = null;
	variantCards.forEach( function(variantCard) {
		if (variantCard.getRelationship() == 'mother') {
			motherVariantCard= variantCard;
		} else if (variantCard.getRelationship() == 'father') {
			fatherVariantCard = variantCard;
		}
	});
	if (motherVariantCard == null || fatherVariantCard == null) {
		callback(theVcfData);

	} else {
	
		theVcfData.features = theVcfData.features.sort(orderVariantsByPosition);

	    motherVariantCard.compareVcfRecords(theVcfData,
	    	// This is the function that is called after all the proband variants have been compared
	    	// to the mother variant set.  In this case, we now move on to comparing the
	    	// father variant set to the proband variant set.
	    	function() {
		        fatherVariantCard.compareVcfRecords(theVcfData, 
		        	// This is the function that is called after the proband variants have been compared
		        	// to the father variant set. 
		        	function(){

		        		// Fill in the af level on each variant.  Use the af in the vcf if
		        		// present, otherwise, use the 1000g af if present, otherwise use
		        		// the ExAC af.
		        		theVcfData.features.forEach(function(variant) {
		        			if (variant.zygosity != null && variant.zygosity.toLowerCase() == 'hom' 
		        				&& variant.motherZygosity != null && variant.motherZygosity.toLowerCase() == 'het' 
		        				&& variant.fatherZygosity != null && variant.fatherZygosity.toLowerCase() == 'het') {
		        				variant.inheritance = 'recessive';
		        			} else if (variant.compareMother == 'unique1' && variant.compareFather == 'unique1') {
		        				variant.inheritance = 'denovo';
		        			}
						});
		        		$("#matrix-panel .loader-label").text("Ranking variants");

			        	callback(theVcfData);
			        }, 
			        // This is the attribute on variant a (proband) and variant b (father)
			        // that will store whether the variant is unique or matches.
			        'compareFather',
			        // This is the attribute on the proband variant that will store the
			        // father's zygosity in the case where the variant match
			        'fatherZygosity',
			    	// This is the callback function called every time we find the same variant
			    	// in both sets. Here we take the father variant's zygosity and store it in the
			    	// proband's variant for further sorting/display in the feature matrix.
			        function(variantA, variantB) {
			        	variantA.fatherZygosity = variantB.zygosity != null ? variantB.zygosity : '';
			        });
	    	}, 
	    	// This is the attribute on variant a (proband) and variant b (mother)
			// that will store whether the variant is unique or matches.
	    	'compareMother',
	    	// This is the attribute on the proband variant that will store the
			// mother's zygosity in the case where the variant match
			'motherZygosity',
	    	// This is the callback function called every time we find the same variant
	    	// in both sets. Here we take the mother variant's af and store it in the
	    	// proband's variant for further sorting/display in the feature matrix.
	    	function(variantA, variantB) {
	    		variantA.motherZygosity = variantB.zygosity != null ? variantB.zygosity : '';

	    	});
	}

}

function fillFeatureMatrixWithClinvar(clinVars) {	
	var recs = sourceVcfData.features;
	var clinVarIds = clinVars.uids;

	for( var vcfIter = 0, clinIter = 0; vcfIter < recs.length && clinIter < clinVarIds.length; null) {
		var uid = clinVarIds[clinIter];
		var clinVarStart = clinVars[uid].variation_set[0].variation_loc.filter(function(v){return v["assembly_name"] == "GRCh37"})[0].start;
		
		// compare curr variant and curr clinVar record
		if (recs[vcfIter].start == clinVarStart) {			
			// add clinVar info to variant
			addClinVarInfoToVariant(recs[vcfIter], clinVars[uid]);
			vcfIter++;
			clinIter++;
		} else if (recs[vcfIter].start < clinVarStart) {						
			vcfIter++;
		} else {
			clinIter++;
		}
	}
	$("#matrix-track .clinvar.loader").css("display", "none");

	fillFeatureMatrix(this.sourceVcfData);
}

function addClinVarInfoToVariant(variant, clinvar) {		
	variant.clinVarUid = clinvar.uid;

	if (!variant.clinVarAccession) {
		variant.clinVarAccession = clinvar.accession;
	}

	var clinSigObject = variant.clinVarClinicalSignificance;
	if (clinSigObject == null) {
		variant.clinVarClinicalSignificance = {"none": "Y"};
	}

	var clinSigToken = clinvar.clinical_significance.description;
	if (clinSigToken != "") {		
		// Replace space with underlink
		clinSigToken = clinSigToken.split(" ").join("_").toLowerCase();
		variant.clinVarClinicalSignificance[clinSigToken] = 'Y';

		// Get the clinvar "classification" for the highest ranked clinvar 
		// designation. (e.g. "pathologic" trumps "benign");
		var mapEntry = clinvarMap[clinSigToken];
		if (mapEntry != null) {
			if (variant.clinvarRank == null || 
				mapEntry.value < variant.clinvarRank) {
				variant.clinvarRank = mapEntry.value;
				variant.clinvar = mapEntry.clazz;
			}
		}		
	}



	var phenotype = variant.clinVarPhenotype;
	if (phenotype == null) {
		variant.clinVarPhenotype = {};
	}

	var phTokens = clinvar.trait_set.map(function(d) { return d.trait_name; }).join ('; ')
	if (phTokens != "") {
		var tokens = phTokens.split("; ");
		tokens.forEach(function(phToken) {
			// Replace space with underlink
			phToken = phToken.split(" ").join("_");
			variant.clinVarPhenotype[phToken.toLowerCase()] = 'Y';
		});
	}

	// if (variant.ncbiId) {
	// 	variant.ncbiId = clinvar.ncbiId;
	// }
	// if (!variant.hgvsG) {
	// 	variant.hgvsG = clinvar.hgvsG;
	// }	
}

function fillFeatureMatrixWithClinvar2(clinvarObjects) {
	var lastRecordNumber = clinvarObjects[clinvarObjects.length-1].recordNumber;
	if (this.sourceVcfData) {
		if (sourceVcfData.features.length == lastRecordNumber) {
			for( var i = 0; i < clinvarObjects.length; i++) {
				var idx = clinvarObjects[i].recordNumber - 1;
				if (!sourceVcfData.features[idx].clinVarAccession) {
					sourceVcfData.features[idx].clinVarAccession = clinvarObjects[i].clinvarAccession;
				}

				var clinSigObject = sourceVcfData.features[idx].clinVarClinicalSignificance;
				if (clinSigObject == null) {
					sourceVcfData.features[idx].clinVarClinicalSignificance = {"none": "Y"};
				}

				var clinsigTokens = clinvarObjects[i].clinicalSignificance;
				if (clinsigTokens != "") {
					var tokens = clinsigTokens.split("; ");
					tokens.forEach(function(clinSigToken) {
						// Replace space with underlink
						clinSigToken = clinSigToken.split(" ").join("_").toLowerCase();
						sourceVcfData.features[idx].clinVarClinicalSignificance[clinSigToken] = 'Y';

						// Get the clinvar "classification" for the highest ranked clinvar 
						// designation. (e.g. "pathologic" trumps "benign");
						var mapEntry = clinvarMap[clinSigToken];
						if (mapEntry != null) {
							if (sourceVcfData.features[idx].clinvarRank == null || 
								mapEntry.value < sourceVcfData.features[idx].clinvarRank) {
								sourceVcfData.features[idx].clinvarRank = mapEntry.value;
								sourceVcfData.features[idx].clinvar = mapEntry.clazz;
							}
						}
					});
				}



				var phenotype = sourceVcfData.features[idx].clinVarPhenotype;
				if (phenotype == null) {
					sourceVcfData.features[idx].clinVarPhenotype = {};
				}

				var phTokens = clinvarObjects[i].phenotype;
				if (phTokens != "") {
					var tokens = phTokens.split("; ");
					tokens.forEach(function(phToken) {
						// Replace space with underlink
						phToken = phToken.split(" ").join("_");
						sourceVcfData.features[idx].clinVarPhenotype[phToken.toLowerCase()] = 'Y';
					});
				}

				if (!sourceVcfData.features[idx].ncbiId) {
					sourceVcfData.features[idx].ncbiId = clinvarObjects[i].ncbiId;
				}
				if (!sourceVcfData.features[idx].hgvsG) {
					sourceVcfData.features[idx].hgvsG = clinvarObjects[i].hgvsG;
				}
			}
			$("#matrix-track .clinvar.loader").css("display", "none");

			fillFeatureMatrix(this.sourceVcfData);
		}
	}
}

function fillFeatureMatrix(theVcfData) {
	// Set the width so that scrolling works properly
	$('#feature-matrix').css('min-width', $('#matrix-panel').width());

	if (theVcfData != null) {
		featureVcfData = {};
		featureVcfData.features = [];
		theVcfData.features.forEach(function(variant) {
			featureVcfData.features.push($.extend({}, variant));
		});
	}

	// Sort the matrix columns
	matrixRows = matrixRows.sort(function(a, b) {
		if (a.order == b.order) {
			return 0;
		} else if (a.order < b.order) {
			return -1;
		} else {
			return 1;
		}
	});
	
	// Fill all features used in feature matrix for each variant
	featureVcfData.features.forEach( function(variant) {
		var features = [];
		for (var i = 0; i < matrixRows.length; i++) {
			features.push(null);
		}

		matrixRows.forEach( function(matrixRow) {
			var rawValue = variant[matrixRow.attribute];
			var theValue    = null;
			var mappedValue = null;
			var mappedClazz = null;
			var symbolFunction = null;
			// Don't fill in clinvar for now
			if (matrixRow.attribute == 'clinvar') {
				rawValue = 'N';
			} 
			if (rawValue != null) {
				if (matrixRow.match == 'exact') {
					// We are going to get the mapped value through exact match,
					// so this will involve a simple associative array lookup.
					// Some features (like impact) are multi-value and are stored in a
					// an associative array.  In this case, we loop through the feature
					// values, keeping the lowest (more important) mapped value.
					if (isDictionary(rawValue)) {
						// Iterate through the objects in the associative array.
						// Keep the lowest mapped value
						for (val in rawValue) {
							var entry = matrixRow.map[val];
							if (entry != null && (mappedValue == null || entry.value < mappedValue)) {
								mappedValue = entry.value;
								mappedClazz = entry.clazz;
								symbolFunction = entry.symbolFunction;
								theValue = val;
							}
						}
					} else {
						mappedValue = matrixRow.map[rawValue].value;
						mappedClazz = matrixRow.map[rawValue].clazz;
						symbolFunction = matrixRow.map[rawValue].symbolFunction;
						theValue = rawValue;

					}
				} else if (matrixRow.match == 'range') {
					// If this feature is a range, get the mapped value be testing if the
					// value is within a min-max range.
					if (isNumeric(rawValue)) {
						theValue = d3.format(",.3%")(+rawValue);
						matrixRow.map.forEach( function(rangeEntry) {
							if (+rawValue > rangeEntry.min && +rawValue <= rangeEntry.max) {
								mappedValue = rangeEntry.value;
								mappedClazz = rangeEntry.clazz;
								symbolFunction = rangeEntry.symbolFunction;
							}
						});
					}
				}

			} else {
				rawValue = '';
				mappedClazz = '';
			}
			features[matrixRow.order] = { 
				                    'value': theValue, 
				                    'rank': (mappedValue ? mappedValue : featureUnknown), 
				                    'clazz': mappedClazz,
				                    'symbolFunction': symbolFunction
				                  };
		});

		variant.features = features;
	});
	// Sort the variants by the criteria that matches
	var sortedFeatures = featureVcfData.features.sort(function (a, b) {
	  var featuresA = "";
	  var featuresB = "";
	  
	  // The features have been initialized in the same order as
	  // the matrix column order. In each interation,
	  // exit with -1 or 1 if we have non-matching values;
	  // otherwise, go to next iteration.  After iterating
	  // through every column, if we haven't exited the
	  // loop, that means all features of a and b match
	  // so return 0;
	  for (var i = 0; i < matrixRows.length; i++) {
	  	if (a.features[i].rank < b.features[i].rank) {
	  		return -1;
	  	} else if (a.features[i].rank > b.features[i].rank) {
			return 1;
		} else {
		}
	  }
	  return 0;
	});

	// Get the top 20 variants
	var topFeatures = null;
	if($('#matrixCheckboxAll').prop('checked')) {
		topFeatures = sortedFeatures.slice(0, sortedFeatures.length)
	} else if ($('#matrixCheckboxTop100').prop('checked')){
		topFeatures = sortedFeatures.slice(0, 100 );
	} else if ($('#matrixCheckboxTop20').prop('checked')){
		topFeatures = sortedFeatures.slice(0, 20 );
	}
	
	$("#feature-matrix").removeClass("hide");
	$("#matrix-panel .loader").css("display", "none");

	// Load the chart with the new data
	featureMatrix.matrixRows(matrixRows);
	var selection = d3.select("#feature-matrix").data([topFeatures]);  

    this.featureMatrix(selection);

    // We have new properties to filter on, so refresh the proband variant chart.
	variantCards.forEach(function(variantCard) {
		if (variantCard.getRelationship() == 'proband') {
			variantCard.fillVariantChart(theVcfData, regionStart, regionEnd, true);
	  		window.cullVariantFilters();
		}
	});

	
}

function variantTooltipHTML(variant, rowIndex) {

	var effectDisplay = "";
	for (var key in variant.effect) {
	if (effectDisplay.length > 0) {
	  	effectDisplay += ", ";
	}
		// Strip out "_" from effect
		var tokens = key.split("_");
		effectDisplay += tokens.join(" ");
	}    
	var impactDisplay = "";
	for (var key in variant.impact) {
		if (impactDisplay.length > 0) {
		  	impactDisplay += ", ";
		}
		impactDisplay += key;
	} 
	var clinSigDisplay = "";
	for (var key in variant.clinVarClinicalSignificance) {
		if (key != 'none') {
			if (clinSigDisplay.length > 0) {
			  	clinSigDisplay += ", ";
			}
			clinSigDisplay += key;
		}
	}
	var phenotypeDisplay = "";
	for (var key in variant.clinVarPhenotype) {
		if (phenotypeDisplay.length > 0) {
		  	phenotypeDisplay += ", ";
		}
		phenotypeDisplay += key;
	}      
	var coord = variant.start + (variant.end > variant.start+1 ?  ' - ' + variant.end : "");
	var refalt = variant.ref + "->" + variant.alt;

	
	return (
		  tooltipRowNoLabel(variant.type + ' ' + coord + ' ' + refalt)
		+ tooltipRow('Impact', impactDisplay)
		+ tooltipRow('Effect', effectDisplay)
		+ tooltipRow('ClinVar', clinSigDisplay)
		+ tooltipRow('Phenotype', phenotypeDisplay)
		+ tooltipRow('Qual', variant.qual) 
		+ tooltipRow('Filter', variant.filter) 
		+ tooltipRow('Zygosity', variant.zygosity == "gt_unknown" ? "(No genotype)" : variant.zygosity)
		+ tooltipRow('GMAF', variant.gMaf)
		+ tooltipRow('Inheritance',  variant.inheritance)
		+ tooltipRow('AF ExAC', variant.afExAC)
		+ tooltipRow('AF 1000G', variant.af1000G)
		+ tooltipRow('ClinVar uid', variant.clinVarUid)
		// + tooltipRow('ClinVar #', variant.clinVarAccession)
		// + tooltipRow('NCBI ID', variant.ncbiId)
		// + tooltipRow('HGVS g', variant.hgvsG)
	);                    

}

function tooltipRow(label, value, alwaysShow) {
	if (alwaysShow || (value && value != '')) {
		return '<div class="row">'
		      + '<div class="col-md-4">' + label + '</div>'
		      + '<div class="col-md-8">' + value + '</div>'
		      + '</div>';
	} else {
		return "";
	}
}
function tooltipRowNoLabel(value) {
	if (value && value != '') {
		return '<div class="row" style="text-align:center">'
		      + '<div class="col-md-12">' + value + '</div>'
		      + '</div>';
	} else {
		return "";
	}
}



function cullVariantFilters() {

	d3.selectAll(".impact").each( function(d,i) {
		var impact = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + impact)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".type").each( function(d,i) {
		var type = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + type)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".zygosity").each( function(d,i) {
		var zygosity = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + zygosity)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".effectCategory").each( function(d,i) {
		var effect = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + effect)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".afexaclevel").each( function(d,i) {
		var afexaclevel = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + afexaclevel)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".af1000glevel").each( function(d,i) {
		var af1000glevel = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + af1000glevel)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".inheritance").each( function(d,i) {
		var inheritance = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + inheritance)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});
	d3.selectAll(".clinvar").each( function(d,i) {
		var clinvar = d3.select(this).attr("id");
		var count = d3.selectAll('#vcf-variants .variant.' + clinvar)[0].length;
		d3.select(this).classed("inactive", count == 0);
	});



	// First, move all elements out of the 'more' section
	$('#effect-filter-box #more-effect svg').each(function() {
    	$(this).insertBefore($('#effect-filter-box #more-effect-link'));
    });
    // Now move only inactive elements into the 'more section'
    $('#effect-filter-box .inactive').each(function() {
    	$(this).prependTo($('#effect-filter-box #more-effect'));
    });
    // If we have more that 6 active elements, keep the
    // first 6 where they are and move the remaining to the 
    // 'more' section.  If we 6 or less active elements,
    // just hide the 'more' link.
    var allCount = d3.selectAll("#effect-filter-box .effectCategory")[0].length;
    var inactiveCount = d3.selectAll("#effect-filter-box .effectCategory.inactive")[0].length;
    var activeCount = allCount - inactiveCount;
    if (activeCount >= 4) {
    	$('#effect-filter-box #more-effect-link').removeClass('hide');
    	// Keep six active elements where they are.  The remainder should go in the 
    	// 'more' section
    	var activeElements = $('#effect-filter-box > .effectCategory');
    	for (var i = 4; i < activeCount; i++) {
    		var activeElement = activeElements[i];
    		$('#effect-filter-box #more-effect').append($(activeElement));
    	}

    } else {
    	$('#effect-filter-box #more-effect-link').addClass('hide');

    }
}

function toggleMatrixCheckbox(element) {

	if (element.id == 'matrixCheckboxAll') {
		$('#matrixCheckboxTop20').prop("checked", false);
		$('#matrixCheckboxTop100').prop("checked", false);
	} else if (element.id == 'matrixCheckboxTop100') {
		$('#matrixCheckboxTop20').prop("checked", false);
		$('#matrixCheckboxAll').prop("checked", false);
	} else {
		$('#matrixCheckboxAll').prop("checked", false);
		$('#matrixCheckboxTop100').prop("checked", false);
	}
	fillFeatureMatrix();
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isDictionary(obj) {
  if(!obj) {
  	return false;
  } 
  if(Array.isArray(obj)) {
  	return false;
  }
  if (obj.constructor != Object) {
  	return false;
  }
  return true;
}






 