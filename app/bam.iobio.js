
// extending Thomas Down's original BAM js work

var Bam = Class.extend({

   init: function(bamUri, options) {
      this.bamUri = bamUri;
      this.options = options; // *** add options mapper ***
      // test if file or url
      if (typeof(this.bamUri) == "object") {
         this.sourceType = "file";
         this.bamBlob = new BlobFetchable(bamUri);
         this.baiBlob = new BlobFetchable(this.options.bai); // *** add if statement if here ***
         this.promises = [];
         this.bam = undefined;
         var me = this;
         makeBam(this.bamBlob, this.baiBlob, function(bam) {
            me.setHeader(bam.header);
            me.provide(bam);
         });
      } else if ( this.bamUri.slice(0,4) == "http" || this.bamUri.slice(0,3) == "ftp" ) {
         this.sourceType = "url";
      }
      this.bamFile = null;
      this.baiFile = null;

      // set iobio servers
      this.iobio = {};

      this.iobio.samtools            = dev_iobio_services + "samtools/"
      this.iobio.coverage            = dev_iobio_services + "coverage/ ";
      this.iobio.cat                 = dev_iobio_services + "cat/ ";
      this.iobio.samtoolsOnDemand    = iobio_services + "od_samtools/";
      this.iobio.freebayes           = dev_iobio_services + "freebayes/";
      this.iobio.vcflib              = dev_iobio_services + "vcflib/";
      this.iobio.vt                  = dev_iobio_services + "vt/";


      // to be deleted after devkit conversion
      this.iobio.coverageService                = "ws://" + dev_iobio_services + "coverage/ ";
      this.iobio.samtoolsService                = "ws://" + "nv-prod.iobio.io/" + "samtools";
      this.iobio.samtoolsServiceOnDemand        = iobio_services + "od_samtools";
      this.iobio.freebayesService               = iobio_services + "freebayes";
      this.iobio.vcflibService                  = iobio_services + "vcflib";
      this.iobio.vtService                      = iobio_services + "vt";


      this.errorMessageMap =  {
        "samtools Error: stderr - Could not load .bai":  "Unable to load the index (.bai) file, which has to exist in same directory and be given the same name as the .bam with the file extension of .bam.bai.",
        "samtools Error: stderr - [E::hts_open] fail to open file": "Unable to access the file.  ",
        "samtools Error: stderr - [M::test_and_fetch] downloading file": "Invalid index or compressed vcf.  Try re-creating the bam and index file."
      }

      var ignoreMessageMap =  {
        //"tabix Error: stderr - [M::test_and_fetch] downloading file": {ignore: true}
      }


      return this;
   },



  checkBamUrl: function(url, callback) {
    var me = this;
    var success = null;
    var cmd = new iobio.cmd(
        me.iobio.samtools,
        ['view', '-H', url]
    );

    cmd.on('data', function(data) {
      if (data != undefined) {
        success = true;
      }
    });

    cmd.on('end', function() {
      if (success == null) {
        success = true;
        callback(success);
      }
    });

    cmd.on('error', function(error) {
      if (me.ignoreErrorMessage(error)) {
        success = true;
        callback(success)
      } else {
        if (success == null) {
          success = false;
          callback(success, 'An error occurred when accessing ' + url + ".  " + me.translateErrorMessage(error));
        }
      }

    });

    cmd.run();
  },

  ignoreErrorMessage: function(error) {
    var me = this;
    var ignore = false;
    for (err in me.ignoreMessageMap) {
      if (error.indexOf(err) == 0) {
        ignore = me.ignoreMessageMap[err].ignore;
      }
    }
    return ignore;

  },

  translateErrorMessage:  function(error) {
    var me = this;
    var message = null;
    for (err in me.errorMessageMap) {
      if (message == null && error.indexOf(err) == 0) {
        message = me.errorMessageMap[err];
      }
    }
    return message ? message : error;
  },

  checkBamFile: function(event, callback, errorCallback) {
    var me = this;

    if (event.target.files.length != 2) {
       errorCallback('must select 2 files, both a .bam and .bam.bai file');
    }

    if (endsWith(event.target.files[0].name, ".sam") ||
        endsWith(event.target.files[1].name, ".sam")) {
      errorCallback('You must select a bam file, not a sam file');
    }

    var fileType0 = /([^.]*)\.(bam(\.bai)?)$/.exec(event.target.files[0].name);
    var fileType1 = /([^.]*)\.(bam(\.bai)?)$/.exec(event.target.files[1].name);

    var fileExt0 = fileType0 && fileType0.length > 1 ? fileType0[2] : null;
    var fileExt1 = fileType1 && fileType1.length > 1 ? fileType1[2] : null;

    var rootFileName0 = fileType0 && fileType0.length > 1 ? fileType0[1] : null;
    var rootFileName1 = fileType1 && fileType1.length > 1 ? fileType1[1] : null;


    if (fileType0 == null || fileType0.length < 3 || fileType1 == null || fileType1.length <  3) {
      errorCallback('You must select BOTH  a compressed bam file  and an index (.bai)  file');
    }


    if (fileExt0 == 'bam' && fileExt1 == 'bam.bai') {
      if (rootFileName0 != rootFileName1) {
        errorCallback('The index (.bam.bai) file must be named ' +  rootFileName0 + ".bam.bai");
      } else {
        me.bamFile   = event.target.files[0];
        me.baiFile = event.target.files[1];
      }
    } else if (fileExt1 == 'bam' && fileExt0 == 'bam.bai') {
      if (rootFileName0 != rootFileName1) {
        errorCallback('The index (.bam.bai) file must be named ' +  rootFileName1 + ".bam.bai");
      } else {
        me.bamFile   = event.target.files[1];
        me.baiFile = event.target.files[0];
      }
    } else {
      errorCallback('You must select BOTH  a bam and an index (.bam.bai)  file');
    }

    callback(true);
  },




   fetch: function( name, start, end, callback, options ) {
      var me = this;
      // handle bam has been created yet
      if(this.bam == undefined) // **** TEST FOR BAD BAM ***
         this.promise(function() { me.fetch( name, start, end, callback, options ); });
      else
         this.bam.fetch( name, start, end, callback, options );
   },

   promise: function( callback ) {
      this.promises.push( callback );
   },

   provide: function(bam) {
      this.bam = bam;
      while( this.promises.length != 0 )
         this.promises.shift()();
   },

   _makeid: function() {
      // make unique string id;
       var text = "";
       var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

       for( var i=0; i < 5; i++ )
           text += possible.charAt(Math.floor(Math.random() * possible.length));

       return text;
   },

   _getBamUrl: function(name, start, end) {
      return this._getBamRegionsUrl([ {'name':name,'start':start,'end':end} ]);
   },

   _getBamRegionsUrl: function(regions, golocal) {
      var samtools = this.sourceType == "url" ? this.iobio.samtoolsServiceOnDemand : this.iobio.samtoolsService;
      if ( this.sourceType == "url") {
         var regionStr = "";
         regions.forEach(function(region) { regionStr += " " + region.name + ":" + region.start + "-" + region.end });
         var url = samtools + "?cmd= view -b " + this.bamUri + regionStr + "&protocol=http&encoding=binary";
      } else {

        var url = samtools + "?protocol=websocket&encoding=binary&cmd=view -S -b " + encodeURIComponent("http://client");


      }
      return encodeURI(url);
   },

    _getBamPileupUrl: function(region, golocal) {
      var samtools = this.sourceType == "url" ? this.iobio.samtoolsServiceOnDemand : this.iobio.samtoolsService;
      if ( this.sourceType == "url") {
         var bamRegionsUrl = this._getBamRegionsUrl([region], golocal);
         var url = samtools + "?protocol=http&encoding=utf8&cmd= mpileup " + encodeURIComponent(bamRegionsUrl);
      } else {

        var url = samtools + "?protocol=websocket&encoding=utf8&cmd= mpileup " + encodeURIComponent("http://client");

      }
      return encodeURI(url);
   },



   getReferencesWithReads: function(callback) {
      var refs = [];
      var me = this;
      if (this.sourceType == 'url') {

      } else {
         this.getHeader(function(header) {
            for (var i=0; i < header.sq.length; i++) {
               if ( me.bam.indices[me.bam.chrToIndex[header.sq[i].name]] != undefined )
                  refs.push( header.sq[i] );
            }
            callback(refs);
         })
      }
   },

   // *** bamtools functionality ***

   convert: function(format, name, start, end, callback, options) {
      // Converts between BAM and a number of other formats
      if (!format || !name || !start || !end)
         return "Error: must supply format, sequenceid, start nucleotide and end nucleotide"

      if (format.toLowerCase() != "sam")
         return "Error: format + " + options.format + " is not supported"
      var me = this;
      this.fetch(name, start, end, function(data,e) {
         if(options && options.noHeader)
            callback(data, e);
         else {
            me.getHeader(function(h) {
               callback(h.toStr + data, e);
            })
         }
      }, { 'format': format })
   },


   getHeader: function(callback) {
      var me = this;
      if (me.header)
         callback(me.header);
      else if (me.sourceType == 'file')
         me.promise(function() { me.getHeader(callback); })
      else {
         var client = BinaryClient(me.iobio.samtoolsService);
         var url = encodeURI( me.iobio.samtoolsServiceOnDemand + '?cmd=view -H ' + this.bamUri)
         client.on('open', function(stream){
            var stream = client.createStream({event:'run', params : {'url':url}});
            var rawHeader = ""
            stream.on('data', function(data, options) {
               rawHeader += data;
            });
            stream.on('end', function() {
               me.setHeader(rawHeader);
               callback( me.header);
            });
         });
      }

      // need to make this work for URL bams
      // need to incorporate real promise framework throughout
   },

   setHeader: function(headerStr) {
      var header = { sq:[], toStr : headerStr };
      var lines = headerStr.split("\n");
      for ( var i=0; i<lines.length > 0; i++) {
         var fields = lines[i].split("\t");
         if (fields[0] == "@SQ") {
            var fHash = {};
            fields.forEach(function(field) {
              var values = field.split(':');
              fHash[ values[0] ] = values[1]
            })
            header.sq.push({name:fHash["SN"], end:1+parseInt(fHash["LN"])});
         }
      }
      this.header = header;
   },



   transformRefName: function(refName, callback) {
    var found = false;
    this.getHeader(function(header) {
      header.sq.forEach(function(seq) {
        if (seq.name == refName || seq.name.split('chr')[1] == refName || seq.name == refName.split('chr')[1]) {
          found = true;
          callback(seq.name);
        }
      })
      if (!found) callback(refName); // not found
    })
   },


   /*
   *  This method will return coverage as point data.  It takes the reference name along
   *  with the region start and end.  Optionally, the caller can provide an array of
   *  region objects to get the coverage at exact positions.  Also, this method takes an
   *  optional argument of maxPoints that will specify how many data points should be returned
   *  for the region.  If not specified, all data points are returned.  The callback method
   *  will send back to arrays; one for the coverage points, reduced down to the maxPoints, and
   *  the second for coverage of specific positions.  The latter can then be matched to vcf records
   *  , for example, to obtain the coverage for each variant.
   */
   getCoverageForRegionOld: function(refName, regionStart, regionEnd, regions, maxPoints, callback) {
      var me = this;
      this.transformRefName(refName, function(trRefName){

        // set the ref name for every region and find the lower and upper bound (start, end)
        // of all regions;

        var regionsArg = "";
        regions.forEach( function(region) {
          region.name = trRefName;
          if (region.name && region.start && region.end) {
            if (regionsArg.length == 0) {
              regionsArg += " -p ";
            } else {
              regionsArg += ",";
            }
            regionsArg += region.name + ":" + region.start +  ":" + region.end;
          }
        });
        var maxPointsArg = "";
        if (maxPoints) {
          maxPointsArg = " -m " + maxPoints;
        } else {
          maxPointsArg = " -m 0"
        }
        var spanningRegionArg = " -r " + trRefName + ":" + regionStart + ":" + regionEnd;
        var spanningRegion = {name:trRefName, start: regionStart, end: regionEnd};
        var protocol = me.sourceType == "url" ? '&protocol=http' : '';
        var url = encodeURI( me.iobio.coverageService + '?encoding=utf8' + protocol + '&cmd= ' + maxPointsArg  + spanningRegionArg + regionsArg + " " + encodeURIComponent(me._getBamPileupUrl(spanningRegion,true)) );
        //var url = encodeURI( me.iobio.coverage + '?encoding=utf8' + protocol + '&cmd= ' + maxPointsArg  + spanningRegionArg + regionsArg + " " + encodeURIComponent(me._getBamRegionsUrl([spanningRegion],true)) );

        var client = BinaryClient(me.iobio.coverageService);

        var samData = "";
        var samRecs = [];
        var parseByLine = false;
        client.on('open', function(stream){
            var stream = client.createStream({event:'run', params : {'url':url}});

            // New local file streaming
            stream.on('createClientConnection', function(connection) {
              var ended = 0;
              var dataClient = BinaryClient('ws://' + connection.serverAddress);
              dataClient.on('open', function() {
                var dataStream = dataClient.createStream({event:'clientConnected', 'connectionID' : connection.id});
                dataStream.write(me.header.toStr);
                var theRegions = [spanningRegion];
                for (var i=0; i < theRegions.length; i++) {
                  var region = theRegions[i];
                   me.convert('sam', region.name, region.start, region.end, function(data,e) {
                      dataStream.write(data);
                      ended += 1;
                      if ( theRegions.length == ended) dataStream.end();
                   }, {noHeader:true});
                }
              })
            });

            stream.on('data', function(data, options) {
               if (data == undefined) {
                return;
               }

                samData += data;
            });

            stream.on('end', function() {
                if (samData != "") {
                  var coverage = null;
                  var coverageForPoints = [];
                  var coverageForRegion = [];
                  var lines = samData.split('\n');
                  lines.forEach(function(line) {
                    if (line.indexOf("#specific_points") == 0) {
                      coverage = coverageForPoints;
                    } else if (line.indexOf("#reduced_points") == 0 ) {
                      coverage = coverageForRegion;
                    } else {
                      var fields = line.split('\t');
                      var pos = -1;
                      var depth = -1;
                      if (fields[0] != null && fields[0] != '') {
                        var pos   = +fields[0];
                      }
                      if (fields[1] != null && fields[1] != '') {
                        var depth = +fields[1];
                      }
                      if (coverage){
                        if (pos > -1  && depth > -1) {
                          coverage.push([pos, depth]);
                        }
                      }
                    }
                  });
                  callback(coverageForRegion, coverageForPoints);

                } else {
                  callback([]);
                }
            });

            stream.on("error", function(error) {
              console.log("encountered stream error: " + error);
            });

        });
      });
   },

   /*
   *  This method will return coverage as point data.  It takes the reference name along
   *  with the region start and end.  Optionally, the caller can provide an array of
   *  region objects to get the coverage at exact positions.  Also, this method takes an
   *  optional argument of maxPoints that will specify how many data points should be returned
   *  for the region.  If not specified, all data points are returned.  The callback method
   *  will send back to arrays; one for the coverage points, reduced down to the maxPoints, and
   *  the second for coverage of specific positions.  The latter can then be matched to vcf records
   *  , for example, to obtain the coverage for each variant.
   */
   getCoverageForRegion: function(refName, regionStart, regionEnd, regions, maxPoints, callback, callbackError) {
      var me = this;
      this.transformRefName(refName, function(trRefName){
        var samtools = this.sourceType == "url" ? trRefNameOnDemand : me.iobio.samtools;

        var regionsArg = "";
        regions.forEach( function(region) {
          region.name = trRefName;
          if (region.name && region.start && region.end) {
            if (regionsArg.length == 0) {
              regionsArg += " -p ";
            } else {
              regionsArg += ",";
            }
            regionsArg += region.name + ":" + region.start +  ":" + region.end;
          }
        });
        var maxPointsArg = "";
        if (maxPoints) {
          maxPointsArg = " -m " + maxPoints;
        } else {
          maxPointsArg = " -m 0"
        }
        var spanningRegionArg = " -r " + trRefName + ":" + regionStart + ":" + regionEnd;
        var regionArg =  trRefName + ":" + regionStart + "-" + regionEnd;

        var cmd = null;
        // When file served remotely, first run samtools view, then run samtools mpileup.
        // When bam file is read as a local file, just stream sam records for region to
        // samtools mpileup.
        if (me.sourceType == "url") {
          cmd = new iobio.cmd(samtools, ['view', '-b',       me.bamUri, regionArg],
            {
              'urlparams': {'encoding':'binary'}
            });
          cmd = cmd.pipe(samtools, ["mpileup"]);
        } else {

          function writeSamFile (stream) {
             stream.write(me.header.toStr);
             me.convert('sam', trRefName, regionStart, regionEnd, function(data,e) {
                stream.write(data);
                stream.end();
             }, {noHeader:true});
          }

          cmd = new iobio.cmd(samtools, ['mpileup',  writeSamFile ],
          // cmd = new iobio.cmd('0.0.0.0:8060', ['mpileup',  new Blob()],
            {
              'urlparams': {'encoding':'utf8'}
            });



/*
this is troubleshooting code.  if cat.sh pipes to a file first, the samtools mpileup
doesn't truncate.
          cmd = new iobio.cmd(me.iobio.cat, [new Blob()],
            {

              writeStream: function(stream) {
                 stream.write(me.header.toStr);
                 me.convert('sam', trRefName, regionStart, regionEnd, function(data,e) {
                    stream.write(data);
                    stream.end();
                 }, {noHeader:true});
              }
            })
          cmd = cmd.pipe(samtools, ['mpileup']);
*/
        }

        // After running samtools mpileup, run coverage service to summarize point data.
        cmd = cmd.pipe(me.iobio.coverage, [maxPointsArg, spanningRegionArg, regionsArg]);

        var samData = "";
        cmd.on('data', function(data) {
          if (data == undefined) {
            return;
          }

          samData += data;
        });

        cmd.on('end', function() {

          if (samData != "") {
            var coverage = null;
            var coverageForPoints = [];
            var coverageForRegion = [];
            var lines = samData.split('\n');
            lines.forEach(function(line) {
              if (line.indexOf("#specific_points") == 0) {
                coverage = coverageForPoints;
              } else if (line.indexOf("#reduced_points") == 0 ) {
                coverage = coverageForRegion;
              } else {
                var fields = line.split('\t');
                var pos = -1;
                var depth = -1;
                if (fields[0] != null && fields[0] != '') {
                  var pos   = +fields[0];
                }
                if (fields[1] != null && fields[1] != '') {
                  var depth = +fields[1];
                }
                if (coverage){
                  if (pos > -1  && depth > -1) {
                    coverage.push([pos, depth]);
                  }
                }
              }
            });
          }
          callback(coverageForRegion, coverageForPoints);
        });

        cmd.on('error', function(error) {
          console.log(error);

        });

        cmd.run();


      });

   },


   //
   //
   // NEW
   //
   //
   getFreebayesVariantsOld: function(refName, regionStart, regionEnd, regionStrand, callback) {

    var me = this;
    this.transformRefName(refName, function(trRefName){

      var refFile = null;
      // TODO:  This is a workaround until we introduce a genome build dropdown.  For
      // now, we support Grch37 and hg19.  For now, this lame code simply looks at
      // the reference name to determine if the references should be hg19 (starts with 'chr;)
      // or Crch37 (just the number, no 'chr' prefix).  Based on the reference,
      // we point freebayes to a particular directory for the reference files.
      if (trRefName.indexOf('chr') == 0) {
        refFile = "./data/references_hg19/" + trRefName + ".fa";
      } else {
        refFile = "./data/references/hs_ref_chr" + trRefName + ".fa";
      }
      var urlF = me.iobio.freebayesService
        + "?cmd=-f " + refFile  + " "
        + encodeURIComponent(me._getBamUrl(trRefName,regionStart,regionEnd));

      var urlV = me.iobio.vtService + '?cmd=normalize -r ' + refFile + ' ' + encodeURIComponent(encodeURI(urlF))

      var url = me.iobio.vcflibService + '?cmd=vcffilter -f "QUAL > 1" '
                + encodeURIComponent(encodeURI(urlV));

      me._callVariants(trRefName, regionStart, regionEnd, regionStrand, me.iobio.vcflibService, encodeURI(url), callback);
    });


   },




   //
   //
   // NEW
   //
   //
   _callVariants: function(refName, regionStart, regionEnd, regionStrand, server, url, callback) {

    var me = this;
    var client = BinaryClient(server);

    var variant = null;
    var stream = null;
    var vcfRecs = [];
    vcfRecs.length = null;

    client.on('open', function(){
      stream = client.createStream({event:'run', params : {'url':url}});

      // New local file streaming
      stream.on('createClientConnection', function(connection) {
        var ended = 0;
        var dataClient = BinaryClient('ws://' + connection.serverAddress);
        dataClient.on('open', function() {
          var dataStream = dataClient.createStream({event:'clientConnected', 'connectionID' : connection.id});
          dataStream.write(me.header.toStr);
          var regions =  [{'name':refName,'start':regionStart,'end':regionEnd} ];
          for (var i=0; i < regions.length; i++) {
            var region = regions[i];
             me.convert('sam', region.name, region.start, region.end, function(data,e) {
                dataStream.write(data);
                ended += 1;
                if ( regions.length == ended) dataStream.end();
             }, {noHeader:true});
          }
        })
      });

      //
      // listen for stream data (the output) event.
      //
      var buf = '';
      stream.on('data', function(data, options) {
        if (data == undefined) {
          return;
        }

        var success = true;
        try {
          buf += data;
        } catch(e) {
          success = false;
        }
        if(success) {
          if (callback) {
          }
        }
      });

      stream.on('end', function() {
        callback(buf);
      });

      stream.on("error", function(error) {
        console.log("encountered stream error: " + error);
      });

    });

   },


   //
   //
   // NEW
   //
   //
   getFreebayesVariants: function(refName, regionStart, regionEnd, regionStrand, callback) {

    var me = this;
    this.transformRefName(refName, function(trRefName){

      var samtools = this.sourceType == "url" ? trRefNameOnDemand : me.iobio.samtools;
      var refFile = null;
      // TODO:  This is a workaround until we introduce a genome build dropdown.  For
      // now, we support Grch37 and hg19.  For now, this lame code simply looks at
      // the reference name to determine if the references should be hg19 (starts with 'chr;)
      // or Crch37 (just the number, no 'chr' prefix).  Based on the reference,
      // we point freebayes to a particular directory for the reference files.
      if (trRefName.indexOf('chr') == 0) {
        refFile = "./data/references_hg19/" + trRefName + ".fa";
      } else {
        refFile = "./data/references/hs_ref_chr" + trRefName + ".fa";
      }
      var regionArg =  trRefName + ":" + regionStart + "-" + regionEnd;

      var cmd = null;
      // When file served remotely, first run samtools view, then run samtools mpileup.
      // When bam file is read as a local file, just stream sam records for region to
      // samtools mpileup.
      if (me.sourceType == "url") {
        cmd = new iobio.cmd(samtools, ['view', '-b', me.bamUri, regionArg],
          {
            'urlparams': {'encoding':'binary'}
          });
        cmd = cmd.pipe(me.iobio.freebayes, ['-f', refFile]);
      } else {

        var writeStream = function(stream) {
           stream.write(me.header.toStr);
           me.convert('sam', trRefName, regionStart, regionEnd, function(data,e) {
              stream.write(data);
              stream.end();
           }, {noHeader:true});
        }

        cmd = new iobio.cmd(me.iobio.freebayes, ['-f', refFile, writeStream],
            {
              'urlparams': {'encoding':'utf8'}
            });
      }


      cmd = cmd.pipe(me.iobio.vt, ['normalize', '-r', refFile]);
      cmd = cmd.pipe(me.iobio.vcflib, ['vcffilter', '-f', '\"QUAL > 1\"']);

      var variantData = "";
      cmd.on('data', function(data) {
          if (data == undefined) {
            return;
          }

          variantData += data;
      });

      cmd.on('end', function() {
        callback(variantData);
      });

      cmd.on('error', function(error) {
        console.log(error);
      });

      cmd.run();

    });

   },
   //
   //
   // NEW
   //
   //
   reducePoints: function(data, factor, xvalue, yvalue) {
      if (factor <= 1 ) {
        return data;
      }
      var i, j, results = [], sum = 0, length = data.length, avgWindow;

      if (!factor || factor <= 0) {
        factor = 1;
      }

      // Create a sliding window of averages
      for(i = 0; i < length; i+= factor) {
        // Slice from i to factor
        avgWindow = data.slice(i, i+factor);
        var min = 999999;
        var max = 0;
        for (j = 0; j < avgWindow.length; j++) {
            var y = yvalue(avgWindow[j]);
            sum += y != null ? d3.round(y) : 0;

            if (y > max) {
              max = y;
            }
            if (y < min) {
              min = y;
            }
        }
        var average = d3.round(sum / factor);
        results.push([xvalue(data[i]), average])
        sum = 0;
      }
      return results;
   }



});