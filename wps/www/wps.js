var Petra = function() {

    var config = null;
    var map = null;
    var capabilities = null;
    var process = null;
    var processes = {};
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
                var processingLogList = document.getElementById("processing-log-list");
                var processingResultsList = document.getElementById("processing-results-list");
                var offerings = capabilities.processOfferings, option;

                // Populate the dropdown and results list
                for (var p in offerings) {
                    // Remove alg if not set in wps_wps_project_config
                    if(
                        typeof wps_wps_project_config !== 'undefined'
                        && !(p in wps_wps_project_config)
                    ){
                        continue;
                    }

                    // Dropdown
                    option = document.createElement("option");
                    option.innerHTML = offerings[p].title;
                    option.value = p;
                    dropdown.appendChild(option);

                    // List
                    const li = document.createElement("li");
                    li.innerHTML = '<span class="title">' + offerings[p].title + '</span>';
                    li.dataset.value = p;
                    const resultsTable = document.createElement("table");
                    resultsTable.classList = "processing-log-list-results table table-condensed table-striped";
                    li.appendChild(resultsTable);
                    processingLogList.appendChild(li);

                    // Div results
                    // The algorithm div
                    const div = document.createElement("div");
                    div.innerHTML = '<h4 class="title">' + offerings[p].title + '</h4>';
                    div.dataset.value = p;
                    div.style = 'display:none;';
                    processingResultsList.appendChild(div);
                    // The details div
                    const divDetails = document.createElement("div");
                    divDetails.classList = "processing-results-detail";
                    divDetails.style = 'display:none;';
                    divDetails.innerHTML = '<h4>Inputs</h4><table class="processing-results-detail-table table table-condensed table-striped"><tbody><tr><th>Name</th><th>Type</th></tr></tbody></table>';
                    div.appendChild(divDetails);
                    // The literals div
                    const divLiterals = document.createElement("div");
                    divLiterals.classList = "processing-results-literal";
                    divLiterals.style = 'display:none;';
                    divLiterals.innerHTML = '<h4>Literals output</h4><table class="processing-results-literal-table table table-condensed table-striped"><tbody><tr><th>Name</th></tr></tbody></table>';
                    div.appendChild(divLiterals);
                    // The layers div
                    const divLayers = document.createElement("div");
                    divLayers.classList = "processing-results-layer";
                    divLayers.innerHTML = '<h4>Layers output</h4><table class="processing-results-layer-table table table-condensed table-striped"><tbody><tr><th>Name</th></tr></tbody></table>';
                    divLayers.style = 'display:none;';
                    div.appendChild(divLayers);
                    // The layers div
                    const divFiles = document.createElement("div");
                    divFiles.classList = "processing-results-file";
                    divFiles.innerHTML = '<h4>Files output</h4><table class="processing-results-file-table table table-condensed table-striped"><tbody><tr><th>Name</th></tr></tbody></table>';
                    divFiles.style = 'display:none;';
                    div.appendChild(divFiles);
                    // The plots div
                    const divPlots = document.createElement("div");
                    divPlots.classList = "processing-results-plot";
                    divPlots.innerHTML = '<h4>Plots output</h4><div class="processing-results-plot-table"></div>';
                    divPlots.style = 'display:none;';
                    div.appendChild(divPlots);
                    div.appendChild(document.createElement("hr"));
                }

                if ( dropdown.children.length == 1 ) {
                    // No algorithm available
                    // hide WPS
                    document.querySelectorAll('#mapmenu ul.nav-list li.processing')[0].style.display = 'none';
                    document.querySelectorAll('#mapmenu ul.nav-list li.processing-results')[0].style.display = 'none';
                } else {
                    // Algorithms available
                    // Add toggle behaviour to processing-log-list
                    for (const li of document.querySelectorAll('#processing-log-list > li .title')) {
                        li.addEventListener('click', e => {
                            const liClicked = e.target.parentElement;
                            liClicked.classList.toggle('expanded');

                            // Load and display results
                            if (liClicked.classList.contains('expanded')) {
                                const selection = liClicked.dataset.value;
                                if (selection != '') {
                                    getStoredResults(selection);
                                }
                            }
                        });
                    }
                }
            }
        });
    }

    // using OpenLayers.Format.WPSDescribeProcess to get information about a
    // process
    function describeProcess() {

        // Empty title, abstract and info tables in 'Help' tab
        $("#processing-title").html('');
        $("#processing-abstract").html('');
        $('#processing-info-inputs tr:not(:first)').remove();
        $('#processing-info-outputs tr:not(:first)').remove();

        // Clean 'Run' tab form
        document.getElementById("processing-input").innerHTML = '';
        document.getElementById("processing-form-errors").innerHTML = '';

        var selection = this.options[this.selectedIndex].value;
        if ( selection != '' ) {
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
                    processes[selection] = OpenLayers.Util.extend({}, process);
                    buildForm();
                    getStoredResults(selection);
                }
            });
        }
    }

    // using OpenLayers.Format.WPSDescribeProcess to get information about a
    // process
    function getStoredResults(identifier) {
        if (!identifier || identifier == '') {
            return false;
        }
        $.get(lizUrls['wps_wps_results'], {
            repository: lizUrls.params.repository,
            project: lizUrls.params.project,
            identifier: identifier
        }, function (d) {
            //console.log('Get stored results');
            //console.log(d);
            if (!d)
                return;
            for (var uuid in d) {
                var executedProcess = d[uuid];
                if (executedProcess) {
                    executedProcesses[uuid] = d[uuid];
                    //updateStatusProcess( uuid );
                    updateLogTable(d[uuid]);
                }
            }
            scheduleUpdateStatusProcesses()
        });
        return true;
    }

    // dynamically create a form from the process description
    function buildForm() {
        $("#processing-title").html(process.title);
        if('abstract' in process && process.abstract != '')
            $("#processing-abstract").html(process.abstract);
        document.getElementById("processing-input").innerHTML = "<h3>Input:</h3>";
        document.getElementById("processing-form-errors").innerHTML = "";
        $('#processing-info-inputs tr:not(:first)').remove();
        $('#processing-info-outputs tr:not(:first)').remove();

        var container = document.getElementById("processing-form-container");
        container.setAttribute('data-value', process.identifier);

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
                if (formats["application/vnd.geo+json"]) {
                    addGeoJSONInput(input);
                } else if (formats["application/wkt"]) {
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
                document.getElementById("processing-input-"+input.identifier.replaceAll(':', '_')+"-label").appendChild(document.createTextNode("* "));
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

        $('#processing-input button.wps-digitizing').each(function(){
            var btn = $(this);
            if (btn.hasClass('extent')) {
                addDigitizingExtentHandler(btn.attr('id'));
            } else if (btn.hasClass('point')) {
                addDigitizingPointHandler(btn.attr('id'));
            }
        });

        lizMap.mainEventDispatcher.addListener(
            () => {
                var btn = $('#processing-input button.wps-digitizing.active');
                if (btn.hasClass('extent')) {
                    updateDigitizingExtent(btn.attr('id'))
                } else if (btn.hasClass('point')) {
                    updateDigitizingPoint(btn.attr('id'))
                }
            },
            ['digitizing.featureDrawn']
        );

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

            lizMap.events.triggerEvent("processingFormBuild", {identifier: process.identifier});
        } else {
            document.getElementById("processing-input").innerHTML = '<span class="notsupported">' +
                "Sorry, the WPS builder does not support the selected process." +
                "</span>";
        }
    }

    function addGeoJSONInput(input, previousSibling) {
        //  start building input
        var name = input.identifier;
        var container = document.getElementById("processing-input");

        // build the control group
        var control = document.createElement("div");
        control.setAttribute('class', 'control-group');
        control.id = 'processing-input-'+name.replaceAll(':', '_')+'-group';
        // defined the label
        var label = document.createElement("label");
        label.setAttribute('class', 'jforms-label control-label');
        label.setAttribute('for', 'processing-input-'+name.replaceAll(':', '_'));
        label.innerHTML = input.title;
        label.id = 'processing-input-'+name.replaceAll(':', '_')+'-label';
        control.appendChild(label);

        // defined the field group
        var fieldDiv = document.createElement("div");
        fieldDiv.setAttribute('class', 'controls');
        control.appendChild(fieldDiv);

        // defined the field
        var field = document.createElement("input");
        field.title = input.title;
        //field.value = "left,bottom,right,top (EPSG:4326)";
        field.id = 'processing-input-'+name.replaceAll(':', '_');
        field.name = name;
        field.title = input.title;
        fieldDiv.appendChild(field);

        var qgisType = '';
        if ( 'processMetadata' in input ) {
            qgisType = input.processMetadata.type;
        }

        // Add simple class
        var fieldClass = 'qgisType-'+qgisType;
        field.setAttribute('class', fieldClass);

        container.appendChild(control);

        addValueHandlers(field, function() {
            input.data = field.value ? {
                complexData: {
                    //mimeType: 'application/wkt',
                    mimeType: 'application/vnd.geo+json',
                    encoding: 'utf8',
                    schema: '',
                    value: field.value
                }
            } : defaultValue;
            //createCopy(input, field, addWKTInput);
        });

        // Add select for CRS project and map
        var select = document.createElement("select");
        select.id = 'processing-input-'+name.replaceAll(':', '_')+'-select';
        select.setAttribute('class', 'span1 wps-digitizing extent');
        var optionProject = document.createElement("option");
        optionProject.value = lizMap.config.options.qgisProjectProjection.ref;
        optionProject.label = lizMap.config.options.qgisProjectProjection.ref.split(':')[1];
        select.appendChild(optionProject);
        var optionMap = document.createElement("option");
        optionMap.value = lizMap.config.options.projection.ref;
        optionMap.label = lizMap.config.options.projection.ref.split(':')[1];
        select.appendChild(optionMap);

        // Add button to draw the extent
        var btn = document.createElement("button");
        btn.id = 'processing-input-'+name.replaceAll(':', '_')+'-btn';
        btn.setAttribute('class', 'btn btn-mini wps-digitizing wkt '+qgisType);
        btn.innerHTML = 'Drawing '+qgisType;

        $(field).after(btn).after(select).after('<br>');
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
        //  start building input
        var name = input.identifier;
        var container = document.getElementById("processing-input");

        // build the control group
        var control = document.createElement("div");
        control.setAttribute('class', 'control-group');
        control.id = 'processing-input-'+name.replaceAll(':', '_')+'-group';
        // defined the label
        var label = document.createElement("label");
        label.setAttribute('class', 'jforms-label control-label');
        label.setAttribute('for', 'processing-input-'+name.replaceAll(':', '_'));
        label.innerHTML = input.title;
        label.id = 'processing-input-'+name.replaceAll(':', '_')+'-label';
        control.appendChild(label);

        // defined the field group
        var fieldDiv = document.createElement("div");
        fieldDiv.setAttribute('class', 'controls');
        control.appendChild(fieldDiv);

        // defined the field
        var field = document.createElement("input");
        field.title = input.title;
        field.value = "left,bottom,right,top (EPSG:4326)";
        field.id = 'processing-input-'+name.replaceAll(':', '_');
        field.name = name;
        field.title = input.title;
        fieldDiv.appendChild(field);

        var qgisType = '';
        if ( 'processMetadata' in input ) {
            qgisType = input.processMetadata.type;
        }

        // Add simple class
        var fieldClass = 'qgisType-'+qgisType;
        field.setAttribute('class', fieldClass);

        container.appendChild(control);
        addValueHandlers(field, function() {
            // parse field value: number,number,number,number ESPG:integer
            var reg = /(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *\((EPSG:\d+)\)/gi;
            var matches = reg.exec(field.value);
            if (matches === undefined) {
                return;
            }
            if (matches.length != 6) {
                return;
            }
            // get projection value to upper case
            var proj = matches[5].toUpperCase();
            // Build bounds
            var b = [matches[1], matches[2], matches[3], matches[4]]
            if (proj == 'EPSG:4326') {
                b = [matches[2], matches[1], matches[4], matches[3]]
            }
            b = OpenLayers.Bounds.fromArray(b)
            input.boundingBoxData = {
                projection: proj,
                bounds: b
            };
            /*input.data = {
                literalData: {
                    value: OpenLayers.Bounds.fromString(field.value)
                }
            };*/
            input.data = {
                boundingBoxData : {
                    projection: proj,
                    bounds: b
                }
            };
        });

        // Add select for CRS project and map
        var select = document.createElement("select");
        select.id = 'processing-input-'+name.replaceAll(':', '_')+'-select';
        select.setAttribute('class', 'span1 wps-digitizing extent');
        var optionProject = document.createElement("option");
        optionProject.value = lizMap.config.options.qgisProjectProjection.ref;
        optionProject.label = lizMap.config.options.qgisProjectProjection.ref.split(':')[1];
        select.appendChild(optionProject);
        var optionMap = document.createElement("option");
        optionMap.value = lizMap.config.options.projection.ref;
        optionMap.label = lizMap.config.options.projection.ref.split(':')[1];
        select.appendChild(optionMap);

        // Add button to draw the extent
        var btn = document.createElement("button");
        btn.id = 'processing-input-'+name.replaceAll(':', '_')+'-btn';
        btn.setAttribute('class', 'btn btn-mini wps-digitizing extent');
        btn.innerHTML = 'Drawing extent';

        $(field).after(btn).after(select).after('<br>');
    }

    // helper function to create a literal input textfield or dropdown
    function addLiteralInput(input, previousSibling) {
        var name = input.identifier;
        var container = document.getElementById("processing-input");

        var control = document.createElement("div");
        control.setAttribute('class', 'control-group');
        control.id = 'processing-input-'+name.replaceAll(':', '_')+'-group';
        var label = document.createElement("label");
        label.setAttribute('class', 'jforms-label control-label');
        label.setAttribute('for', 'processing-input-'+name.replaceAll(':', '_'));
        label.innerHTML = input.title;
        label.id = 'processing-input-'+name.replaceAll(':', '_')+'-label';
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
        field.id = 'processing-input-'+name.replaceAll(':', '_');
        field.name = name;
        field.title = input.title;
        fieldDiv.appendChild(field);

        // Add simple class
        var fieldClass = 'qgisType-'+qgisType;
        field.setAttribute('class', fieldClass);

        previousSibling && previousSibling.nextSibling ?
            container.insertBefore(field, previousSibling.nextSibling) :
            container.appendChild(control);

        console.log(name+' "'+dataType+'" "'+qgisType+'" '+(dataType == 'string' && !anyValue)+' '+(qgisType=='source'));
        if ( qgisType == 'vector' || qgisType == 'source' ) {
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
                $(field).after('<br><label class="checkbox inline disabled"><input id="processing-input-'+name.replaceAll(':', '_').replaceAll(' ', '_')+'-selection" type="checkbox" class="selection" disabled="disabled">Sélection</label>');
                $(field).parent().find('input[type="checkbox"].selection').change(function(){
                    var cbx = $(this);
                    if ( cbx.is(':checked') ) {
                        cbx.attr('checked', 'checked');
                        var theValue = input.data.literalData.value;
                        var layerName = theValue;
                        if ( layerName.startsWith('layer:') ) {
                            layerName = layerName.split('?')[0].slice(6);
                        }
                        var layerConfig = lizMap.config.layers[layerName];
                        if ( ('selectedFeatures' in layerConfig) && layerConfig.selectedFeatures.length > 0 ) {
                            theValue = 'layer:'+layerName+'?select='+encodeURIComponent('$id IN ( ' + layerConfig.selectedFeatures.join() + ' )')
                        } else if ( ('filteredFeatures' in layerConfig) && layerConfig.filteredFeatures.length > 0 ) {
                            theValue = 'layer:'+layerName+'?select='+encodeURIComponent('$id IN ( ' + layerConfig.filteredFeatures.join() + ' )')
                        } else if ( ('request_params' in layerConfig) &&
                                    ('exp_filter' in layerConfig['request_params']) &&
                                    layerConfig['request_params']['exp_filter'] ) {
                            theValue = 'layer:'+layerName+'?select='+encodeURIComponent(layerConfig['request_params']['exp_filter'])
                        }
                        input.data.literalData.value = theValue;
                    } else {
                        if ( cbx.attr('checked') != undefined )
                            cbx.removeAttr('checked');
                        var aName = cbx.parent().parent().find('select').val();
                        input.data.literalData.value = aName;
                    }
                });
            }
            if (field.children.length == 2) {
                field.selectedIndex = 1;
                field.onchange();
            }
        } else if ( qgisType == 'field' ) {
            var option;
            option = document.createElement("option");
            option.innerHTML = '---';
            field.appendChild(option);
            fieldClass += ' ';
            fieldClass += 'fieldParentLayerParameterName-'+input.processMetadata.parentLayerParameterName.replaceAll(':', '_');
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
            var parentInput = document.getElementById('processing-input-'+input.processMetadata.parentLayerParameterName.replaceAll(':', '_'));
            if (parentInput.value != '') {
                parentInput.onchange();
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
            if (field.children.length == 2) {
                field.selectedIndex = 1;
                field.onchange();
            }
        } else if ( dataType == 'boolean' ||  (dataType == 'string' && !anyValue) ) {
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
             ( ('filteredFeatures' in lConfig) && lConfig.filteredFeatures.length > 0 )  ||
             ( ('request_params' in lConfig) && ('exp_filter' in lConfig['request_params']) && lConfig['request_params']['exp_filter'] ) ) {
            cbx.removeAttr('disabled');
            cbx.parent().removeClass('disabled');
        }
        return;
    }

    function updateQgisFieldInput(input, field, fn) {
        var qgisFieldInputs = $('#processing-input select.fieldParentLayerParameterName-'+input.identifier.replaceAll(':', '_'));
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

        var identifier = document.getElementById('processing-form-container').dataset.value;
        // Restricted layers
        var restrictedFields = [];
        if(
            typeof wps_wps_project_config !== 'undefined'
            && (identifier in wps_wps_project_config)
        ) {
            var name = qgisFieldInputs[0].name;
            if (name in wps_wps_project_config[identifier]) {
                restrictedFields = wps_wps_project_config[identifier][name];
                if ( !$.isArray(restrictedFields) )
                    restrictedFields = [];
            }
        }

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
                    if (restrictedFields.length != 0 && restrictedFields.indexOf(att) == -1)
                        return;
                    var alias = aliases[att];
                    if ( alias != '' )
                        $(e).append('<option value="'+att+'">'+alias+'</option>');
                    else
                        $(e).append('<option value="'+att+'">'+att+'</option>');
                });
            }
            qgisFieldInputs.each( function( i, e ) {
                if (e.children.length == 2) {
                    e.selectedIndex = 1;
                }
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

    function addDigitizingExtentHandler(btnId) {
        var btn = document.getElementById(btnId);
        btn.onclick = function() {
            var self = $(btn);
            if ( self.hasClass('active') ) {
                lizMap.mainLizmap.digitizing.toolSelected = 'deactivate';
                $(btn).removeClass('active');
            } else {
                $('#processing-input button.wps-digitizing.active').removeClass('active');
                lizMap.mainLizmap.digitizing.toolSelected = 'box';
                $(btn).addClass('active');
            }
        }
    }

    function addDigitizingPointHandler(btnId) {
        var btn = document.getElementById(btnId);
        btn.onclick = function() {
            var self = $(btn);
            if ( self.hasClass('active') ) {
                lizMap.mainLizmap.digitizing.toolSelected = 'deactivate';
                $(btn).removeClass('active');
            } else {
                $('#processing-input button.wps-digitizing.active').removeClass('active');
                lizMap.mainLizmap.digitizing.toolSelected = 'point';
                $(btn).addClass('active');
            }
        }
    }

    function updateDigitizingExtent(btnId) {
        var btn = document.getElementById(btnId);
        var select = btn.previousSibling;
        var feat = lizMap.mainLizmap.digitizing.featureDrawn.pop();
        var bounds = new OpenLayers.Bounds(feat.geometry.bounds.toArray());
        bounds.transform(lizMap.mainLizmap.digitizing.drawLayer.projection, select.value);
        btn.parentElement.firstChild.value = bounds.toString() + ' (' + select.value + ')';
        btn.parentElement.firstChild.onblur();
        lizMap.mainLizmap.digitizing.drawLayer.removeFeatures([feat]);
        btn.onclick();
    }

    function updateDigitizingPoint(btnId) {
        var btn = document.getElementById(btnId);
        var select = btn.previousSibling;
        var feat = lizMap.mainLizmap.digitizing.featureDrawn.pop();
        var point = feat.geometry.clone();
        point.transform(lizMap.mainLizmap.digitizing.drawLayer.projection, select.value);
        var geojson = new OpenLayers.Format.GeoJSON();
        //console.log(geojson.write(point));
        //btn.parentElement.firstChild.value = 'CRS='+ select.value.split(':')[1] +';'+ point.toString();
        btn.parentElement.firstChild.value = '{ "geometry": '+geojson.write(point)+',  "crs": { "type": "name", "properties": { "name": "'+select.value+'" } } }';
        btn.parentElement.firstChild.onblur();
        lizMap.mainLizmap.digitizing.drawLayer.removeFeatures([feat]);
        btn.onclick();
    }

    // execute the process
    function execute() {
        document.getElementById("processing-form-errors").innerHTML = '';
        // Clone process
        var theProcess = OpenLayers.Util.extend({}, process);
        //var output = process.processOutputs[0];
        var inputs = theProcess.dataInputs,
            input;
        if ( !inputs )
            inputs = theProcess.dataInputs = [];
        // remove occurrences that the user has not filled out
        for (var i=inputs.length-1; i>=0; --i) {
            input = inputs[i];
            if ((input.minOccurs === 0 || input.occurrence) && !input.data && !input.reference) {
                OpenLayers.Util.removeItem(inputs, input);
                continue;
            }
            if ( !('processMetadata' in input )) {
                continue;
            }
            var qgisType = '';
            if ( 'processMetadata' in input ) {
                qgisType = input.processMetadata.type;
            }
            if ( qgisType == 'source' ) {
                var theValue = input.data.literalData.value;
                var layerName = theValue;
                if ( layerName.startsWith('layer:') ) {
                    layerName = layerName.split('?')[0].slice(6);
                }
                var layerConfig = lizMap.config.layers[layerName];
                if ( ('filteredFeatures' in layerConfig) && layerConfig.filteredFeatures.length > 0 ) {
                    theValue = 'layer:'+layerName+'?select='+encodeURIComponent('$id IN ( ' + layerConfig.filteredFeatures.join() + ' )')
                } else if ( ('request_params' in layerConfig) &&
                            ('exp_filter' in layerConfig['request_params']) &&
                            layerConfig['request_params']['exp_filter'] ) {
                    theValue = 'layer:'+layerName+'?select='+encodeURIComponent(layerConfig['request_params']['exp_filter'])
                }
                var inputName = input.identifier;
                var cbx = $('#processing-input-'+inputName.replaceAll(':', '_').replaceAll(' ', '_')+'-selection');
                if ( cbx.is(':checked') ) {
                    if ( ('selectedFeatures' in layerConfig) && layerConfig.selectedFeatures.length > 0 ) {
                        theValue = 'layer:'+layerName+'?select='+encodeURIComponent('$id IN ( ' + layerConfig.selectedFeatures.join() + ' )')
                    }
                }
                input.data.literalData.value = theValue;
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
        for (var i=theProcess.processOutputs.length-1; i>=0; --i) {
            var processOutput = theProcess.processOutputs[i];
            var output = {
                identifier: processOutput.identifier
            }
            if ( processOutput.complexOutput ) {
                output.asReference = true;
            }
            outputs.push( output );
        }
        theProcess.responseForm = {
            responseDocument: {
                storeExecuteResponse: true,
                status: true,
                outputs: outputs
            }
        };
        var data = new OpenLayers.Format.WPSExecute().write(theProcess);
        var requestTime = (new Date()).toISOString();
        OpenLayers.Request.POST({
            url: lizUrls['wps_wps'],
            params: lizUrls.params,
            data: data,
            success: function(response) {
                showOutput(theProcess, response, requestTime);

            },
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

        var btn = $('#log-'+uuid).find('button[value="failed-'+uuid+'"].checkbox');

        var logFailedUuid = $('#processing-log-failed-uuid');
        var oldUuid = logFailedUuid.text();

        // clear
        $('#processing-log-failed-messages').html('');
        $('#processing-log-failed .processing-log-failed-detail-table tr.wps-input').remove();
        $('#processing-log-failed-creation').html('');
        $('#processing-log-failed-identifier').html('');
        $('#processing-log-failed-title').html('');

        // close
        if ( uuid == oldUuid ) {
            $('#processing-log-failed').hide();
            logFailedUuid.html('');
            btn.removeClass('checked');
            return;
        }

        // unique checked
        $('#log-'+oldUuid).find('button[value="failed-'+oldUuid+'"]').removeClass('checked');
        btn.addClass('checked');

        // Update information
        $('#processing-log-failed-title').html(processExecuted.title);
        $('#processing-log-failed-identifier').html(processExecuted.identifier);
        logFailedUuid.html(uuid);

        $('#processing-log-failed-creation').html((new Date(processExecuted.startTime)).toLocaleString());

        for (var i=0,ii=processExecuted.dataInputs.length; i<ii; ++i) {
            var input = processExecuted.dataInputs[i];
            var tr = '<tr class="wps-input" data-value="'+input.identifier+'">';
            tr += '<td>'+input.title+'</td>';
            tr += '<td>';
            if ( input.data && input.data.literalData) {
                tr += input.data.literalData.value;
            } else if ( input.data && input.data.complexData) {
                tr += input.data.complexData.value;
            } else {
                tr += 'Not set';
            }
            tr += '</td>';
            tr += '</tr>';
            $('#processing-log-failed .processing-log-failed-detail-table').append(tr);
        }

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

    function toggleProcessResults( uuid ) {
        var processExecuted = executedProcesses[uuid];

        // Get the process button
        var btn = $('#log-'+uuid).find('button[value="results-'+uuid+'"].checkbox');

        // Show results
        $('#processing-results-list').show();

        // Get algorithm results div
        var divResults = $('#processing-results-list div[data-value="'+processExecuted.identifier+'"]');
        // And show it
        divResults.show();

        btn.addClass('checked');
        if ( divResults.find('table.processing-results-literal-table tr:first th[class="'+uuid+'"]').length == 0 ) {
            // No process results are displayed

            var hasDetail = false;
            // Add input description
            if (processExecuted.dataInputs) {
                if (divResults.find('table.processing-results-detail-table tr').length == 1) {
                    for (var i=0,ii=processExecuted.dataInputs.length; i<ii; ++i) {
                        var input = processExecuted.dataInputs[i];
                        //console.log(input);
                        // details table
                        var tr = '<tr data-value="'+input.identifier+'">';
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
                        tr += '</tr>';
                        divResults.find('table.processing-results-detail-table tr:last').after(tr);
                    }
                }
                // Add process inputs
                // Fisrt the header
                divResults.find('table.processing-results-detail-table tr:first th:last')
                    .after('<th class="'+uuid+'">'+(new Date(processExecuted.startTime)).toLocaleString()+'</th>');
                // Then the data
                for (var i=0,ii=processExecuted.dataInputs.length; i<ii; ++i) {
                    var input = processExecuted.dataInputs[i];
                    var td = '<td class="'+uuid+'">';
                    //console.log(input);
                    if (input.boundingBoxData && input.data && input.data.boundingBoxData) {
                        var bbValue = input.data.boundingBoxData.bounds;
                        td += bbValue.left+', '+bbValue.bottom+', '+bbValue.right+', '+bbValue.top+' ('+input.data.boundingBoxData.projection+')';
                    } else if (input.boundingBoxData && input.data && input.data.literalData) {
                        var bbValue = input.data.literalData.value;
                        td += bbValue.left+', '+bbValue.bottom+', '+bbValue.right+', '+bbValue.top;
                    } else if ( input.data && input.data.complexData) {
                        td += input.data.complexData.value;
                    } else if ( input.data && input.data.literalData) {
                        td += input.data.literalData.value;
                    } else {
                        td += 'Not set';
                    }
                    td += '</td>';
                    divResults.find('table.processing-results-detail-table tr[data-value="'+input.identifier+'"] td:last').after(td);
                    hasDetail = true;
                }
            }
            // Hide or show content depending on results
            divResults.find('div.processing-results-detail').toggle(hasDetail);

            // literal Data
            var hasLiteral = false;
            // Add literal output description
            if (divResults.find('table.processing-results-literal-table tr').length == 1) {
                for (var i=0,ii=processExecuted.processOutputs.length; i<ii; ++i) {
                    var output = processExecuted.processOutputs[i];
                    if ( !output.literalData )
                        continue;
                    var tr = '<tr data-value="'+output.identifier+'">';
                    tr += '<td>'+output.title+'</td>';
                    tr += '</tr>';
                    divResults.find('table.processing-results-literal-table tr:last').after(tr);
                }
            }
            // Add process literal results
            // Fisrt the header
            divResults.find('table.processing-results-literal-table tr:first th:last')
                .after('<th class="'+uuid+'">'+(new Date(processExecuted.startTime)).toLocaleString()+'</th>');
            // Then the data
            for (var i=0,ii=processExecuted.processOutputs.length; i<ii; ++i) {
                var output = processExecuted.processOutputs[i];
                if ( !output.literalData )
                    continue;
                var td = '<td class="'+uuid+'">'+output.literalData.value+'</td>';
                divResults.find('table.processing-results-literal-table tr[data-value="'+output.identifier+'"] td:last').after(td);
                hasLiteral = true;
            }
            // Hide or show content depending on results
            divResults.find('div.processing-results-literal').toggle(hasLiteral);


            // LAYERS
            // reference Data with mimeType application/x-ogc-wms
            var hasLayer = false;
            // Add layer output description
            if (divResults.find('table.processing-results-layer-table tr').length == 1) {
                for (var i=0,ii=processExecuted.processOutputs.length; i<ii; ++i) {
                    var output = processExecuted.processOutputs[i];
                    if ( !output.reference )
                        continue;
                    if ( !output.reference.mimeType )
                        continue;
                    if ( output.reference.mimeType != 'application/x-ogc-wms' )
                        continue;
                    // Check layer parameter
                    var url = output.reference.href;
                    // Extract layer parameter
                    var layerParam = getQueryParam(url, 'layer') || getQueryParam(url, 'layers');
                    if (layerParam == undefined)
                        continue;
                    var tr = '<tr data-value="'+output.identifier+'">';
                    tr += '<td>'+output.title+'</td>';
                    tr += '</tr>';
                    divResults.find('table.processing-results-layer-table tr:last').after(tr);
                }
            }
            // Add process layer results
            // Fisrt the header
            divResults.find('table.processing-results-layer-table tr:first th:last')
                .after('<th class="'+uuid+'">'+(new Date(processExecuted.startTime)).toLocaleString()+'</th>');
            // Then the data
            for (var i=0,ii=processExecuted.processOutputs.length; i<ii; ++i) {
                var output = processExecuted.processOutputs[i];
                if ( !output.reference )
                    continue;
                if ( !output.reference.mimeType )
                    continue;
                if ( output.reference.mimeType != 'application/x-ogc-wms' )
                    continue;
                var url = output.reference.href;
                // Extract map parameter
                var mapParam = getQueryParam(url, 'map');
                // Extract layer parameter
                var layerParam = getQueryParam(url, 'layer') || getQueryParam(url, 'layers');
                if (layerParam == undefined)
                    continue;
                // Create a layer name for the map
                var layerName = uuid+'-'+output.identifier.replaceAll(':', '_').replaceAll(' ', '_');
                console.log(layerName);
                // Create the base url
                var serviceUrl = OpenLayers.Util.urlAppend( url.substring(0, url.indexOf('?') + 1)
                    ,OpenLayers.Util.getParameterString({map:mapParam})
                );
                // Defined WMS layer parameters
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
                // Create OpenLayers WMS layer
                var wmsLayer = new OpenLayers.Layer.WMS(layerName
                    ,serviceUrl
                    ,layerWmsParams
                    ,{
                        isBaseLayer:false
                        ,visibility:true
                        ,gutter:5
                        ,buffer:0
                        ,transitionEffect:'resize'
                        ,removeBackBufferDelay:250
                        ,singleTile:true
                        ,ratio:1
                    });
                map.addLayer(wmsLayer);
                // Get the vector layer index to push WMS layer just before
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

                // Insert layer info in table layer results
                var td = '<td class="'+uuid+'">';
                //td += '<button class="btn checkbox checked layerView" value="'+layerName+'" title="'+layerParam+'"></button>';
                td += '<span>'+layerParam+'</span>'
                td += '<button style="display:none;" class="btn btn-mini layerDownload" value="'+layerName+'" title="'+layerParam+'">';
                td += '<i class="icon-download-alt"></i>';
                td += '</button>';
                td += '</td>';
                divResults.find('table.processing-results-layer-table tr[data-value="'+output.identifier+'"] td:last').after(td);

                hasLayer = true;

                // Add a line in the map layer tree
                var trResults = $('#switcher table.tree #group-wps-results');
                if ( trResults.length == 0 ) {
                    $('<tr id="group-wps-results" class="liz-group expanded parent initialized"><td><a href="#" title="Réduire" style="margin-left: -19px; padding-left: 19px" class="expander"></a><button class="btn checkbox partial checked" name="group" value="wps-results" title="Afficher/Masquer"></button><span class="label" title="" data-original-title="">Résultats</span></td><td></td><td></td><td></td></tr>')
                        .insertBefore('#switcher table.tree tr:first');
                    trResults = $('#switcher table.tree #group-wps-results');
                    trResults.find(' td a.expander').click(function() {
                        var btn = $(this);
                        var tgroup = btn.parent().parent();
                        var child = $('#switcher table.tree tr.child-of-'+tgroup.attr('id'));
                        if( tgroup.hasClass('expanded') ) {
                            tgroup.removeClass('expanded').addClass('collapsed');
                            btn.attr('title', lizDict['tree.button.expand']);
                            child.each(function() {
                                if( $(this).is(".expanded.parent") )
                                    $(this).find('td a.expander').click();
                                $(this).addClass('ui-helper-hidden');
                            });
                        } else if( tgroup.hasClass('collapsed') ) {
                            tgroup.removeClass('collapsed').addClass('expanded');
                            btn.attr('title', lizDict['tree.button.collapse']);
                            child.each(function() {
                                $(this).removeClass('ui-helper-hidden');
                            });
                        }
                        return false;
                    });
                }

                // Build WMS GetLegendGraphic to add image in layer tree
                var legendParams = {
                    SERVICE: "WMS",
                    VERSION: "1.3.0",
                    REQUEST: "GetLegendGraphic",
                    LAYER: layerParam,
                    STYLE: '',
                    SLD_VERSION: "1.1.0",
                    EXCEPTIONS: "application/vnd.ogc.se_inimage",
                    FORMAT: "image/png",
                    TRANSPARENT: "TRUE",
                    WIDTH: 150,
                    LAYERFONTSIZE: 9,
                    ITEMFONTSIZE: 9,
                    SYMBOLSPACE: 1,
                    ICONLABELSPACE: 2,
                    LAYERFONTSIZE: 0,
                    LAYERSPACE: 0,
                    LAYERFONTBOLD: "FALSE",
                    LAYERTITLE: "FALSE",
                    DPI: 96
                };

                var legendParamsString = OpenLayers.Util.getParameterString(
                    legendParams
                );
                legendParamsString = OpenLayers.Util.urlAppend(serviceUrl, legendParamsString);
                trResults.after('<tr id="legend-wps-results-'+layerName+'" class="liz-layer child-of-layer-wps-results-'+layerName+' '+uuid+' legendGraphics initialized collapsed ui-helper-hidden"><td colspan="2" style="padding-left: 39px;"><div class="legendGraphics"><img data-src="" src="'+legendParamsString+'"></div></td></tr>');
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
                $('#switcher table.tree #layer-wps-results-'+layerName+' td a.expander').click(function() {
                    var btn = $(this);
                    var tlayer = btn.parent().parent();
                    var child = $('#switcher table.tree tr.child-of-'+tlayer.attr('id'));
                    if( tlayer.hasClass('expanded') ) {
                        tlayer.removeClass('expanded').addClass('collapsed');
                        child.each(function() {
                            $(this).addClass('ui-helper-hidden');
                        });
                    } else if( tlayer.hasClass('collapsed') ) {
                        tlayer.removeClass('collapsed').addClass('expanded');
                        child.each(function() {
                            $(this).removeClass('ui-helper-hidden');
                        });
                    }
                    return false;
                });
            }

            /*$('#processing-results-layer-table tr td[class="'+uuid+'"] button.layerView').click(function() {
                var btn = $(this);
                if ( btn.hasClass('checked') ) {
                    btn.removeClass('checked');
                    lizMap.map.getLayersByName(btn.val())[0].setVisibility(false);
                } else {
                    btn.addClass('checked');
                    lizMap.map.getLayersByName(btn.val())[0].setVisibility(true);
                }
                return false;
            });*/
            divResults.find('table.processing-results-layer-table tr td[class="'+uuid+'"] button.layerDownload').click(function() {
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
            divResults.find('div.processing-results-layer').toggle(hasLayer);

            // FILES
            // reference Data with mimeType not application/x-ogc-wms
            var hasFile = false;
            // Add layer output description
            if (divResults.find('table.processing-results-file-table tr').length == 1) {
                for (var i=0,ii=processExecuted.processOutputs.length; i<ii; ++i) {
                    var output = processExecuted.processOutputs[i];
                    if ( !output.reference )
                        continue;
                    if ( !output.reference.mimeType )
                        continue;
                    if ( output.reference.mimeType == 'application/x-ogc-wms' )
                        continue;
                    var tr = '<tr data-value="'+output.identifier+'">';
                    tr += '<td>'+output.title+'</td>';
                    tr += '</tr>';
                    divResults.find('table.processing-results-file-table tr:last').after(tr);
                }
            }
            // Add process file results
            // Fisrt the header
            divResults.find('table.processing-results-file-table tr:first th:last')
                .after('<th class="'+uuid+'">'+(new Date(processExecuted.startTime)).toLocaleString()+'</th>');
            // Then the data
            for (var i=0,ii=processExecuted.processOutputs.length; i<ii; ++i) {
                var output = processExecuted.processOutputs[i];
                if ( !output.reference )
                    continue;
                if ( !output.reference.mimeType )
                    continue;
                if ( output.reference.mimeType == 'application/x-ogc-wms' )
                    continue;
                var url = output.reference.href;
                // Extract file parameter
                var fileName = getQueryParam(url, 'file');
                if (fileName == undefined)
                    fileName = url.split('/').pop();

                // Insert file info in table file results
                var td = '<td class="'+uuid+'">';
                //td += '<button class="btn checkbox checked layerView" value="'+layerName+'" title="'+layerParam+'"></button>';
                td += '<span>'+fileName+'</span>';
                td += '&nbsp;';
                td += '<a class="btn btn-mini" target="_blank" href="'+url+'" title="'+output.title+'">';
                td += '<i class="icon-download-alt"></i>';
                td += '</button>';
                td += '</td>';
                divResults.find('table.processing-results-file-table tr[data-value="'+output.identifier+'"] td:last').after(td);

                hasFile = true;
            }
            // Hide or show content depending on results
            divResults.find('div.processing-results-file').toggle(hasFile);


            // PLOTS
            // Display plots
            var hasPlot = false;
            var div = '<div class="processing-results-plot-display" data-value="'+uuid+'">';
            div+= '<h5>'+(new Date(processExecuted.startTime)).toLocaleString()+'</h5>';
            div+= '</div>';
            divResults.find('div.processing-results-plot-table').append(div);
            // for each plot output create a plotly display
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
                oDiv += '<div id="'+uuid+'-'+output.identifier.replaceAll(':', '_').replaceAll(' ', '_')+'" style="height:400px;">';
                oDiv += '</div>';
                divResults.find('div.processing-results-plot div[data-value="'+uuid+'"]').append(oDiv);
                loadConfigAndDisplayPlot( uuid+'-'+output.identifier.replaceAll(':', '_').replaceAll(' ', '_'), url );
                hasPlot = true;

            }
            // Hide or show content depending on results
            divResults.find('div.processing-results-plot').toggle(hasPlot);

        } else {
            // Remove displayed results
            // Remove plot div
            divResults.find('div.processing-results-plot-table > div[data-value="'+uuid+'"]').remove();
            // Hide or show content depending on results
            var hasPlot = (divResults.find('div.processing-results-plot-table > div').length != 0);
            if (!hasPlot) {
                divResults.find('div.processing-results-plot').hide();
            }

            // Remove layer outputs
            // From the layer tree
            $('#switcher table.tree tr.liz-layer.child-of-group-wps-results.'+uuid+' button').unbind('click');
            $('#switcher table.tree tr.liz-layer.child-of-group-wps-results.'+uuid+' a.expander').unbind('click');
            $('#switcher table.tree tr.liz-layer.child-of-group-wps-results.'+uuid+' button').each(function(i, b){
                var layerName = $(b).val();
                var layers = lizMap.map.getLayersByName( layerName );
                if ( layers.length > 0 )
                    lizMap.map.removeLayer( layers[0] );
            });
            $('#switcher table.tree tr.liz-layer.'+uuid).remove();
            if ( $('#switcher table.tree tr.liz-layer.child-of-group-wps-results').length == 0 )
                $('#switcher table.tree #group-wps-results').remove();

            // From table layer results
            //divResults.find('table.processing-results-layer-table tr td[class="'+uuid+'"] button').unbind('click');
            /*$('#processing-results-layer-table tr td[class="'+uuid+'"] button').each(function(i, b){
                var layerName = $(b).val();
                var layers = lizMap.map.getLayersByName( layerName );
                if ( layers.length > 0 )
                    lizMap.map.removeLayer( layers[0] );
            });*/
            divResults.find('table.processing-results-layer-table tr td[class="'+uuid+'"]').remove();
            divResults.find('table.processing-results-layer-table tr th[class="'+uuid+'"]').remove();
            // Hide or show content depending on results
            var hasLayer = (divResults.find('table.processing-results-layer-table tr th').length != 1);
            if (!hasLayer) {
                divResults.find('div.processing-results-layer').hide();
            }

            // Remove file outputs
            divResults.find('table.processing-results-file-table tr td[class="'+uuid+'"]').remove();
            divResults.find('table.processing-results-file-table tr th[class="'+uuid+'"]').remove();
            // Hide or show content depending on results
            var hasLiteral = (divResults.find('table.processing-results-file-table tr th').length != 1);
            if (!hasLiteral) {
                divResults.find('div.processing-results-file').hide();
            }

            // Remove literal outputs
            divResults.find('table.processing-results-literal-table tr td[class="'+uuid+'"]').remove();
            divResults.find('table.processing-results-literal-table tr th[class="'+uuid+'"]').remove();
            // Hide or show content depending on results
            var hasLiteral = (divResults.find('table.processing-results-literal-table tr th').length != 1);
            if (!hasLiteral) {
                divResults.find('div.processing-results-literal').hide();
            }

            // Remove inputs
            divResults.find('table.processing-results-detail-table tr td[class="'+uuid+'"]').remove();
            divResults.find('table.processing-results-detail-table tr th[class="'+uuid+'"]').remove();
            // Hide or show content depending on results
            var hasDetail = (divResults.find('table.processing-results-detail-table tr th').length != 2);
            if (!hasDetail) {
                divResults.find('div.processing-results-detail').hide();
            }

            // Hide or show algorithm results depending on results
            if (!hasPlot && !hasLayer && !hasLiteral) {
                divResults.hide();
            }
            btn.removeClass('checked');
        }

        // open dock
        if ( !$('#button-processing-results').parent().hasClass('active') )
            $('#button-processing-results').click();

        refreshPlotsWidth();
    }

    // Refresh plots width based on their parent width which have CSS flex:1 so they all share space equally
    function refreshPlotsWidth() {
        // Get plot divs
        const divPlots = document.querySelectorAll('#processing-results-list div.processing-results-plot');
        if (divPlots.length) {
            for (const divPlot of divPlots) {
                // for each plot div get plotly divs to update width
                const divPlotlys = divPlot.querySelectorAll('div.processing-results-plot-display .js-plotly-plot');
                if (divPlotlys.length) {
                    // Get first container div width
                    const divWidth = parseInt(divPlot.querySelector('div.processing-results-plot-display').clientWidth);
                    for (const divPlotly of divPlotlys) {
                        // Apply width to all plotly divs of this plot div
                        Plotly.relayout(divPlotly.id, {
                            width: divWidth
                        });
                    }
                }
            }
        }
    }

    function updateLogTable( executedProcess ) {
        if ( !executedProcess )
            return;
        if ( !executedProcess.uuid )
            return;

        const uuid = executedProcess.uuid;
        const startTime = executedProcess.startTime;
        const status = executedProcess.status;
        const endTime = executedProcess.endTime;

        const shortUUID = uuid.substring(0, 13);

        let tr = '<tr id="log-'+uuid+'" data-value="'+startTime+'">';

        // Display actions buttons
        tr += '<td>';
        if (status == 'Succeeded'){
            tr += '<button class="btn btn-mini checkbox" value="results-' + uuid + '" title="Toggle process results"></button>';
        }
        else if (status == 'Failed'){
            tr += '<button class="btn btn-mini checkbox" value="failed-' + uuid + '" title="Toggle process information"></button>';
        }
        tr += '</td>';

        // Title info
        let titleInfo = [];
        let label = '';
        let inputLabel = '';
        if(
            typeof wps_wps_project_config !== 'undefined'
            && (executedProcess.identifier in wps_wps_project_config)
            && ('__job_label' in wps_wps_project_config[executedProcess.identifier])
        ){
            inputLabel = wps_wps_project_config[executedProcess.identifier]['__job_label'];
        }
        if (executedProcess.dataInputs) {
            for (var i=0,ii=executedProcess.dataInputs.length; i<ii; ++i) {
                var input = executedProcess.dataInputs[i];
                if ( input.data && input.data.literalData) {
                    titleInfo.push(input.data.literalData.value);
                }
                if ( inputLabel != '' && input.identifier == inputLabel ) {
                    label = input.data.literalData.value;
                }
                if (inputLabel == '' && input.processMetadata && input.processMetadata.type
                    && (
                        input.processMetadata.type == 'sink'
                        || input.processMetadata.type == 'vectorDestination'
                        || input.processMetadata.type == 'rasterDestination'
                        || input.processMetadata.type == 'fileDestination'
                    )
                ) {
                    label = input.data.literalData.value;
                }
            }
        }
        if (label == '') {
            label = (new Date(startTime)).toLocaleString();
        } else {
            titleInfo.unshift((new Date(startTime)).toLocaleString());
        }

        // Display start time
        tr += '<td title="' + shortUUID + '">';
        if (status == 'Succeeded'){
            tr += '<button class="btn btn-mini btn-link" value="results-' + uuid + '" title="' + titleInfo.join(', ') + '">';
        }
        else if (status == 'Failed'){
            tr += '<button class="btn btn-mini btn-link" value="failed-' + uuid + '" title="' + titleInfo.join(', ') + '">';
        }
        tr += label
        tr += '</button></td>';

        // Display status
        if ( status == 'Accepted' || status == 'Started' )
            tr += '<td><span class="badge badge-info"><i class="icon-white icon-refresh"></i></span></td>';
        else if ( status == 'Paused' )
            tr += '<td><span class="badge badge-warning"><i class="icon-white icon-pause"></i></span></td>';
        else if ( status == 'Succeeded' )
            tr += '<td><span class="badge badge-success"><i class="icon-white icon-ok"></i></span></td>';
        else if ( status == 'Failed' )
            tr += '<td><span class="badge badge-important"><i class="icon-white icon-remove"></i></span></td>';
        else
            tr += '<td>'+status+'</td>';

        tr += '</tr>';

        var logTr = $('#log-'+uuid);
        var isChecked = false;
        if ( logTr.length == 0 ){
            logTrList = $('#processing-log-list li[data-value="' + executedProcess.identifier + '"] .processing-log-list-results tr');
            var keepLogTrListLen = logTrList.length;

            // Add the tr in right order
            logTrList.each(function(idx, elt){
                elt = $(elt);
                if (startTime > elt.attr('data-value')) {
                    elt.before(tr);
                    return false;
                }
            });

            // Check if the tr has been added
            var newLogTrListLen = $('#processing-log-list li[data-value="' + executedProcess.identifier + '"] .processing-log-list-results tr').length;
            if (newLogTrListLen == keepLogTrListLen) {
                $('#processing-log-list li[data-value="' + executedProcess.identifier + '"] .processing-log-list-results').append(tr);
            }
        }
        else {
            logTr.find('button').unbind('click');
            var isChecked = logTr.find('button.checkbox').hasClass('checked');
            logTr.replaceWith(tr);
        }

        logTr = $('#log-'+uuid);
        if (isChecked) {
            logTr.find('button.checkbox').addClass('checked');
        }
        logTr.find('button').click(function(){
            var self = $(this);
            var val = self.val();
            //console.log(val);
            var btnUuid = '';
            var btnAction = '';
            if ( val.startsWith('results-' ) ) {
                btnUuid = val.replaceAll('results-', '');
                btnAction = 'results';
            } else if ( val.startsWith('failed-' ) ) {
                btnUuid = val.replaceAll('failed-', '');
                btnAction = 'failed';
            }
            //console.log(btnUuid);
            if ( btnUuid in executedProcesses ) {
                var processExecuted = executedProcesses[btnUuid];
                //console.log( processExecuted );
                if ( btnAction == 'results' ) {
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
                //console.log('Process object updated');
                //console.log(pToSave);
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
        //console.log(executeResponse);
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
            if ( executeResponse.status.exceptionReport && executeResponse.status.exceptionReport.exceptions ) {
                var exceptionList = executeResponse.status.exceptionReport.exceptions;
                for ( var i = 0, len=exceptionList.length; i < len; i++ ) {
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
        // Display results tab if inactive
        $('li.processing-results:not(.active) #button-processing-results').click();

        var pToSave = parseExecuteResponse( executeResponse, requestTime );
        var uuid = pToSave.uuid;
        executedProcesses[uuid] = pToSave;

        updateLogTable( pToSave );
        storeStatusProcess( uuid );
        updateStatusProcess( uuid );
        scheduleUpdateStatusProcesses();
    }

    function manageExceptionReport( exceptionReport, requestTime ) {
        var result = document.getElementById("processing-form-errors");
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
    function showOutput(theProcess, response, requestTime) {
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

            // Display results for executed algorithm if not expanded
            $('#processing-log-list li[data-value="' + theProcess.identifier + '"]:not(.expanded)').addClass('expanded');

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

            // Refresh plots width when #processing-results size change
            const processingResultsObserver = new ResizeObserver(() => {
                refreshPlotsWidth();
            });
            processingResultsObserver.observe(document.querySelector('#processing-results'));
        },

        'dockopened': function(e) {
            if (e.id = 'processing') {
                var options = $("#processing-processes option");
                if (options.length == 2) {
                    if (options.last().parent().val() != options.last().val()) {
                        options.last().parent().val(options.last().val());
                        options.last().parent().change();
                    }
                }
            }
        },

        'layerSelectionChanged': function(e) {

            $('#processing-form-container select.qgisType-source').each(function(idx, elt){
                elt = $(elt);
                if ( elt.val() != e.featureType )
                    return;

                var cbx = $(elt).parent().find('input[type="checkbox"].selection');
                var cbxChecked = false;
                if ( cbx.length != 0 ) {
                    cbxChecked = cbx.is(':checked');
                }

                elt.change();
                if (cbxChecked) {
                    cbx.click();
                }
            });

        }

    });
}();
