function DataCard() {
  this.buildDefaulted = false;


  this.defaultNames = {
    proband: 'NA12878',
    mother:  'NA12892',
    father:  'NA12891'
  };
  this.defaultUrls = {
    proband: 'https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz',
    mother:  'https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz',
    father:  'https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz'
  };
  this.defaultBamUrls = {
    proband: 'https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12878.bam',
    mother:  'https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12892.bam',
    father:  'https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12891.bam'
  };
  this.defaultSampleNames = {
    proband: 'NA12878',
    mother:  'NA12892',
    father:  'NA12891'
  };


  this.demoBuild = "GRCh37";
  this.demoMode = 'trio';
  this.demoCards = {
    proband: true,
    mother: true,
    father: true
  };

  this.demoGenes =  ["RAI1","AIRE","MYLK2", "PDGFB", "PDHA1"];

  this.demoNames = {
    proband: 'NA12878',
    mother:  'NA12892',
    father:  'NA12891'
  };
  this.demoUrls = {
    proband: 'https://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz',
    mother:  'https://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz',
    father:  'https://s3.amazonaws.com/iobio/samples/vcf/platinum-exome.vcf.gz'
  };
  this.demoBamUrls = {
    proband: 'https://s3.amazonaws.com/iobio/samples/bam/NA12878.exome.bam',
    mother:  'https://s3.amazonaws.com/iobio/samples/bam/NA12892.exome.bam',
    father:  'https://s3.amazonaws.com/iobio/samples/bam/NA12891.exome.bam'
  };
  this.demoSampleNames = {
    proband: 'NA12878',
    mother:  'NA12892',
    father:  'NA12891'
  };

  this.eduTourModes = [
    'single',
    'single',
    'single'
  ];


  this.eduTourUrls = [
  {
    proband: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
    mother:  'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
    father:  'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz'
  },
  {
    proband: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
    mother:  'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
    father:  'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz'
  },
  {
    proband: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
    mother: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz',
    father: 'https://s3.amazonaws.com/iobio/NHMU/nhmu.vcf.gz'
  }
  ];

  this.eduTourUrlsOffline = [
  {
    proband: 'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz',
    mother:  'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz',
    father:  'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz'
  },
  {
    proband: 'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz',
    mother:  'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz',
    father:  'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz'
  },
  {
    proband: 'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz',
    mother:  'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz',
    father:  'http://frontend/exhibit_cache/nhmu-case-studies.vcf.gz'
  }
  ];
  this.eduTourCards = [
    {
      proband: true,
      mother:  false,
      father:  false
    },
    {
      proband: true,
      mother:  false,
      father:  false
    },
    {
      proband: false,
      mother:  false,
      father:  false
    }
  ];
  this.eduTourNames = [
    {
      proband: 'Alex'
    },
    {
      proband: 'Father'
    },
    {
      proband: 'John'
    }
  ];
  this.eduTourSampleNames = [
    {
      proband: 'sample3',
      mother:  'sample1',
      father:  'sample2'
    },
    {
      proband: 'sample2'
    },
    {
      proband: 'sample1'
    }
  ];
  this.eduTourGenes = [
    [],
    [],
    ['VKORC1']
  ];
  this.mygene2Genes = [
    'KDM1A'
  ];



  this.mode = 'single';
  this.panelSelectorFilesSelected = null;

}

DataCard.prototype.loadDemoData = function() {
  var me = this;


  if (isLevelEdu) {
    var idx = +eduTourNumber;
    this.demoCards      = this.eduTourCards[idx];
    this.demoUrls        = isOffline ? this.eduTourUrlsOffline[idx] : this.eduTourUrls[idx];
    this.demoNames       = this.eduTourNames[idx];
    this.demoSampleNames = this.eduTourSampleNames[idx];
    this.demoMode        = this.eduTourModes[idx];
  }

  this.mode = this.demoMode;

  // Clear the cache
  var affectedSibIds  = [];
  var unaffectedSibIds = [];
  window.loadSibs(affectedSibIds, 'affected');
  window.loadSibs(unaffectedSibIds, 'unaffected');

  window.utility.updateUrl("build", me.demoBuild);
  genomeBuildHelper.setCurrentBuild(me.demoBuild);
  $('#select-build-box').removeClass("attention");


  window.utility.updateUrl('rel0', "proband");
  window.utility.updateUrl('rel1', "mother");
  window.utility.updateUrl('rel2', "father");

  window.utility.updateUrl('name0', this.demoNames.proband);
  window.utility.updateUrl('vcf0',  this.demoUrls.proband);
  window.utility.updateUrl("tbi0", "");
  if (!window.isLevelEdu) {
    window.utility.updateUrl('bam0',  this.demoBamUrls.proband);
    window.utility.updateUrl('bai0',  "");
  }
  window.utility.updateUrl('sample0',  this.demoSampleNames.proband);

  if (this.demoCards.mother) {
    window.utility.updateUrl('name1', this.demoNames.mother);
    window.utility.updateUrl('vcf1',  this.demoUrls.mother);
    window.utility.updateUrl('tbi1',  "");
    if (!window.isLevelEdu) {
      window.utility.updateUrl('bam1',  this.demoBamUrls.mother);
      window.utility.updateUrl('bai1',  "");
    }
    window.utility.updateUrl('sample1',  this.demoSampleNames.mother);
  }

  if (this.demoNames.father) {
    window.utility.updateUrl('name2', this.demoNames.father);
    window.utility.updateUrl('vcf2',  this.demoUrls.father);
    window.utility.updateUrl('tbi2',  "");
    if (!window.isLevelEdu) {
      window.utility.updateUrl('bam2',  this.demoBamUrls.father);
      window.utility.updateUrl('bai2',  "");
    }
    window.utility.updateUrl('sample2',  this.demoSampleNames.father);
  }


  if (!window.isLevelEdu) {
    window.utility.updateUrl("gene", me.demoGenes[0]);
    window.utility.updateUrl("genes", me.demoGenes.join(","));

    cacheHelper.promiseClearCache()
    .then(function() {
      window.matrixCard.reset();
      window.loadedUrl = false;
      reloadGeneFromUrl();
    })
  } else if (window.isLevelEdu && this.eduTourGenes[+eduTourNumber].length > 0) {
    var theGenes       = me.eduTourGenes[+eduTourNumber];
    window.utility.updateUrl("gene", theGenes[0]);
    window.utility.updateUrl("genes", theGenes.join(",") );

    me.mode = "single";
    genomeBuildHelper.setCurrentBuild(me.demoBuild);

    theGenes.forEach(function(geneName) {
      genesCard.geneNames.push(geneName);
      genesCard.addGeneBadge(geneName, true);
    })


    me.promiseSetVcfUrl("proband", me.eduTourNames[+eduTourNumber].proband,
      me.demoSampleNames.proband, me.demoUrls.proband)
      .then(function() {
      $('#select-build-box').removeClass("attention");
      window.getAffectedInfo(true);
      window.setGeneratedSampleNames();
      window.loadTracksForGene();
      window.cacheHelper.promiseClearCache()
      .then(function() {
        window.matrixCard.reset();
        genesCard.selectGene(theGenes[0]);
        });
      })

  } else {
    loadUrlSources();

  }



}

DataCard.prototype.loadMygene2Data = function() {
  var me = this;

  var validationMsg = "";
  if (siteConfig == null || Object.keys(siteConfig).length == 0 || !siteConfig.hasOwnProperty('mygene2')) {
    validationMsg += "<br>&nbsp;&nbsp;Site configuration is missing for mygene2. "
  } else {
    if (siteConfig.mygene2.tokenEndpoint == "") {
      validationMsg += "<br>&nbsp;&nbsp;Missing site configuration field 'tokenEndpoint'. ";
    }
    if (siteConfig.mygene2.xAuthToken == "") {
      validationMsg += "<br>&nbsp;&nbsp;Missing site configuration field 'xAuthToken'. ";
    }
  }
  var fileId = utility.getUrlParameter("fileId");
  if (fileId == null || fileId == "") {
    validationMsg += "<br>&nbsp;&nbsp;Missing request parameter 'fileId'."
  }

  if (!genomeBuildHelper.getCurrentBuild()) {
    validationMsg += "<br>&nbsp;&nbsp;Missing request parameter 'build'.";
  }

  if (validationMsg.length > 0) {
    alertify.confirm("Cannot load data due to the following errors: " + validationMsg,
     function(){
     },
     function(){
       me._loadMygene2Proband();
     }).set('labels', {ok:'OK', cancel:'Continue, but just use demo data'});
  } else {

    var endpointUrl = siteConfig.mygene2.tokenEndpoint + "token/" + fileId;

    $.ajax({
        type: 'get',
        url: endpointUrl,
        dataType: 'json',
        contentType: 'json',
        xhrFields: {
            withCredentials: true
        },
        headers: {
            'X-Auth-Token': siteConfig.mygene2.xAuthToken
        },
        success: function(res) {
          vcfUrl = siteConfig.mygene2.dataEndpoint + res.token + "/" + res.fileUpload.name;
          me._loadMygene2Proband(vcfUrl);
        },
        error: function( xhr, status, errorThrown ) {
          console.log( "Error: " + errorThrown );
          console.log( "Status: " + status );
          console.log( xhr );
          console.log("Unable to get MyGene2 endpoint filenames");
          alertify.confirm("Unable to obtain variant files using MyGene2 token.",
           function(){
           },
           function(){
            me._loadMygene2Proband();
           }).set('labels', {ok:'OK', cancel:'Continue, but just use demo data'});
        }
    });



  }

}



DataCard.prototype._loadMygene2Proband = function(probandUrl) {
  var me = this;
  if (isLevelBasic) {
    window.showSidebar("Phenolyzer");
  }
  if (probandUrl != null) {

    // If the genome build was specified, load the endpoint variant file
    if (genomeBuildHelper.getCurrentBuild()) {
      me.promiseSetVcfUrl("proband", "Variants", null, probandUrl)
      .then(function() {
        window.getAffectedInfo(true);
        window.setGeneratedSampleNames();
        window.loadTracksForGene();
        window.cacheHelper.promiseClearCache()
        .then(function() {
          window.matrixCard.reset();

        })
      })
    } else {
      alertify.alert("Cannot load data.  The genome build must be specified.");
    }
  } else {
    me.loadDemoData();
  }
}

DataCard.prototype.loadSampleData = function(relationship, name, sampleName, mode) {
  variantCard = getVariantCard(relationship);
  variantCard.setName(name);
  variantCard.setSampleName(sampleName);
  this.mode = 'single';

  window.loadTracksForGene();
}

DataCard.prototype.listenToEvents = function(panelSelector) {
  var me = this;

    panelSelector.find('#datasource-name').on('change', function() {
      me.setDataSourceName(panelSelector);
    });

    // listen to checkbox for filtering exonic only variants
  panelSelector.find('#affected-cb').click(function() {
    me.setAffected(panelSelector);
  });

    panelSelector.find('#bam-url-input').on('change', function() {
      me.onBamUrlEntered(panelSelector);
    });
    panelSelector.find('#bai-url-input').on('change', function() {
      me.onBamUrlEntered(panelSelector);
    });
    panelSelector.find('#display-bam-url-item').on('click', function() {
      me.displayBamUrlBox(panelSelector);
    });
    panelSelector.find('#display-platinum-bam-url-item').on('click', function() {
      me.displayPlatinumBamUrlBox(panelSelector);
    });
    // Workaround for problem where extra event on proband files button fired
    panelSelector.find("#bam-dropdown-button").on("click", function() {
      me.panelSelectorFilesSelected = panelSelector;
    });

    panelSelector.find('#bam-file-selector-item').on('click', function() {
      me.onBamFileButtonClicked(panelSelector);
    });
    panelSelector.find('#bam-file-upload').on('change', function(event) {
      me.onBamFilesSelected(event);
    });
    // This will ensure that if a same file selected consecutively
    // will file the 'change' event
    panelSelector.find('#bam-file-upload').on('click', function() {
      this.value = null;
    });
     panelSelector.find('#clear-bam').on('click', function() {
      me.clearBamUrl(panelSelector);
    });

    panelSelector.find('#url-input').on('change', function() {
      me.onVcfUrlEntered(panelSelector);
    });
    panelSelector.find('#url-tbi-input').on('change', function() {
      me.onVcfUrlEntered(panelSelector);
    });
    panelSelector.find('#display-vcf-url-item').on('click', function() {
      me.displayUrlBox(panelSelector);
    });
    panelSelector.find('#display-platinum-vcf-url-item').on('click', function() {
      me.displayPlatinumUrlBox(panelSelector);
    });
    panelSelector.find('#clear-vcf').on('click', function() {
      me.clearUrl(panelSelector);
    });

    panelSelector.find('#vcf-file-selector-item').on('click', function() {
      me.onVcfFileButtonClicked(panelSelector);
    });
    // Workaround for problem where extra event on proband files button fired
    panelSelector.find("#vcf-dropdown-button").on("click", function() {
      me.panelSelectorFilesSelected = panelSelector;
    });


    panelSelector.find('#vcf-file-upload').on('change', function(event) {
    me.onVcfFilesSelected(event);
    });
    // This will ensure that if a same file selected consecutively
    // will file the 'change' event
    panelSelector.find('#vcf-file-upload').on('click', function() {
      this.value = null;
    });



}

DataCard.prototype.setCurrentSpecies = function(speciesName) {
  if ($('#select-species')[0].selectize) {
    $('#select-species')[0].selectize.addItem(speciesName);
    genomeBuildHelper.setCurrentSpecies(speciesName);
  }
}


DataCard.prototype.setCurrentBuild = function(buildName) {
  if ($('#select-build')[0].selectize) {
    $('#select-build')[0].selectize.addItem(buildName);
    genomeBuildHelper.setCurrentBuild(buildName);
    $('#build-link').text(buildName);
    $('#select-build-box').removeClass("attention");

  }
}



DataCard.prototype.removeSpeciesListener = function() {
  if ($('#select-species')[0].selectize) {
    $('#select-species')[0].selectize.off('change');
  }
}

DataCard.prototype.addSpeciesListener = function() {
  var me = this;
  if ($('#select-species')[0].selectize) {
    $('#select-species')[0].selectize.on('change', function(value) {
          if (!value.length) {
            return;
          }
          genomeBuildHelper.setCurrentSpecies(value);
          utility.updateUrl("species", value);
          var selectizeBuild = $('#select-build')[0].selectize;
          selectizeBuild.disable();
          selectizeBuild.clearOptions();

          selectizeBuild.load(function(callback) {
            selectizeBuild.enable();
            callback(genomeBuildHelper.speciesToBuilds[value]);
          });

      });
  }

}


DataCard.prototype.removeBuildListener = function() {
  if ($('#select-build')[0].selectize) {
    $('#select-build')[0].selectize.off('change');
  }

}

DataCard.prototype.addBuildListener = function() {
  var me = this;
  if ($('#select-build')[0].selectize) {
      $('#select-build')[0].selectize.on('change', function(value) {
      if (value.length) {
        genomeBuildHelper.setCurrentBuild(value);
        utility.updateUrl("build", value);
        $('#build-link').text(value);
        me.validateBuildFromData(function(success, message) {
          if (success) {
            $('#select-build-box').removeClass("attention");
            $('#species-build-warning').addClass("hide");
            me.enableLoadButton();
          } else {
            $('#species-build-warning').html(message);
            $('#species-build-warning').removeClass("hide");
            me.disableLoadButton();
          }
        });
      } else {
        genomeBuildHelper.currentBuild = null;
        utility.removeUrl("build");
        $('#build-link').text("?");
        me.disableLoadButton();
        setTimeout( function() {
          //$('#select-build-box .selectize-input').animateIt('tada');
          $('#select-build-box').addClass("attention");
        }, 2000);

      }

    });
  }

}


DataCard.prototype.setDefaultBuildFromData = function() {
  var me = this;
  if ($('#select-species')[0].selectize && $('#select-build')[0].selectize) {
    me.getBuildsFromData(function(buildsInData) {
      if (buildsInData.length == 0) {
        $('#species-build-warning').addClass("hide");
        if (genomeBuildHelper.getCurrentBuild() == null) {
          me.disableLoadButton();
          $('#select-build')[0].selectize.clear();
        } else {
          me.enableLoadButton();
        }

      } else if (buildsInData.length == 1) {
        var buildInfo = buildsInData[0];

        me.removeBuildListener();
        genomeBuildHelper.setCurrentSpecies(buildInfo.species.name);
        genomeBuildHelper.setCurrentBuild(buildInfo.build.name);

        $('#select-build-box').removeClass("attention");

        $('#select-species')[0].selectize.setValue(buildInfo.species.name);
        $('#select-build')[0].selectize.setValue(buildInfo.build.name);
        me.addBuildListener();

        $('#species-build-warning').addClass("hide");
        me.enableLoadButton();
      } else {
        var message = genomeBuildHelper.formatIncompatibleBuildsMessage(buildsInData);
        $('#species-build-warning').html(message);
        $('#species-build-warning').removeClass("hide");
        me.disableLoadButton();
      }
    });
  }

}

DataCard.prototype.validateBuildFromData = function(callback) {
  var me = this;
  me.getBuildsFromData(function(buildsInData) {
    if (buildsInData.length == 0) {
      callback(true);

    } else if (buildsInData.length == 1) {
      var buildInfo = buildsInData[0];
      if (genomeBuildHelper.currentSpecies.name == buildInfo.species.name && genomeBuildHelper.currentBuild.name == buildInfo.build.name) {
        callback(true);
      } else {
        callback(false, 'Incompatible build. Data files specify the genome build ' + buildInfo.species.name + ' ' + buildInfo.build.name);
      }
    } else {
      callback(false, genomeBuildHelper.formatIncompatibleBuildsMessage(buildsInData));
    }
  });
}


DataCard.prototype.getBuildsFromData = function(callback) {
  var me = this;

  me.getHeadersFromBams(function(bamHeaderMap) {
    me.getHeadersFromVcfs(function(vcfHeaderMap) {
      var buildsInHeaders = genomeBuildHelper.getBuildsInHeaders(bamHeaderMap, vcfHeaderMap);
      callback(buildsInHeaders);

    })
  });
}



DataCard.prototype.getHeadersFromBams = function(callback) {
  var headerMap = {};
  var cardCount = 0;
  variantCards.forEach(function(variantCard) {
    if (variantCard.model.bam && !variantCard.model.bam.isEmpty()) {
      variantCard.model.bam.getHeaderStr(function(header) {
        headerMap[variantCard.getRelationship()] = header;
        cardCount++;
        if (cardCount == variantCards.length) {
          callback(headerMap);
        }

      });
    } else {
      cardCount++;
      headerMap[variantCard.getRelationship()] = null;
      if (cardCount == variantCards.length) {
        callback(headerMap);
      }
    }
  });
}

DataCard.prototype.getHeadersFromVcfs = function(callback) {
  var headerMap = {};
  var cardCount = 0;
  variantCards.forEach(function(variantCard) {
    if (variantCard.model.vcf) {
      variantCard.model.vcf.getHeader(function(header) {
        headerMap[variantCard.getRelationship()] = header;
        cardCount++;
        if (cardCount == variantCards.length) {
          callback(headerMap);
        }

      });
    } else {
      cardCount++;
      headerMap[variantCard.getRelationship()] = null;
      if (cardCount == variantCards.length) {
        callback(headerMap);
      }
    }
  });
}


DataCard.prototype.init = function() {
  var me = this;

  $('#dataModal').on('hidden.bs.modal', function(e) {

       e.preventDefault();

    });
  $('#dataModal').on('shown.bs.modal', function() {
    me.onShow();
  })

  $('#separate-url-for-index-files-cb').click(function() {
    var checked = $('#separate-url-for-index-files-cb').is(":checked");
    d3.selectAll('#url-tbi-input').classed("hide", !checked);
    d3.selectAll('#bai-url-input').classed("hide", !checked);

    // Loop through the .tbi and .bai inputs to see if any need to be blanked out.  Since there are
    // a pair of index input fields for each sample, the panelSelector array will point us to the
    // correct sample panel.
    var panelSelector = ['#proband-data', '#proband-data', '#mother-data','#mother-data', '#father-data','#father-data'];
    $('.index-input').each(function(i,val) {
      var currentValue = $(val).val();
      if (currentValue != "") {
        $(val).val("");
        if ($(val).attr("id") == "url-tbi-input") {
          me.onVcfUrlEntered($(panelSelector[i]));
        } else if ($(val).attr("id") == "bai-url-input") {
          me.onBamUrlEntered($(panelSelector[i]));
        }
      }
    })
  });


  $('#select-species').selectize(
    {
      create: true,
      valueField: 'name',
        labelField: 'name',
        searchField: ['name'],
        maxItems: 1,
        options: genomeBuildHelper.speciesList
      }
  );
  $('#select-build').selectize(
    {
      create: true,
      valueField: 'name',
        labelField: 'name',
        searchField: ['name'],
        allowEmptyOption: true,
        onOptionAdd: function(value) {
          if (!me.buildDefaulted) {
            // You can default the build in the dropdown here
            me.buildDefaulted = true;
          }
        }
      }
  );
  me.addSpeciesListener();
  $('#select-species')[0].selectize.addItem(genomeBuildHelper.getCurrentSpeciesName());
  me.addBuildListener();
  me.setDefaultBuildFromData();


  $('#proband-data').append(templateUtil.dataCardEntryTemplate());
  $('#proband-data #vcf-sample-select').selectize(
    {
      create: true,
      valueField: 'value',
        labelField: 'value',
        searchField: ['value']
      }
  );
  this.listenToEvents($('#proband-data'));
  $('#proband-data').find("#url-input").removeClass('hide');
  if ($('#separate-url-for-index-files-cb').is(":checked")) {
    $('#proband-data').find("#url-tbi-input").removeClass('hide');
    $('#proband-data').find("#bai-url-input").removeClass('hide');
  }
  $('#proband-data').find("#bam-url-input").removeClass('hide');
  addVariantCard();
  me.setDataSourceRelationship($('#proband-data'));
  me.setAffected($('#proband-data'))


  $('#unaffected-sibs-select').selectize(
    {
      create: true,
      maxItems: null,
      valueField: 'value',
        labelField: 'value',
        searchField: ['value']
      }
  );
  $('#affected-sibs-select').selectize(
    {
      create: true,
      maxItems: null,
      valueField: 'value',
        labelField: 'value',
        searchField: ['value']

      }
  );


  $('#mother-data').append(templateUtil.dataCardEntryTemplate());
  $('#mother-data #sample-data-label').text("MOTHER");
  $('#mother-data #vcf-sample-select').selectize(
    {
      create: true,
      valueField: 'value',
        labelField: 'value',
        searchField: ['value']
      }
  );
  this.listenToEvents($('#mother-data'));
  $('#mother-data').find("#url-input").removeClass('hide');
  if ($('#separate-url-for-index-files-cb').is(":checked")) {
    $('#mother-data').find("#url-tbi-input").removeClass('hide');
    $('#mother-data').find("#bai-url-input").removeClass('hide');
  }
  $('#mother-data').find("#bam-url-input").removeClass('hide');
  addVariantCard();
  me.setDataSourceRelationship($('#mother-data'));



  $('#father-data').append(templateUtil.dataCardEntryTemplate());
  $('#father-data #sample-data-label').text("FATHER");
  $('#father-data #vcf-sample-select').selectize(
    {
      create: true,
      valueField: 'value',
        labelField: 'value',
        searchField: ['value']
      }
  );
  this.listenToEvents($('#father-data'));

  addVariantCard();
  $('#father-data').find("#url-input").removeClass('hide');
  if ($('#separate-url-for-index-files-cb').is(":checked")) {
    $('#father-data').find("#url-tbi-input").removeClass('hide');
    $('#father-data').find("#bai-url-input").removeClass('hide');
  }

  $('#father-data').find("#bam-url-input").removeClass('hide');
  me.setDataSourceRelationship($('#father-data'));


  var dataCardSelector = $('#data-card');
  dataCardSelector.find('#expand-button').on('click', function() {
    dataCardSelector.find('.fullview').removeClass("hide");
  });
  dataCardSelector.find('#minimize-button').on('click', function() {
    dataCardSelector.find('.fullview').addClass("hide");
  });
  dataCardSelector.find('#ok-button').on('click', function() {

    // Save the currently select gene name before clearing
    // out the gene info, which is necessary if the genome build or dataset(s) change
    var theGeneName = window.gene ? window.gene.gene_name : null;

    // Clear out annotations and gene models (and transcripts)
    genesCard.clearGeneInfos();

    genesCard.showAnalyzeAllButton();
    // Clear the cache
    cacheHelper.promiseClearCache()
    .then(function() {
      cacheHelper.hideAnalyzeAllProgress();

      // Clear any filters
      filterCard.clearFilters();
      filterCard.resetStandardFilterCounts();
      // Clear out filters for VEP consequences and rec filters as these are
      // generated from the data
      filterCard.clearDataGeneratedFilters();



       // If we switched from a trio back to a single, clear out the mother and father
      // data
      if (me.mode == 'single') {
        me.clearMotherFatherData();
      }

      // Create variant cards for the affected and unaffected sibs.
      // We will load the data later once the proband, mother, father
      // data is loaded.
      var affectedSibIds  = $("#affected-sibs-select")[0].selectize.getValue();
      var unaffectedSibIds = $("#unaffected-sibs-select")[0].selectize.getValue();

      window.loadSibs(affectedSibIds, 'affected');
      window.loadSibs(unaffectedSibIds, 'unaffected');

      window.utility.updateUrl('affectedSibs',   affectedSibIds && affectedSibIds.length > 0   ? affectedSibIds.join(",") : "");
      window.utility.updateUrl('unaffectedSibs', unaffectedSibIds && unaffectedSibIds.length > 0 ? unaffectedSibIds.join(",") : "");

      window.getAffectedInfo(true);
      filterCard.displayAffectedFilters();
      genericAnnotation.appendGenericFilters(getProbandVariantCard().model.getAnnotators());


      window.enableCallVariantsButton();

      window.setGeneratedSampleNames();

      window.matrixCard.reset();


      if (theGeneName) {
        geneSearch.setValue(theGeneName, false, true);
      } else if (utility.getUrlParameter("gene")) {
        // If the genome build was missing, the user was forced into the data dialog to select
        // the genome build.  Now we want to load the gene if it was provided in the URL parameter
        // list.
        geneSearch.setValue(utility.getUrlParameter("gene"), true, true);
      } else {
        window.loadTracksForGene();
      }

    })


  });


}

DataCard.prototype.initSibs = function() {

    // Select the affected and unaffected sibs if provided in the url
    var affectedSibIds = [];
    window.variantCardsSibs.affected.forEach(function(vc) {
      affectedSibIds.push(vc.getName());
    })
    $('#data-card #affected-sibs-select')[0].selectize.setValue(affectedSibIds);

    var unaffectedSibIds = [];
    window.variantCardsSibs.unaffected.forEach(function(vc) {
      unaffectedSibIds.push(vc.getName());
    })
    $('#data-card #unaffected-sibs-select')[0].selectize.setValue(unaffectedSibIds);

}

DataCard.prototype.onShow = function() {
  if (window.gene) {
    $('#gene-name-data-dialog-box').addClass("hide");
    $('#bloodhound-data-dialog').addClass("hide");
  } else {
    $('#gene-name-data-dialog-box').removeClass("hide");
    $('#bloodhound-data-dialog').removeClass("hide");
  }

}

DataCard.prototype.resetExportPanel = function() {
  $('#export-loader').addClass("hide");
  $('#download-bookmarks').addClass("hide");
  $('#export-bookmarks').removeClass("hide");
}

DataCard.prototype.onBookmarkImportSource = function(radio) {
  if (radio.value == 'gene') {
    $('#tsv-bookmark-selection').addClass("hide");
    $('#csv-bookmark-selection').removeClass("hide");
  } else if (radio.value == 'gemini' || radio.value == 'tsv') {
    $('#tsv-bookmark-selection').removeClass("hide");
    $('#csv-bookmark-selection').addClass("hide");
  }
}


DataCard.prototype.onBamFileButtonClicked = function(panelSelector) {
  let me = this;
  if (!panelSelector) {
    panelSelector = $('#datasource-dialog');
  }
  panelSelector.find('#bam-file-info').removeClass("hide");

  panelSelector.find('#bam-url-input').addClass('hide');
  panelSelector.find('#bam-url-input').val('');
  panelSelector.find('#bai-url-input').addClass('hide');
  panelSelector.find('#bai-url-input').val('');

  me.disableLoadButton();
}

DataCard.prototype.onBamFilesSelected = function(event) {
  var me = this;
  $('#tourWelcome').removeClass("open");

  this.setDataSourceName(this.panelSelectorFilesSelected);
  this.setDataSourceRelationship(this.panelSelectorFilesSelected);

  var cardIndex = this.panelSelectorFilesSelected.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];

  variantCard.onBamFilesSelected(event, function(bamFileName) {
    me.panelSelectorFilesSelected.find('#bam-file-info').removeClass('hide');
    me.panelSelectorFilesSelected.find('#bam-file-info').val(bamFileName);
    me.setDefaultBuildFromData();
    me.enableLoadButtonIfBuildSet(true);
  });

}

DataCard.prototype.enableLoadButtonIfBuildSet = function(wiggleWhenEmpty) {
  let me = this;
  if (genomeBuildHelper.getCurrentBuild()) {
    me.enableLoadButton();
  } else {
    if (wiggleWhenEmpty) {
      //$('#select-build-box .selectize-input').animateIt('tada');
      $('#select-build-box').addClass('attention');
    }
    me.disableLoadButton();
  }
}


DataCard.prototype.onBamUrlEntered = function(panelSelector, callback) {
  var me = this;
  if (!panelSelector) {
    panelSelector = $('#datasource-dialog');
  }
  $('#tourWelcome').removeClass("open");

  var bamUrlInput = panelSelector.find('#bam-url-input');
  bamUrlInput.removeClass("hide");

  var baiUrl = '';
  if ($('#separate-url-for-index-files-cb').is(":checked")) {
    var baiUrlInput = panelSelector.find('#bai-url-input');
    baiUrlInput.removeClass("hide");
    baiUrl = baiUrlInput.val();
  }

  var cardIndex = panelSelector.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];

  this.setDataSourceName(panelSelector);
  this.setDataSourceRelationship(panelSelector);

  var bamUrl = bamUrlInput.val();
  if (isOffline) {
    if (bamUrl.indexOf(offlineUrlTag) == 0) {
      bamUrl = "http://" + serverInstance + serverDataDir + bamUrl.split(offlineUrlTag)[1];
    }
    if (baiUrl.indexOf(offlineUrlTag) == 0) {
      bamiUrl = "http://" + serverInstance + serverDataDir + bamUrl.split(offlineUrlTag)[1];
    }
  }

  variantCard.onBamUrlEntered(bamUrl, baiUrl, function(success) {

    if (success) {
      variantCard.setName(variantCard.getName());
      window.utility.updateUrl('bam' + cardIndex, encodeURIComponent(bamUrl));
      window.utility.updateUrl('bai' + cardIndex, encodeURIComponent(baiUrl));
      me.setDefaultBuildFromData();
      me.enableLoadButtonIfBuildSet(true);
    } else {
      me.disableLoadButton();
    }

    if (callback) {
      callback(success);
    }

  });

}

DataCard.prototype.displayBamUrlBox = function(panelSelector) {
  if (!panelSelector) {
    panelSelector = $('#datasource-dialog');
  }
  panelSelector.find('#bam-file-info').addClass('hide');
    panelSelector.find('#bam-file-info').val('');
    panelSelector.find('#bam-url-input').removeClass("hide");
    panelSelector.find("#bam-url-input").focus();
    if ($('#separate-url-for-index-files-cb').is(":checked")) {
      panelSelector.find('#bai-url-input').removeClass("hide");
  } else {
      panelSelector.find('#bai-url-input').addClass("hide");

  }

    // Blank out the URL
  panelSelector.find("#bam-url-input").val("");
  panelSelector.find("#bai-url-input").val("");

    var cardIndex = panelSelector.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];


    this.onBamUrlEntered(panelSelector);


}
DataCard.prototype.displayPlatinumBamUrlBox = function(panelSelector) {
  if (!panelSelector) {
    panelSelector = $('#datasource-dialog');
  }
  panelSelector.find('#bam-file-info').addClass('hide');
    panelSelector.find('#bam-file-info').val('');
    panelSelector.find('#bam-url-input').removeClass("hide");
    panelSelector.find("#bam-url-input").focus();
  panelSelector.find('#bai-url-input').addClass('hide');
    panelSelector.find('#bai-url-input').val('');

    var cardIndex = panelSelector.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];

  panelSelector.find('#bam-url-input').val(this.defaultBamUrls[variantCard.getRelationship()]);
  this.onBamUrlEntered(panelSelector);


}

DataCard.prototype.clearBamUrl = function(panelSelector) {
  var me = this;
  if (!panelSelector) {
    panelSelector = $('#datasource-dialog');
  }

  var cardIndex = panelSelector.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];

  window.utility.removeUrl('bam'+cardIndex);



  this.displayBamUrlBox(panelSelector);
  panelSelector.find("#bam-url-input").val("");
  panelSelector.find("#bai-url-input").val("");
  panelSelector.find("#bam-file-info").val("");
  this.onBamUrlEntered(panelSelector);

  me.enableLoadButton();

}

DataCard.prototype.displayUrlBox = function(panelSelector) {
  if (!panelSelector) {
    panelSelector = $('#datasource-dialog');
  }

  var cardIndex = panelSelector.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];

  // Blank out the URL
  panelSelector.find("#url-input").val("");
  panelSelector.find("#url-tbi-input").val("");

  panelSelector.find("#url-input").removeClass('hide');
    panelSelector.find("#url-input").focus();
    if ($('#separate-url-for-index-files-cb').is(":checked")) {
    panelSelector.find("#url-tbi-input").removeClass('hide');
  } else {
    panelSelector.find("#url-tbi-input").addClass('hide');
  }

    panelSelector.find('#vcf-file-info').addClass('hide');
    panelSelector.find('#vcf-file-info').val('');
    this.onVcfUrlEntered(panelSelector);
}
DataCard.prototype.displayPlatinumUrlBox = function(panelSelector) {
  if (!panelSelector) {
    panelSelector = $('#datasource-dialog');
  }

  var cardIndex = panelSelector.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];

  variantCard.setDefaultSampleName(this.defaultSampleNames[variantCard.getRelationship()]);
  window.utility.updateUrl('sample' + cardIndex, this.defaultSampleNames[variantCard.getRelationship()]);

  panelSelector.find('#url-input').val(this.defaultUrls[variantCard.getRelationship()]);
  panelSelector.find('#datasource-name').val(this.defaultNames[variantCard.getRelationship()]);
  panelSelector.find("#url-input").removeClass('hide');
    panelSelector.find("#url-input").focus();
  panelSelector.find("#url-tbi-input").addClass('hide');
  panelSelector.find("#url-tbi-input").val('');
    panelSelector.find('#vcf-file-info').addClass('hide');
    panelSelector.find('#vcf-file-info').val('');

    this.onVcfUrlEntered(panelSelector);
}
DataCard.prototype.clearUrl = function(panelSelector) {
  var me = this;
  if (!panelSelector) {
    panelSelector = $('#datasource-dialog');
  }

  var cardIndex = panelSelector.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];

  window.utility.removeUrl('vcf'+cardIndex);
  panelSelector.find("#url-input").val("");
  panelSelector.find("#url-tbi-input").val("");
  panelSelector.find("#vcf-file-info").val("");
  panelSelector.find('#vcf-sample-select')[0].selectize.clearOptions();
  panelSelector.find('#vcf-sample-select-box').removeClass("attention");
  panelSelector.find('#vcf-sample-box').addClass('hide');

  if (me.mode == 'trio' && variantCard.getRelationship() == 'proband') {
    $('#unaffected-sibs-select')[0].selectize.clearOptions();
    $('#affected-sibs-select')[0].selectize.clearOptions();
  }
  $('#unaffected-sibs-box').addClass('hide');
  $('#affected-sibs-box').addClass('hide');
  variantCard.clearVcf();
  me.enableLoadButton();
}

DataCard.prototype.onVcfFileButtonClicked = function(panelSelector) {
  let me = this;
  if (!panelSelector) {
    panelSelector = $('#datasource-dialog');
  }
  panelSelector.find('#vcf-file-info').removeClass("hide");

  panelSelector.find('#url-input').addClass('hide');
  panelSelector.find('#url-input').val('');
  panelSelector.find('#url-tbi-input').addClass('hide');
  panelSelector.find('#url-tbi-input').val('');


  me.disableLoadButton();
}

DataCard.prototype.onVcfFilesSelected = function(event) {
  var me = this;

  $('#tourWelcome').removeClass("open");

  // Show the file name
  me.panelSelectorFilesSelected.find('#vcf-file-info').removeClass('hide');
  for (var i = 0; i < event.currentTarget.files.length; i++) {
    var file = event.currentTarget.files[i];
    if (!file.name.endsWith(".tbi")) {
      me.panelSelectorFilesSelected.find('#vcf-file-info').val(file.name);
    }
  }

  this.setDataSourceName(this.panelSelectorFilesSelected);
  this.setDataSourceRelationship(this.panelSelectorFilesSelected);

  var cardIndex = this.panelSelectorFilesSelected.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];

  // We cannot load a vcf local file from a URL (must be choosen by user), so we just
  // need to clear out any previously selected vcf url.
  window.utility.removeUrl('vcf'+cardIndex);
  window.utility.removeUrl('sample'+cardIndex);


  me.panelSelectorFilesSelected.find('#vcf-sample-box').addClass('hide');
  $('#unaffected-sibs-box').addClass('hide');
  $('#affected-sibs-box').addClass('hide');
  me.panelSelectorFilesSelected.find('.vcf-sample.loader').removeClass('hide');


  variantCard.onVcfFilesSelected(
    event,
    function(vcfFileName, sampleNames) {
      me.setDefaultBuildFromData();

      me.panelSelectorFilesSelected.find('.vcf-sample.loader').addClass('hide');

      me.panelSelectorFilesSelected.find('#vcf-file-info').removeClass('hide');
      me.panelSelectorFilesSelected.find('#vcf-file-info').val(vcfFileName);

      // Only show the sample dropdown if the vcf file has more than one sample
      if (sampleNames.length > 1) {
        me.populateSampleDropdowns(variantCard, me.panelSelectorFilesSelected, sampleNames);

      } else {
        if (sampleNames.length == 1) {
          variantCard.setSampleName(sampleNames[0]);
        } else {
          variantCard.setSampleName("");
          variantCard.setDefaultSampleName(null);
        }
        me.panelSelectorFilesSelected.find('#vcf-sample-select-box').removeClass("attention");

        window.utility.removeUrl('sample'+cardIndex);

        me.enableLoadButtonIfBuildSet(true);
      }
    },
    function(error) {
      me.panelSelectorFilesSelected.find(".vcf-sample.loader").addClass("hide");
    });
}

DataCard.prototype.populateSampleDropdowns = function(variantCard, panelSelector, sampleNames) {
  var me = this;


    // When the sample name dropdown is selected
    panelSelector.find('#vcf-sample-select')[0].selectize.off('change');

  // Populate the sample names in the dropdown
  panelSelector.find('#vcf-sample-box').removeClass('hide');
  if (me.mode == 'trio' && variantCard.getRelationship() == 'proband') {
    $('#unaffected-sibs-box').removeClass('hide');
    $('#affected-sibs-box').removeClass('hide');
  }
  panelSelector.find('#vcf-sample-select')[0].selectize.clearOptions();
  if (variantCard.getRelationship() == 'proband') {
    $('#unaffected-sibs-select')[0].selectize.clearOptions();
    $('#affected-sibs-select')[0].selectize.clearOptions();
  }
  // Add a blank option if there is more than one sample in the vcf file
  if (sampleNames.length > 1) {
    panelSelector.find('#vcf-sample-select')[0].selectize.addOption({value:""});
    if (variantCard.getRelationship() == 'proband') {
      $('#unaffected-sibs-select')[0].selectize.addOption({value:""});
      $('#affected-sibs-select')[0].selectize.addOption({value:""});
    }
  }

  // Populate the sample name in the dropdown
  sampleNames.forEach( function(sampleName) {
    panelSelector.find('#vcf-sample-select')[0].selectize.addOption({value:sampleName});
    if (variantCard.getRelationship() == 'proband') {
      $('#unaffected-sibs-select')[0].selectize.addOption({value:sampleName});
      $('#affected-sibs-select')[0].selectize.addOption({value:sampleName});
    }
  });



  if (variantCard.getRelationship() == 'proband') {
    me.initSibs();
  }

  // If we are loading from URL parameters and the sample name was specified, select this
  // sample from dropdown
  if (variantCard.getDefaultSampleName() != null && variantCard.getDefaultSampleName() != "") {
    panelSelector.find('#vcf-sample-select-box').removeClass("attention");

    panelSelector.find('#vcf-sample-select')[0].selectize.setValue(variantCard.getDefaultSampleName());

    variantCard.setSampleName(variantCard.getDefaultSampleName());
    variantCard.setDefaultSampleName(null);
    me.enableLoadButtonIfBuildSet(true);
  } else {
    panelSelector.find('#vcf-sample-select-box').addClass("attention");

    me.disableLoadButton();
  }

  // When the sample name dropdown is selected
    panelSelector.find('#vcf-sample-select')[0].selectize.on('change', function() {
    me.onVcfSampleSelected(panelSelector);
  });

}

DataCard.prototype.onVcfSampleSelected = function(panelSelector) {
  var me = this;
  var cardIndex = panelSelector.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];
  var sampleName = panelSelector.find('#vcf-sample-select')[0].selectize.getValue();
  panelSelector.find('#datasource-name').val(sampleName);
  variantCard.setSampleName(sampleName);
  variantCard.setName(sampleName);
  panelSelector.find('#vcf-sample-select-box').removeClass("attention");


  window.utility.updateUrl('sample' + cardIndex, sampleName);
  window.utility.updateUrl('name' + cardIndex, sampleName);
  if (variantCard.isReadyToLoad()) {
    me.enableLoadButtonIfBuildSet(true);
  }
}

DataCard.prototype.onVcfUrlEntered = function(panelSelector, callback) {
  var me = this;
  if (!panelSelector) {
    panelSelector = $('#datasource-dialog');
  }
  $('#tourWelcome').removeClass("open");

  var cardIndex = panelSelector.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];

  this.setDataSourceName(panelSelector);
  this.setDataSourceRelationship(panelSelector);


  var vcfUrl = panelSelector.find('#url-input').val();


  var tbiUrl =  '';
  if ($('#separate-url-for-index-files-cb').is(":checked")) {
    tbiUrl = panelSelector.find('#url-tbi-input').val();
  }

  if (isOffline) {
    if (vcfUrl.indexOf(offlineUrlTag) == 0) {
      vcfUrl = "http://" + serverInstance + serverDataDir + vcfUrl.split(offlineUrlTag)[1];
    }
  }

  panelSelector.find('#vcf-sample-box').addClass('hide');
  panelSelector.find('.vcf-sample.loader').removeClass('hide');

  window.utility.updateUrl('vcf'+cardIndex, encodeURIComponent(vcfUrl));
  window.utility.updateUrl('tbi'+cardIndex, encodeURIComponent(tbiUrl));

  variantCard.onVcfUrlEntered(vcfUrl, tbiUrl, function(success, sampleNames) {
    if (vcfUrl && vcfUrl != "") {
      panelSelector.find('.vcf-sample.loader').addClass('hide');

      if (success) {
        me.setDefaultBuildFromData();

        // Only show the sample dropdown if there is more than one sample
        if (sampleNames.length > 1) {
          me.populateSampleDropdowns(variantCard, panelSelector, sampleNames);

        } else {
          if (sampleNames.length == 1) {
            variantCard.setSampleName(sampleNames[0]);
          } else {
            variantCard.setSampleName("");
            variantCard.setDefaultSampleName(null);
          }
          panelSelector.find('#vcf-sample-select-box').removeClass("attention");
          window.utility.removeUrl('sample'+cardIndex);


          me.enableLoadButtonIfBuildSet(true);
        }

      } else {
        me.disableLoadButton();
      }

      if (callback) {
        callback(success);
      }
    } else {
      window.enableLoadButton();
      callback(success);
    }


  });
}



DataCard.prototype.promiseSetVcfUrl = function(relationship, name, sampleName, vcfUrl, tbiUrl) {
  var me = this;

  return new Promise(function(resolve, reject) {
    var variantCard = getVariantCard(relationship);
    variantCard.setRelationship(relationship);
    variantCard.setName(name);
    variantCard.setVariantCardLabel();
    variantCard.showDataSources(name);
    variantCard.onVcfUrlEntered(vcfUrl, tbiUrl, function(success, sampleNames) {
      if (sampleName) {
        variantCard.setSampleName(sampleName);
      }
      resolve();
    });
  });
}

DataCard.prototype.setDataSourceName = function(panelSelector) {
  if (!panelSelector) {
    panelSelector = $('#datasource-dialog');
  }
  var cardIndex = panelSelector.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];

  var dsName = panelSelector.find('#datasource-name').val();
  variantCard.setName(dsName);
  variantCard.showDataSources(dsName);

  //  $('#variant-card-button-' + cardIndex ).text(dsName);
  window.utility.updateUrl('name' + cardIndex, dsName);

}


DataCard.prototype.setAffected = function(panelSelector) {
  if (!panelSelector) {
    panelSelector = $('#datasource-dialog');
  }
  var cardIndex = panelSelector.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];



  if (cardIndex == 0) {
    variantCard.setAffectedStatus('affected');
    panelSelector.find('#affected-cb').attr("checked", true)
    panelSelector.find('#affected-cb').attr("disabled", "disabled");

  } else {
    var isAffected = panelSelector.find('#affected-cb').is(":checked");
    variantCard.setAffectedStatus(isAffected ? "affected" : "unaffected");
    window.utility.updateUrl('affectedStatus' + cardIndex, isAffected);

  }

}

DataCard.prototype.setDataSourceRelationship = function(panelSelector) {
  if (!panelSelector) {
    panelSelector = $('#datasource-dialog');
  }

  var cardIndex = panelSelector.find('#card-index').val();
  var variantCard = variantCards[+cardIndex];

  var dsRelationship = panelSelector.find('#datasource-relationship').val();
  variantCard.setRelationship(dsRelationship);
  window.utility.updateUrl('rel' + cardIndex, dsRelationship);
}



DataCard.prototype.enableLoadButton = function() {
  let me = this;
  var enable = false;

  var cards = {};
  variantCards.forEach(function(vc) {
    cards[vc.getRelationship()] = vc;
  });

  if (dataCard.mode == 'single') {
    if (cards['proband'].isReadyToLoad()) {
      if (window.gene) {
        $('#gene-name-data-dialog-box').removeClass("attention");
        if (genomeBuildHelper.getCurrentBuild()) {
          $('#select-build-box').removeClass("attention");
          enable = true;
        } else {
          $('#select-build-box').addClass("attention");
        }
      } else {
        $('#gene-name-data-dialog-box').addClass("attention");
      }
    }
  } else if (dataCard.mode == 'trio') {
    if (cards['proband'].isReadyToLoad() && cards['mother'].isReadyToLoad() && cards['father'].isReadyToLoad()) {
      if (window.gene) {
        $('#gene-name-data-dialog-box').removeClass("attention");
        if (genomeBuildHelper.getCurrentBuild()) {
          $('#select-build-box').removeClass("attention");
          enable = true;
        } else {
          $('#select-build-box').addClass("attention");
        }
      } else {
        $('#gene-name-data-dialog-box').addClass("attention");
      }
    }
  }
  if (enable) {
    $('#data-card').find('#ok-button').removeClass("disabled");
  } else {
    $('#data-card').find('#ok-button').addClass("disabled");
  }


}

DataCard.prototype.disableLoadButton = function() {
  $('#data-card').find('#ok-button').addClass("disabled");
}


DataCard.prototype.toggleSampleTrio = function(show) {
  let me = this;
  if (show) {
    me.mode = 'trio';
    $('#mother-data').removeClass("hide");
    $('#father-data').removeClass("hide");
    if (Object.keys($('#proband-data #vcf-sample-select')[0].selectize.options).length > 0) {
      $('#unaffected-sibs-box').removeClass("hide");
      $('#affected-sibs-box').removeClass("hide");
    } else {
      $('#unaffected-sibs-box').addClass("hide");
      $('#affected-sibs-box').addClass("hide");
    }
  } else {
    me.mode = 'single';
    $('#mother-data').addClass("hide");
    $('#father-data').addClass("hide");
    $('#unaffected-sibs-box').addClass("hide");
    $('#affected-sibs-box').addClass("hide");
    var motherCard = null;
    var fatherCard = null;
  }
  me.enableLoadButton();

}


DataCard.prototype.clearMotherFatherData = function() {
  let me = this;
  var motherCard = null;
  var fatherCard = null;
  if (me.mode == 'single') {
    variantCards.forEach( function(variantCard) {
      if (variantCard.getRelationship() == 'mother') {
        motherCard = variantCard;
        motherCard.clearVcf();
        motherCard.clearBam();
        motherCard.hide();
        $('#mother-data').find('#vcf-file-info').val('');
        $('#mother-data').find('#vcf-url-input').val('');
        utility.removeUrl("vcf1");
        utility.removeUrl("bam1");
      } else if (variantCard.getRelationship() == 'father') {
        fatherCard = variantCard;
        fatherCard.clearVcf();
        fatherCard.clearBam();
        fatherCard.hide();
        $('#father-data').find('#vcf-file-info').val('');
        $('#father-data').find('#vcf-url-input').val('');
        utility.removeUrl("vcf2");
        utility.removeUrl("bam2");
      }
    });
  }

}

