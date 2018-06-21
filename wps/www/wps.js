var Petra = function() {

    var config = null;
    var map = null;
    var capabilities = null;
    var process = null;
    var executedProcesses = {};
    var intervalStatusProcesses = null;

    // using OpenLayers.Format.WPSCapabilities to read the capabilitiescon
    function getCapabilities() {
        OpenLayers.Request.GET({
            url: lizUrls['wps_wps'],
            params: {
                "SERVICE": "WPS",
                "REQUEST": "GetCapabilities"
            },
            success: function(response){
                capabilities = new OpenLayers.Format.WPSCapabilities().read(
                    response.responseText
                );
                var dropdown = document.getElementById("processing-processes");
                var offerings = capabilities.processOfferings, option;

                // populate the dropdown
                for (var p in offerings) {
                    // Remove alg if not set in wps_wps_project_config
                    if(
                        typeof wps_wps_project_config !== 'undefined'
                        && !(p in wps_wps_project_config)
                    ){
                        continue;
                    }
                    option = document.createElement("option");
                    option.innerHTML = offerings[p].title;
                    option.value = p;
                    dropdown.appendChild(option);
                }
            }
        });
    }

    // using OpenLayers.Format.WPSDescribeProcess to get information about a
    // process
    function describeProcess() {

        $("#processing-title").html('');
        $("#processing-abstract").html('');

        // clean form
        document.getElementById("processing-input").innerHTML = '';
        document.getElementById("processing-output").innerHTML = '';

        // clean info tables
        $('#processing-info-inputs tr:not(:first)').remove();
        $('#processing-info-outputs tr:not(:first)').remove();

        // clean log table
        $('#processing-log-table tr:not(:first) button').unbind('click');
        $('#processing-log-table tr:not(:first)').remove();

        // clean results table
        $('#processing-results-literal').hide();
        $('#processing-results-literal-table tr:not(:first)').remove();
        $('#processing-results-literal-table tr:first th:not(:first)').remove();
        $('#processing-results-layer').hide();
        $('#processing-results-layer-table tr:not(:first)').remove();
        $('#processing-results-layer-table tr:first th:not(:first)').remove();
        $('#processing-results-plot').html('').hide();

        var selection = this.options[this.selectedIndex].value;
        if ( selection != '' ) {
            //$('#processing-form-container').show();
            OpenLayers.Request.GET({
                url: lizUrls['wps_wps'],
                params: {
                    "SERVICE": "WPS",
                    "REQUEST": "DescribeProcess",
                    "VERSION": capabilities.version,
                    "IDENTIFIER": selection,
                    "repository": lizUrls.params.repository,
                    "project": lizUrls.params.project
                },
                success: function(response) {
                    process = new OpenLayers.Format.WPSDescribeProcess().read(
                        response.responseText
                    ).processDescriptions[selection];
                    buildForm();
                    $.get(lizUrls['wps_wps_results'],{
                            repository: lizUrls.params.repository,
                            project: lizUrls.params.project,
                            identifier: selection
                        }, function( d ) {
                            console.log('Get stored results');
                            console.log(d);
                            if ( !d )
                                return;
                            for ( var uuid in d ) {
                                var executedProcess = d[uuid];
                                if ( executedProcess ) {
                                    executedProcesses[uuid] = d[uuid];
                                    updateLogTable( d[uuid] );
                                }
                            }
                            scheduleUpdateStatusProcesses()
                        });
                }
            });
        } else {
            // Error : no selection in the process list combobox
        }
    }

    // dynamically create a form from the process description
    function buildForm() {
        $("#processing-title").html(process.title);
        if('abstract' in process && process.abstract != '')
            $("#processing-abstract").html(process.abstract);
        document.getElementById("processing-input").innerHTML = "<h3>Input:</h3>";
        document.getElementById("processing-output").innerHTML = "";
        $('#processing-info-inputs tr:not(:first)').remove();
        $('#processing-info-outputs tr:not(:first)').remove();

        //console.log(process);
        var inputs = process.dataInputs, supported = true,
            outputs = process.processOutputs,
            sld = "text/xml; subtype=sld/1.0.0",
            input, output;
        if ( !inputs )
            inputs = [];
        if ( !outputs )
            outputs = [];
        for (var i=0,ii=inputs.length; i<ii; ++i) {
            input = inputs[i];
            if (input.complexData) {
                var formats = input.complexData.supported.formats;
                if (formats["application/wkt"]) {
                    addWKTInput(input);
                } else if (formats["text/xml; subtype=gml/3.1.1"]) {
                    addGML3Input(input);
                } else if (formats["text/xml; subtype=gml/2.1.2"]) {
                    addGMLInput(input);
                } else if (formats["text/xml; subtype=wfs-collection/1.0"]) {
                    addWFSCollectionInput(input);
                } else if (formats["image/tiff"]) {
                    addRasterInput(input);
                } else if (formats[sld]) {
                    addXMLInput(input, sld);
                } else {
                    supported = false;
                }
            } else if (input.boundingBoxData) {
                addBoundingBoxInput(input);
            } else if (input.literalData) {
                addLiteralInput(input);
            } else {
                supported = false;
            }
            if (input.minOccurs > 0) {
                document.getElementById("processing-input-"+input.identifier+"-label").appendChild(document.createTextNode("* "));
            }
            // inputs table
            var tr = '<tr>';
            tr += '<td>'+input.title+'</td>';
            if (input.boundingBoxData)
                tr += '<td>Bounding box</td>';
            else if (input.literalData) {
                var dataType = input.literalData.dataType;
                if ( 'processMetadata' in input ) {
                    var qgisType = input.processMetadata.type;
                    if ( qgisType == 'number' )
                        tr += '<td>'+qgisType+' ('+dataType+')</td>';
                    else
                        tr += '<td>'+qgisType+'</td>';
                } else
                    tr += '<td>'+dataType+'</td>';
            }
            else
                tr += '<td></td>';
            if (input.minOccurs > 0)
                tr += '<td>Yes</td>';
            else
                tr += '<td></td>';
            tr += '</tr>';
            $('#processing-info-inputs tr:last').after(tr);
        }

        for (var i=0,ii=outputs.length; i<ii; ++i) {
            output = outputs[i];
            // outputs table
            var tr = '<tr>';
            tr += '<td>'+output.title+'</td>';
            tr += '<td></td>';
            tr += '</tr>';
            $('#processing-info-outputs tr:last').after(tr);
        }

        if (supported) {
            var executeDiv = document.createElement("div");
            executeDiv.setAttribute('class', 'form-actions');
            var executeButton = document.createElement("button");
            executeButton.innerHTML = "Execute";
            executeButton.setAttribute('class', 'btn');
            executeDiv.appendChild(executeButton);
            document.getElementById("processing-input").appendChild(executeDiv);
            executeButton.onclick = execute;
        } else {
            document.getElementById("processing-input").innerHTML = '<span class="notsupported">' +
                "Sorry, the WPS builder does not support the selected process." +
                "</span>";
        }
    }

    // helper function to dynamically create a textarea for geometry (WKT) data
    // input
    function addWKTInput(input, previousSibling) {
    }
    // input
    function addGMLInput(input, previousSibling) {
    }
    // input
    function addGML3Input(input, previousSibling) {
    }
    // helper function for xml input
    function addXMLInput(input, type) {
    }
    // helper function to dynamically create a WFS collection reference input
    function addWFSCollectionInput(input) {
    }
    // helper function to dynamically create a raster (GeoTIFF) url input
    function addRasterInput(input) {
    }

    // helper function to dynamically create a bounding box input
    function addBoundingBoxInput(input) {
        var name = input.identifier;
        var field = document.createElement("input");
        field.title = input.title;
        field.value = "left,bottom,right,top (EPSG:4326)";
        document.getElementById("processing-input").appendChild(field);
        addValueHandlers(field, function() {
            input.boundingBoxData = {
                projection: "EPSG:4326",
                bounds: OpenLayers.Bounds.fromString(field.value)
            };
        });
    }

    // helper function to create a literal input textfield or dropdown
    function addLiteralInput(input, previousSibling) {
        var name = input.identifier;
        var container = document.getElementById("processing-input");

        var control = document.createElement("div");
        control.setAttribute('class', 'control-group');
        var label = document.createElement("label");
        label.setAttribute('class', 'jforms-label control-label');
        label.setAttribute('for', 'processing-input-'+name);
        label.innerHTML = input.title;
        label.id = 'processing-input-'+name+'-label';
        control.appendChild(label);
        var fieldDiv = document.createElement("div");
        fieldDiv.setAttribute('class', 'controls');
        control.appendChild(fieldDiv);

        var dataType = input.literalData.dataType;
        var anyValue = input.literalData.anyValue;
        if ( dataType == 'boolean' ) {
            anyValue = false;
            input.literalData.allowedValues = {'False':true,'True':true};
        }
        var qgisType = '';
        if ( 'processMetadata' in input ) {
            qgisType = input.processMetadata.type;
        }
        var defaultValue = '';
        if ( 'defaultValue' in input.literalData ) {
            defaultValue = input.literalData.defaultValue;
        }
        //console.log(name+' '+dataType+' '+qgisType);
        //if ( qgisType == 'field' )
        //    console.log(input);


        // Restricted layers
        var restrictedLayers = [];
        if(
            typeof wps_wps_project_config !== 'undefined'
            && (process.identifier in wps_wps_project_config)
            && (name in wps_wps_project_config[process.identifier])
        ){
            restrictedLayers = wps_wps_project_config[process.identifier][name];
            if ( !$.isArray(restrictedLayers) )
                restrictedLayers = [];
        }

        // Get layers list
        var vectors = [];
        var rasters = [];
        if ( qgisType == 'vector' || qgisType == 'raster' || qgisType == 'source' ) {
            for ( l in lizMap.config.layers ) {
                var lConfig = lizMap.config.layers[l];
                if ( lConfig.type != 'layer' )
                    continue;
                if ( restrictedLayers.length != 0 && restrictedLayers.indexOf(l) == -1 )
                    continue;
                if ( 'geometryType' in lConfig ) {
                    vectors.push(l);
                } else {
                    rasters.push(l);
                }
            }
        }
        //console.log(input);

        // anyValue means textfield, otherwise we create a dropdown
        var field = document.createElement((dataType == 'boolean' || (dataType == 'string' && !anyValue) || qgisType == 'field' || qgisType == 'vector' || qgisType == 'raster' || qgisType == 'source') ? "select" : "input");
        field.id = 'processing-input-'+name;
        field.title = input.title;
        fieldDiv.appendChild(field);

        // Add simple class
        var fieldClass = 'qgisType-'+qgisType;
        field.setAttribute('class', fieldClass);

        previousSibling && previousSibling.nextSibling ?
            container.insertBefore(field, previousSibling.nextSibling) :
            container.appendChild(control);

        if ( dataType == 'boolean' ||  (dataType == 'string' && !anyValue) ) {
            var option;
            option = document.createElement("option");
            option.innerHTML = '---';
            field.appendChild(option);
            for (var v in input.literalData.allowedValues) {
                option = document.createElement("option");
                option.value = v;
                option.innerHTML = v;
                field.appendChild(option);
            }
            field.onchange = function() {
                createCopy(input, field, addLiteralInput);
                input.data = this.selectedIndex ? {
                    literalData: {
                        value: this.options[this.selectedIndex].value
                    }
                } : undefined;
            };
            if ( defaultValue ) {
                $(field).val(defaultValue);
                field.onchange();
            }
        } else if ( qgisType == 'field' ) {
            var option;
            option = document.createElement("option");
            option.innerHTML = '---';
            field.appendChild(option);
            fieldClass += ' ';
            fieldClass += 'fieldParentLayerParameterName-'+input.processMetadata.parentLayerParameterName;
            fieldClass += ' ';
            fieldClass += 'fieldDataType-'+input.processMetadata.dataType;
            field.setAttribute('class', fieldClass);
            field.onchange = function() {
                createCopy(input, field, addLiteralInput);
                input.data = this.selectedIndex ? {
                    literalData: {
                        value: this.options[this.selectedIndex].value
                    }
                } : undefined;
            };
        } else if ( qgisType == 'vector' || qgisType == 'source' ) {
            var option;
            option = document.createElement("option");
            option.innerHTML = '---';
            field.appendChild(option);
            for ( var i=0, len=vectors.length; i<len; i++) {
                var l = vectors[i];
                var lConfig = lizMap.config.layers[l];
                option = document.createElement("option");
                option.value = l;
                option.innerHTML = lConfig.title;
                field.appendChild(option);
            }
            field.onchange = function() {
                createCopy(input, field, addLiteralInput);
                updateQgisFieldInput(input, field);
                updateSelectFeaturesCheckbox(input, field);
                var l = this.options[this.selectedIndex].value;
                input.data = ( !l || l == '' ) ? undefined : {
                    literalData: {
                        value: l
                    }
                };
            };
            if ( qgisType == 'source' ) {
                $(field).after('<label class="checkbox inline disabled"><input id="processing-input-'+name+'-selection" type="checkbox" class="selection" disabled="disabled">Sélection</label>');
                $(field).parent().find('input[type="checkbox"].selection').change(function(){
                    var cbx = $(this);
                    if ( cbx.is(':checked') ) {
                        cbx.attr('checked', 'checked');
                        var aName = input.data.literalData.value;
                        var lConfig = lizMap.config.layers[aName];
                        if ( ('selectedFeatures' in lConfig) && lConfig.selectedFeatures.length > 0 ) {
                            aName = 'layer:'+aName+'?select='+encodeURIComponent('$id IN ( ' + lConfig.selectedFeatures.join() + ' ) ')
                        } else if ( ('filteredFeatures' in lConfig) && lConfig.filteredFeatures.length > 0 ) {
                            aName = 'layer:'+aName+'?select='+encodeURIComponent('$id IN ( ' + lConfig.filteredFeatures.join() + ' ) ')
                        }
                        input.data.literalData.value = aName;
                    } else {
                        if ( cbx.attr('checked') != undefined )
                            cbx.removeAttr('checked');
                        var aName = cbx.parent().parent().find('select').val();
                        input.data.literalData.value = aName;
                    }
                });
            }
        } else if ( qgisType == 'raster' ) {
            var option;
            option = document.createElement("option");
            option.innerHTML = '---';
            field.appendChild(option);
            for ( var i=0, len=rasters.length; i<len; i++) {
                var l = rasters[i];
                var lConfig = lizMap.config.layers[l];
                option = document.createElement("option");
                option.value = l;
                option.innerHTML = lConfig.title;
                field.appendChild(option);
            }
            field.onchange = function() {
                createCopy(input, field, addLiteralInput);
                input.data = this.selectedIndex ? {
                    literalData: {
                        value: this.options[this.selectedIndex].value
                    }
                } : undefined;
            };
        } else {
            if ( defaultValue ) {
                field.value = defaultValue;
                 defaultValue = {
                    literalData: {
                        value: defaultValue
                    }
                }
                input.data = defaultValue;
            } else {
                field.value = name + (dataType ? " (" + dataType + ")" : "");
                defaultValue = undefined;
            }
            addValueHandlers(field, function() {
                input.data = field.value ? {
                    literalData: {
                        value: field.value
                    }
                } : defaultValue;
                createCopy(input, field, addLiteralInput);
            });
        }
    }

    function updateSelectFeaturesCheckbox(input, field, fn) {
        var cbx = $(field).parent().find('input[type="checkbox"].selection');
        if ( cbx.length == 0 )
            return;

        var aName = $(field).val();
        if ( !aName || aName == '' )
            return;

        var lConfig = lizMap.config.layers[aName];
        cbx.attr('disabled', 'disabled');
        cbx.parent().addClass('disabled');
        if ( cbx.attr('checked') != undefined )
            cbx.removeAttr('checked');

        if ( ( ('selectedFeatures' in lConfig) && lConfig.selectedFeatures.length > 0 ) ||
             ( ('filteredFeatures' in lConfig) && lConfig.filteredFeatures.length > 0 ) ) {
            cbx.removeAttr('disabled');
            cbx.parent().removeClass('disabled');
         }
        return;
    }

    function updateQgisFieldInput(input, field, fn) {
        var qgisFieldInputs = $('#processing-input select.fieldParentLayerParameterName-'+input.identifier);
        if ( qgisFieldInputs.length == 0 )
            return;
        var aName = $(field).val();
        if ( !aName || aName == '' )
            return;
        //FIXME: verifying the layerName for featureType
        qgisFieldInputs.each( function( i, e ) {
            $(e).children().remove();
            $(e).append('<option>---</option>');
        });
        var service = OpenLayers.Util.urlAppend(lizUrls.wms
                    ,OpenLayers.Util.getParameterString(lizUrls.params)
        );
        $.get(service, {
              'SERVICE':'WFS'
             ,'VERSION':'1.0.0'
             ,'REQUEST':'DescribeFeatureType'
             ,'TYPENAME':aName
             ,'OUTPUTFORMAT':'JSON'
        }, function(describe) {
            //console.log(describe);
            var aliases = describe.aliases;
            var types = {};
            if ('types' in describe)
                types = describe.types;
            for ( var att in aliases ) {
                qgisFieldInputs.each( function( i, e ) {
                    var attType = '';
                    if ( att in types )
                        attType = types[att];
                    if ( $(e).hasClass('fieldDataType-DateTime') && attType != 'date' && attType != 'time' && attType != 'dateTime' && attType != '' )
                        return;
                    if ( $(e).hasClass('fieldDataType-Numeric') && attType != 'integer' && attType != 'long' && attType != 'double' && attType != '' )
                        return;
                    if ( $(e).hasClass('fieldDataType-String') && attType != 'string' && attType != 'Date' && attType != '' )
                        return;
                    var alias = aliases[att];
                    if ( alias != '' )
                        $(e).append('<option value="'+att+'">'+alias+'</option>');
                    else
                        $(e).append('<option value="'+att+'">'+att+'</option>');
                });
            }
            qgisFieldInputs.each( function( i, e ) {
                e.onchange();
            });
              /*
              aConfig['alias'] = describe.aliases;
              if ('types' in describe)
                  aConfig['types'] = describe.types;

              if( aCallBack)
                  aCallBack( aName, aFilter, data.features, aConfig['alias'] );

              $('body').css('cursor', 'auto');
              */

        },'json');
    }

    // if maxOccurs is > 1, this will add a copy of the field
    function createCopy(input, field, fn) {
        if (input.maxOccurs && input.maxOccurs > 1 && !field.userSelected) {
            // add another copy of the field - we don't check maxOccurs
            field.userSelected = true;
            var newInput = OpenLayers.Util.extend({}, input);
            // we recognize copies by the occurrence property
            newInput.occurrence = (input.occurrence || 0) + 1;
            process.dataInputs.push(newInput);
            fn(newInput, field);
        }
    }

    // helper function for adding events to form fields
    function addValueHandlers(field, onblur) {
        field.onclick = function() {
            if (!this.initialValue) {
                this.initialValue = this.value;
                this.value = "";
            }
        };
        field.onblur = function() {
            if (!this.value) {
                this.value = this.initialValue;
                delete this.initialValue;
            }
            onblur.apply(this, arguments);
        };
    }

    // execute the process
    function execute() {
        document.getElementById("processing-output").innerHTML = '';
        //var output = process.processOutputs[0];
        var inputs = process.dataInputs,
            input;
        if ( !inputs )
            inputs = process.dataInputs = [];
        // remove occurrences that the user has not filled out
        for (var i=inputs.length-1; i>=0; --i) {
            input = inputs[i];
            if ((input.minOccurs === 0 || input.occurrence) && !input.data && !input.reference) {
                OpenLayers.Util.removeItem(inputs, input);
            }
        }
        /*process.responseForm = {
            RawDataOutput: {
                identifier: output.identifier
            }
        };
        if (output.complexOutput && output.complexOutput.supported.formats["application/wkt"]) {
            process.responseForm.rawDataOutput.mimeType = "application/wkt";
        }*/
        /*
         * responseDocument
         * attributes: {
                        storeExecuteResponse: responseDocument.storeExecuteResponse,
                        lineage: responseDocument.lineage,
                        status: responseDocument.status
           }
         *
         * output
         * attributes: {
                        asReference: output.asReference,
                        mimeType: output.mimeType,
                        encoding: output.encoding,
                        schema: output.schema
                    }
         * identifier
         * title
         * abstract
         *
         * */
        //console.log(process.processOutputs);
        var outputs = [];
        for (var i=process.processOutputs.length-1; i>=0; --i) {
            var processOutput = process.processOutputs[i];
            var output = {
                identifier: processOutput.identifier
            }
            if ( processOutput.complexOutput ) {
                output.asReference = true;
            }
            outputs.push( output );
        }
        process.responseForm = {
            responseDocument: {
                storeExecuteResponse: true,
                status: true,
                outputs: outputs
            }
        };
        var data = new OpenLayers.Format.WPSExecute().write(process);
        var requestTime = (new Date()).toISOString();
        OpenLayers.Request.POST({
            url: lizUrls['wps_wps'],
            params: lizUrls.params,
            data: data,
            headers:{
                'Content-Length': data.length
            },
            success: function(response) {showOutput(response, requestTime)},
            failure: function() {}
        });
        return false;
    }

    function getQueryParam(url, key) {
        var queryStartPos = url.indexOf('?');
        if (queryStartPos === -1) {
            return;
        }
        var params = url.substring(queryStartPos + 1).split('&');
        for (var i = 0; i < params.length; i++) {
            var pairs = params[i].split('=');
            if (decodeURIComponent(pairs.shift()).toLowerCase() == key.toLowerCase()) {
                return decodeURIComponent(pairs.join('='));
            }
        }
    }

    function loadConfigAndDisplayPlot( id, url ) {
        $.getJSON(url,
            {},
            function(json){
                if( 'errors' in json ){
                    console.log('Dataviz configuration error');
                    console.log(json.errors);
                    return false;
                }
                if( !json.data || json.data.length < 1)
                    return null;

                var plot = lizDataviz.buildPlot(id, json);
            }
        );
    }

    function toggleProcessFailedMessages( uuid ) {
        var processExecuted = executedProcesses[uuid];

        var btn = $('#log-'+uuid).find('button[value="failed-'+uuid+'"]');

        var logFailedUuid = $('#processing-log-failed-uuid');
        var oldUuid = logFailedUuid.text();
        if ( uuid == oldUuid ) {
            $('#processing-log-failed').hide();
            $('#processing-log-failed-messages').html('');
            $('#processing-log-failed-creation').html('');
            logFailedUuid.html('');
            btn.removeClass('active');
            return;
        }

        $('#log-'+oldUuid).find('button[value="failed-'+oldUuid+'"]').removeClass('active');
        btn.addClass('active');
        logFailedUuid.html(uuid);

        $('#processing-log-failed-creation').html((new Date(processExecuted.startTime)).toLocaleString());
        $('#processing-log-failed-messages').html('');
        var div = '<div class="alert alert-error">';
        div+= '<ul>';
        for ( var i=0, ii=processExecuted.exceptions.length; i<ii; i++ ) {
            div+= '<li>'+processExecuted.exceptions[i]+'</li>';
        }
        div+= '</ul>';
        div+= '</div>';
        $('#processing-log-failed-messages').html(div);
        $('#processing-log-failed').show();
    }

    function toggleProcessDetails( uuid ) {
        var processExecuted = executedProcesses[uuid];

        var btn = $('#log-'+uuid).find('button[value="details-'+uuid+'"]');

        var logDetailsUuid = $('#processing-log-details-uuid');
        var oldUuid = logDetailsUuid.text();
        if ( uuid == oldUuid ) {
            $('#processing-log-details').hide();
            $('#processing-log-details-table tr:not(:first)').remove();
            $('#processing-log-details-creation').html('');
            logDetailsUuid.html('');
            btn.removeClass('active');
            return;
        }

        $('#log-'+oldUuid).find('button[value="details-'+oldUuid+'"]').removeClass('active');
        btn.addClass('active');
        logDetailsUuid.html(uuid);

        $('#processing-log-details-creation').html((new Date(processExecuted.startTime)).toLocaleString());
        $('#processing-log-details-table tr:not(:first)').remove();
        for (var i=0,ii=processExecuted.dataInputs.length; i<ii; ++i) {
            var input = processExecuted.dataInputs[i];
            //console.log(input);
            // details table
            var tr = '<tr>';
            tr += '<td>'+input.title+'</td>';
            if (input.boundingBoxData)
                tr += '<td>Bounding box</td>';
            else if (input.literalData) {
                var dataType = input.literalData.dataType;
                if ( 'processMetadata' in input ) {
                    var qgisType = input.processMetadata.type;
                    if ( qgisType == 'number' )
                        tr += '<td>'+qgisType+' ('+dataType+')</td>';
                    else
                        tr += '<td>'+qgisType+'</td>';
                } else
                    tr += '<td>'+dataType+'</td>';
            }
            else
                tr += '<td></td>';
            if ( input.data )
                if (input.data.literalData)
                    tr += '<td>'+input.data.literalData.value+'</td>';
                else
                    tr += '<td>Not set</td>';
            else
                tr += '<td>Not set</td>';
            tr += '</tr>';
            $('#processing-log-details-table tr:last').after(tr);
        }
        $('#processing-log-details').show();
    }

    function toggleProcessResults( uuid ) {
        var processExecuted = executedProcesses[uuid];

        var btn = $('#log-'+uuid).find('button[value="results-'+uuid+'"]');

        $('#processing-results-literal').show();
        $('#processing-results-layer').show();
        btn.addClass('checked');
        $('#processing-results-title').html(processExecuted.title);
        if ( $('#processing-results-literal-table tr:first th[class="'+uuid+'"]').length == 0 ) {
        //    btn.removeClass('checked');


            // literal Data
            var hasLiteral = false;
            if ($('#processing-results-literal-table tr').length == 1) {
                for (var i=0,ii=processExecuted.processOutputs.length; i<ii; ++i) {
                    var output = processExecuted.processOutputs[i];
                    if ( !output.literalData )
                        continue;
                    var tr = '<tr class="'+output.identifier+'">';
                    tr += '<td>'+output.title+'</td>';
                    tr += '</tr>';
                    $('#processing-results-literal-table tr:last').after(tr);
                }
            }
            $('#processing-results-literal-table tr:first th:last')
                .after('<th class="'+uuid+'">'+(new Date(processExecuted.startTime)).toLocaleString()+'</th>');
            for (var i=0,ii=processExecuted.processOutputs.length; i<ii; ++i) {
                var output = processExecuted.processOutputs[i];
                if ( !output.literalData )
                    continue;
                var td = '<td class="'+uuid+'">'+output.literalData.value+'</td>';
                $('#processing-results-literal-table tr.'+output.identifier+' td:last').after(td);
                hasLiteral = true;
            }
            // Hide or show content depending on results
            $('#processing-results-literal').toggle(hasLiteral);


            // LAYERS
            // reference Data with mimeType application/x-ogc-wms
            var hasLayer = false;
            //console.log('has layer BEGIN');
            if ($('#processing-results-layer-table tr').length == 1) {
                for (var i=0,ii=processExecuted.processOutputs.length; i<ii; ++i) {
                    var output = processExecuted.processOutputs[i];
                    if ( !output.reference )
                        continue;
                    if ( !output.reference.mimeType )
                        continue;
                    if ( output.reference.mimeType != 'application/x-ogc-wms' )
                        continue;
                    var tr = '<tr class="'+output.identifier+'">';
                    tr += '<td>'+output.title+'</td>';
                    tr += '</tr>';
                    $('#processing-results-layer-table tr:last').after(tr);
                }
            }
            $('#processing-results-layer-table tr:first th:last')
                .after('<th class="'+uuid+'">'+(new Date(processExecuted.startTime)).toLocaleString()+'</th>');
            for (var i=0,ii=processExecuted.processOutputs.length; i<ii; ++i) {
                var output = processExecuted.processOutputs[i];
                if ( !output.reference )
                    continue;
                if ( !output.reference.mimeType )
                    continue;
                if ( output.reference.mimeType != 'application/x-ogc-wms' )
                    continue;
                var url = output.reference.href;
                var mapParam = getQueryParam(url, 'map');
                //console.log(mapParam);
                var layerParam = getQueryParam(url, 'layer');

                var layerName = uuid+'-'+output.identifier;
                var serviceUrl = OpenLayers.Util.urlAppend( url.substring(0, url.indexOf('?') + 1)
                  ,OpenLayers.Util.getParameterString({map:mapParam})
                );
                //console.log(serviceUrl );
                var layerWmsParams = {
                    version:'1.3.0'
                    ,layers: layerParam
                    ,styles:''
                    ,crs:(map.getProjection() != 'EPSG:900913') ? map.getProjection() : 'EPSG:3857'
                    ,format:'image/png'
                    ,transparent:'true'
                    ,exceptions:'application/vnd.ogc.se_inimage'
                    ,dpi:96
                };

                var wmsLayer = new OpenLayers.Layer.WMS(layerName
                    ,serviceUrl
                    ,layerWmsParams
                    ,{isBaseLayer:false
                    ,visibility:true
                    ,gutter:5
                    ,buffer:0
                    ,transitionEffect:'resize'
                    ,removeBackBufferDelay:250
                    ,singleTile:true
                    ,ratio:1
                });
                map.addLayer(wmsLayer);
                var zIndex = -1;
                var vlayers = lizMap.map.getLayersByClass('OpenLayers.Layer.Vector');
                for ( var j=0, jj= vlayers.length; j<jj; j++ ) {
                    var vlayer = vlayers[j];
                    if ( vlayer.isBaseLayer )
                        continue;
                    var vZIndex = lizMap.map.getLayerIndex(vlayer);
                    if ( zIndex == -1 && vZIndex > 0 )
                        zIndex = vZIndex;
                    else if ( vZIndex < zIndex )
                        zIndex = vZIndex;
                }
                lizMap.map.setLayerIndex(wmsLayer, zIndex);
                //console.log(layerName);

                var td = '<td class="'+uuid+'">';
                td += '<button class="btn checkbox checked layerView" value="'+layerName+'" title="'+layerParam+'"></button>';
                td += '<button style="display:none;" class="btn btn-mini layerDownload" value="'+layerName+'" title="'+layerParam+'">';
                td += '<i class="icon-download-alt"></i>';
                td += '</button>';
                td += '</td>';
                $('#processing-results-layer-table tr.'+output.identifier+' td:last').after(td);

                hasLayer = true;

                var trResults = $('#switcher table.tree #group-wps-results');
                if ( trResults.length == 0 ) {
                    $('<tr id="group-wps-results" class="liz-group expanded parent initialized"><td><a href="#" title="Réduire" style="margin-left: -19px; padding-left: 19px" class="expander"></a><button class="btn checkbox partial checked" name="group" value="wps-results" title="Afficher/Masquer"></button><span class="label" title="" data-original-title="">Résultats</span></td><td></td><td></td><td></td></tr>')
                        .insertBefore('#switcher table.tree tr:first');
                    trResults = $('#switcher table.tree #group-wps-results');
                }
                trResults.after('<tr id="layer-wps-results-'+layerName+'" class="liz-layer child-of-group-wps-results '+uuid+' initialized parent collapsed visible"><td style="padding-left: 20px;"><a href="#" title="Déployer" style="margin-left: -19px; padding-left: 19px" class="expander"></a><button class="btn checkbox checked" name="layer" value="'+layerName+'" title="Afficher/Masquer"></button><span class="label" title="" data-original-title="">'+layerParam+'</span></td><td><span class="loading">&nbsp;</span></td><td></td><td></td></tr>');

                $('#switcher table.tree #layer-wps-results-'+layerName+' button[name="layer"]').click(function() {
                    var btn = $(this);
                    if ( btn.hasClass('checked') ) {
                        btn.removeClass('checked');
                        lizMap.map.getLayersByName(btn.val())[0].setVisibility(false);
                    } else {
                        btn.addClass('checked');
                        lizMap.map.getLayersByName(btn.val())[0].setVisibility(true);
                    }
                    return false;
                });
            }

            $('#processing-results-layer-table tr td[class="'+uuid+'"] button.layerView').click(function() {
                var btn = $(this);
                if ( btn.hasClass('checked') ) {
                    btn.removeClass('checked');
                    lizMap.map.getLayersByName(btn.val())[0].setVisibility(false);
                } else {
                    btn.addClass('checked');
                    lizMap.map.getLayersByName(btn.val())[0].setVisibility(true);
                }
                return false;
            });
            $('#processing-results-layer-table tr td[class="'+uuid+'"] button.layerDownload').click(function() {
                var btn = $(this);
                var btnVal = btn.val();
                var processUuid = btn.parent().attr('class');
                var outputName = btn.parent().parent().attr('class');
                if ( btnVal == processUuid+'-'+outputName ) {
                    // FIXME
                }
                return false;
            });
            // Hide or show content depending on results
            $('#processing-results-layer').toggle(hasLayer);


            // PLOTS
            // Display plots
            var hasPlot = false;
            var div = '<div class="'+uuid+'">';
            div+= '<h5>'+(new Date(processExecuted.startTime)).toLocaleString()+'</h5>';
            div+= '</div>';
            $('#processing-results-plot').append(div);
            for (var i=0,ii=processExecuted.processOutputs.length; i<ii; ++i) {
                var output = processExecuted.processOutputs[i];
                if ( !output.reference )
                    continue;
                if ( !output.reference.mimeType )
                    continue;
                if ( output.reference.mimeType != 'application/json' )
                    continue;
                var url = output.reference.href;
                var oDiv = '<p><strong>'+output.title+'</strong></p>';
                oDiv += '<div id="'+uuid+'-'+output.identifier+'" style="height:400px;">';
                oDiv += '</div>';
                $('#processing-results-plot div[class="'+uuid+'"]').append(oDiv);
                loadConfigAndDisplayPlot( uuid+'-'+output.identifier, url );
                hasPlot = true;

            }
            // Hide or show content depending on results
            $('#processing-results-plot').toggle(hasPlot);



        } else {
            $('#processing-results-plot > div[class="'+uuid+'"]').remove();

            $('#switcher table.tree tr.liz-layer.child-of-group-wps-results.'+uuid+' button').unbind('click');
            $('#switcher table.tree tr.liz-layer.child-of-group-wps-results.'+uuid).remove();
            if ( $('#switcher table.tree tr.liz-layer.child-of-group-wps-results').length == 0 )
                $('#switcher table.tree #group-wps-results').remove();

            $('#processing-results-layer-table tr td[class="'+uuid+'"] button').unbind('click');
            $('#processing-results-layer-table tr td[class="'+uuid+'"] button').each(function(i, b){
                var layerName = $(b).val();
                var layers = lizMap.map.getLayersByName( layerName );
                if ( layers.length > 0 )
                    lizMap.map.removeLayer( layers[0] );
            });
            $('#processing-results-layer-table tr td[class="'+uuid+'"]').remove();
            $('#processing-results-layer-table tr th[class="'+uuid+'"]').remove();
            $('#processing-results-literal-table tr td[class="'+uuid+'"]').remove();
            $('#processing-results-literal-table tr th[class="'+uuid+'"]').remove();
            btn.removeClass('checked');
        }

        // open dock
        if ( !$('#button-processing-results').parent().hasClass('active') )
            $('#button-processing-results').click();

        if ( $('#processing-results-literal-table tr:first th').length == 1
            && $('#button-processing-results').parent().hasClass('active') )
            $('#button-processing-results').click();
    }

    function updateLogTable( executedProcess ) {
        if ( !executedProcess )
            return;
        if ( !executedProcess.uuid )
            return;
        var uuid = executedProcess.uuid;
        var startTime = executedProcess.startTime;
        var status = executedProcess.status;
        var endTime = executedProcess.endTime;
        var tr = '<tr id="log-'+uuid+'">';
        //tr += '<td>'+uuid+'</td>';
        tr += '<td>'+(new Date(startTime)).toLocaleString()+'</td>';
        if ( endTime != '' )
            tr += '<td>'+(new Date(endTime)).toLocaleString()+'</td>';
        else
            tr += '<td></td>';
        if ( status == 'Accepted' || status == 'Started' )
            tr += '<td><div class="progress"><div class="bar bar-hidden"></div><div class="bar"></div></div></td>';
        else if ( status == 'Paused' )
            tr += '<td><i class="icon-pause"></i></td>';
        else if ( status == 'Succeeded' )
            tr += '<td><span class="badge badge-success"><i class="icon-white icon-ok"></i></td>';
        else if ( status == 'Failed' )
            tr += '<td><span class="badge badge-important"><i class="icon-white icon-remove"></i></span></td>';
        else
            tr += '<td>'+status+'</td>';
        //tr += '<td></td>';
        tr += '<td>';
        tr += '<button class="btn btn-mini" value="details-'+uuid+'" title="Toggle process details"><i class="icon-resize-vertical"></i></button>';
        if ( status == 'Succeeded' )
            tr += '<button class="btn btn-mini checkbox" value="results-'+uuid+'" title="Toggle process results"></button>';
        else if ( status == 'Failed' )
            tr += '<button class="btn btn-mini" value="failed-'+uuid+'" title="Toggle process information"><i class="icon-info-sign"></i></button>';
        tr += '</td>';
        tr += '</tr>';

        var logTr = $('#log-'+uuid);
        if ( logTr.length == 0 )
            $('#processing-log-table tr:first').after(tr);
        else {
            logTr.find('button').unbind('click');
            logTr.replaceWith(tr);
        }

        logTr = $('#log-'+uuid);
        logTr.find('button').click(function(){
            var self = $(this);
            var val = self.val();
            //console.log(val);
            var btnUuid = '';
            var btnAction = '';
            if ( val.startsWith( 'details-' ) ) {
                btnUuid = val.replace('details-', '');
                btnAction = 'details';
            } else if ( val.startsWith('results-' ) ) {
                btnUuid = val.replace('results-', '');
                btnAction = 'results';
            } else if ( val.startsWith('failed-' ) ) {
                btnUuid = val.replace('failed-', '');
                btnAction = 'failed';
            }
            //console.log(btnUuid);
            if ( btnUuid in executedProcesses ) {
                var processExecuted = executedProcesses[btnUuid];
                //console.log( processExecuted );
                if ( btnAction == 'details' ) {
                    toggleProcessDetails( btnUuid );
                } else if ( btnAction == 'results' ) {
                    toggleProcessResults( btnUuid );
                } else if ( btnAction == 'failed' ) {
                    toggleProcessFailedMessages( btnUuid );
                }

            }
            else
                console.log('unknown uuid');
        });
    }

    function storeStatusProcess( uuid ) {
        if ( !(uuid in executedProcesses) )
            return;
        var processExecuted = executedProcesses[uuid];
        var url = lizUrls['wps_wps_results_update'];
        var identifier = processExecuted.identifier;

        var params = {
            repository: lizUrls.params.repository,
            project: lizUrls.params.project,
            identifier: identifier
        }

        $.ajax( url+='?'+$.param(params), {
            data : JSON.stringify(executedProcesses[uuid]),
            contentType : 'application/json',
            type : 'POST',
            success: function (d) {
                //console.log('Update stored results');
                //console.log(d);
            }
        });
    }

    function updateStatusProcess( uuid ) {
        if ( !(uuid in executedProcesses) )
            return;
        var processExecuted = executedProcesses[uuid];
        processExecuted.reloadStatus = true;
        executedProcesses[uuid] = processExecuted;
        //console.log(processExecuted);
        OpenLayers.Request.GET({
            url: lizUrls['wps_wps'],
            params: {
                "SERVICE": "WPS",
                "REQUEST": "GetResults",
                "uuid": uuid
            },
            success: function(response){
                var parseResponse = new OpenLayers.Format.WPSExecute().read(response.responseText);
                var executeResponse = parseResponse.executeResponse;

                var pToSave = parseExecuteResponse( executeResponse );
                uuid = pToSave.uuid;

                executedProcesses[uuid] = pToSave;
                updateLogTable( pToSave );
                storeStatusProcess( uuid );
                console.log('Process object updated');
                console.log(pToSave);
            },
            failure: function() {
            }
        });
    }

    function scheduleUpdateStatusProcesses() {
       // Use closure to track the number of call
       var count = 5
       intervalStatusProcesses = window.setInterval( function() {
                count -= 1;
                updateStatusProcesses(count)
       }, 1000 );
    }

    function updateStatusProcesses(count) {
        var updated = 0;
        for ( var uuid in executedProcesses ) {
            var executedProcess = executedProcesses[uuid];
            if ( executedProcess.reloadStatus )
                continue;
            if ( executedProcess.status == 'Failed' || executedProcess.status == 'Succeeded' )
                continue;
            updateStatusProcess( uuid );
            updated += 1;
        }
        if ( intervalStatusProcesses ) {
            if( updated == 0 ) {
                window.clearInterval( intervalStatusProcesses );
                intervalStatusProcesses = null;
            } else {
                // Processes still running, slow down
                // the interval
                if( count < 0 ) {
                    window.clearInterval( intervalStatusProcesses );
                    intervalStatusProcesses = window.setInterval( function() {
                        updateStatusProcesses(1); }, 10000 );
                }
            }
        }
    }

    function parseExecuteResponse( executeResponse, requestTime ) {
        console.log(executeResponse);
        var uuid = getQueryParam(executeResponse.statusLocation, 'uuid');
        var statusCreationTime = executeResponse.status.creationTime;

        var status = 'Accepted';
        if ( 'processFailed' in executeResponse.status )
            status = 'Failed';
        else if ( 'processStarted' in executeResponse.status )
            status = 'Started';
        else if ( 'processPaused' in executeResponse.status )
            status = 'Paused';
        else if ( 'processSucceeded' in executeResponse.status )
            status = 'Succeeded';

        var exceptions = [];
        if ( status == 'Failed' ) {
            console.log('Failed');
            if ( executeResponse.status.exceptionReport && executeResponse.status.exceptionReport.exceptions ) {
                console.log('ExceptionReport');
                var exceptionList = executeResponse.status.exceptionReport.exceptions;
                for ( var i = 0, len=exceptionList.length; i < len; i++ ) {
                    console.log(exceptionList[i].texts);
                    exceptions = exceptions.concat( exceptionList[i].texts );
                }
            }
        }

        var pToSave = null;
        if ( !(uuid in executedProcesses) )
            pToSave = JSON.parse( JSON.stringify( {
                uuid: uuid,
                identifier: process.identifier,
                title: process.title,
                dataInputs: process.dataInputs,
                startTime: (status == 'Accepted' || status == 'Started') ? statusCreationTime : requestTime,
                status: status,
                processOutputs: executeResponse.processOutputs ? executeResponse.processOutputs : [],
                exceptions : exceptions,
                endTime: (status == 'Accepted' || status == 'Started') ? '' : statusCreationTime,
                reloadStatus: false
            } ) );
        else {
            pToSave = executedProcesses[uuid];
            pToSave.status = status;
            pToSave.processOutputs = executeResponse.processOutputs ? executeResponse.processOutputs : [];
            pToSave.exceptions = exceptions;
            pToSave.endTime = (status == 'Accepted' || status == 'Started') ? '' : statusCreationTime;
            pToSave.reloadStatus = false;
        }
        return pToSave;
    }

    function manageExecuteResponse( executeResponse, requestTime ) {
        var pToSave = parseExecuteResponse( executeResponse, requestTime );
        var uuid = pToSave.uuid;
        executedProcesses[uuid] = pToSave;

        $("a[href='#processing-log-tab']").click();
        updateLogTable( pToSave );
        storeStatusProcess( uuid );
        updateStatusProcess( uuid );
        scheduleUpdateStatusProcesses();
    }

    function manageExceptionReport( exceptionReport, requestTime ) {
        console.log(exceptionReport);
        var result = document.getElementById("processing-output");
        var div = '<div class="alert alert-error">';
        div+= '<ul>';
        for ( var i=0, ii=exceptionReport.exceptions.length; i<ii; i++ ) {
            var exception = exceptionReport.exceptions[i];
            for ( var j=0, jj=exception.texts.length; j<jj; j++ ) {
                div+= '<li>'+exception.texts[j]+'</li>';
            }
        }
        div+= '</ul>';
        div+= '</div>';
        result.innerHTML = div;
    }

    // add the process's output to the page
    function showOutput(response, requestTime) {
        //var result = document.getElementById("processing-output");
        //result.innerHTML = "<h3>Output:</h3>";
        var features;
        var contentType = response.getResponseHeader("Content-Type");
        if (contentType == "application/wkt") {
            features = new OpenLayers.Format.WKT().read(response.responseText);
        } else if (contentType == "text/xml; subtype=wfs-collection/1.0") {
            features = new OpenLayers.Format.WFST.v1_0_0().read(response.responseText);
        }
        if (features && (features instanceof OpenLayers.Feature.Vector || features.length)) {
            layer.addFeatures(features);
            //result.innerHTML += "The result should also be visible on the map.";
        } else if (contentType && contentType.startsWith('text/xml')){
            var parseResponse = new OpenLayers.Format.WPSExecute().read(response.responseText);
            if ( parseResponse.executeResponse )
                manageExecuteResponse( parseResponse.executeResponse, requestTime );
            if ( parseResponse.exceptionReport )
                manageExceptionReport( parseResponse.exceptionReport, requestTime );
        }
        //result.innerHTML += "<textarea>" + response.responseText + "</textarea>";
    }

    lizMap.events.on({

        'uicreated': function(e) {
            config = lizMap.config;
            map = lizMap.map;

            if ( 'wps_wps' in lizUrls && $("#processing-processes").length) {
                $('#button-processing span.icon').css('background-image', 'none').html('<i class="icon-cog icon-white" style="margin-left: 4px;"></i>');

                $('#button-processing-results span.icon').css('background-image', 'none').html('<i class="icon-eye-open icon-white" style="margin-left: 4px;"></i>');

                // add behavior to html elements
                document.getElementById("processing-processes").onchange = describeProcess;

                getCapabilities();
            }

            OpenLayers.Format.WPSDescribeProcess.prototype.namespaces.xlink = 'http://www.w3.org/1999/xlink';
            OpenLayers.Format.WPSDescribeProcess.prototype.readers.ows.Metadata = function(node, obj) {
                if ( !('processMetadata' in obj) )
                    obj.processMetadata = {};
                var type = this.getAttributeNS(node, this.namespaces.xlink, "type");
                var title = this.getAttributeNS(node, this.namespaces.xlink, "title");
                var href = this.getAttributeNS(node, this.namespaces.xlink, "href");
                if ( type == 'simple' && title.startsWith('processing:') )
                    obj.processMetadata[title.slice(11)] = href;
            };
            OpenLayers.Format.WPSDescribeProcess.prototype.readers.wps.DefaultValue = function(node, literalData) {
                literalData.defaultValue = this.getChildValue(node);
            };
            OpenLayers.Format.WPSExecute.prototype.namespaces.xlink = 'http://www.w3.org/1999/xlink';
            OpenLayers.Format.WPSExecute.prototype.readers.wps.Reference = function(node, output) {
                output.reference = {
                    href: node.getAttribute("href"),
                    mimeType: node.getAttribute("mimeType"),
                    encoding: node.getAttribute("encoding"),
                    schema: node.getAttribute("schema")
                };
                if ( !output.reference.href )
                    output.reference.href = this.getAttributeNS(node, this.namespaces.xlink, "href");
            };
            OpenLayers.Format.WPSExecute.prototype.readers.wps.ProcessFailed = function(node,obj) {
                obj.processFailed = true;
                this.readChildNodes(node, obj);
            };
            OpenLayers.Format.WPSExecute.prototype.readers.wps.ExceptionReport = function(node, obj) {
                obj.exceptionReport = {
                    exceptions: []
                };
                this.readChildNodes(node, obj.exceptionReport);
            };
            OpenLayers.Format.WPSExecute.prototype.readers.wps.ProcessAccepted = function(node,obj) {
                obj.processAccepted = true;
            };
            OpenLayers.Format.WPSExecute.prototype.readers.wps.ProcessStarted = function(node,obj) {
                obj.processStarted = true;
                obj.percentCompleted = node.hasAttribute("percentCompleted") ? node.getAttribute("percentCompleted") : null;
            };
            OpenLayers.Format.WPSExecute.prototype.readers.wps.ProcessPaused = function(node,obj) {
                obj.processPaused = true;
            };
        },

        'layerSelectionChanged': function(e) {

            $('#processing-form-container select.qgisType-source').each(function(idx, elt){
                elt = $(elt);
                if ( elt.val() != e.featureType )
                    return;
                elt.change();
            });

        }

    });
}();
