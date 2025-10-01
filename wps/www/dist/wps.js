/*! For license information please see wps.js.LICENSE.txt */
(()=>{"use strict";class e{static async GETMethod(e){const t=await fetch(window.location.origin+e);return await this.verifyResponse(t)}static async POSTMethod(e,t=""){const s=await fetch(window.location.origin+e,{method:"POST",body:t});return await this.verifyResponse(s)}static async DELETEMethod(e){const t=await fetch(window.location.origin+e,{method:"DELETE"});return await this.verifyResponse(t)}static async verifyResponse(e){let t=await e.json();if(!t)throw new Error("Wrong WPS Server URL.");if(e.status>=400)throw new Error(t.status+", "+t.message);return t}}class t{constructor(e,t,s,i,n){if(this._description=e,this._id=t,this._cleanID=t.replaceAll(":","-"),void 0!==s)for(const e of Object.values(s))e.processId=this.getId(),e.data="";this._listInputs=s,this._listOutputs=i,this._title=n}setInputValue(e,t){this._listInputs[e].data=t}getAllInputsValues(){let e=[];for(let t of Object.values(this.getInputs()))e.push(t.data);return e}getAllInputsValuesWithMinOccursGreaterThan0(){let e=[];for(let[t,s]of Object.entries(this.getInputs()))s.minOccurs>0&&e.push(s.data);return e}getDescription(){return this._description}getId(){return this._id}getCleanId(){return this._cleanID}getInputs(){return this._listInputs}getOutputs(){return this._listOutputs}getTitle(){return this._title}}class s{constructor(e){this._created=e.created,this._started=e.started?e.started:"",this._expire=e.expire?e.expire:"",this._finished=e.finished?e.finished:"",this._updated=e.updated,this._jobID=e.jobID,this._message=e.message,this._processID=e.processID,this._cleanProcessID=e.processID.replaceAll(":","-"),this._progress=e.progress,this._status=e.status,this._type=e.type}getTimes(){return{created:this._created,started:this._started,expire:this._expire,finished:this._finished,updated:this._updated}}areResultsUp(){return"Task finished"===this._message}getJobID(){return this._jobID}getMessage(){return this._message}getProcessID(){return this._processID}getCleanProcessID(){return this._cleanProcessID}getProgress(){return this._progress}getStatus(){return this._status}getType(){return this._type}}class i{static PROCESSES_URL;static async getAllProcesses(){try{const s=await e.GETMethod(this.PROCESSES_URL);let i=[];return s.processes.forEach((e=>{i.push(new t(e.description,e.id,e.inputs,e.outputs,e.title))})),i}catch(e){throw e}}static async getSpecificProcess(s){try{const i=this.PROCESSES_URL+"/"+s+"?repository="+lizUrls.params.repository+"&project="+lizUrls.params.project,n=await e.GETMethod(i);return new t(n.description,n.id,n.inputs,n.outputs,n.title)}catch(e){throw e}}static async executeProcess(t,i){try{const n=this.PROCESSES_URL+"/"+t+"/execution?repository="+lizUrls.params.repository+"&project="+lizUrls.params.project;let o=await e.POSTMethod(n,i);return new s({created:o.created,updated:o.updated,jobID:o.jobID,links:o.links,message:o.message,processID:o.processID,progress:o.progress,status:o.status,type:o.type})}catch(e){throw e}}static setProccesesUrl(e){this.PROCESSES_URL=e}}class n{static JOBS_URL;static async getAllJobs(){try{const t=await e.GETMethod(this.JOBS_URL);let i={};return t.jobs.forEach((e=>{i[e.jobID]=new s({created:e.created,started:e.started,expire:e.expire,finished:e.finished,updated:e.updated,jobID:e.jobID,message:e.message,processID:e.processID,progress:e.progress,status:e.status,type:e.type})})),i}catch(e){throw e}}static async getSpecificJob(t){try{const i=this.JOBS_URL+"/"+t,n=await e.GETMethod(i);return new s({created:n.created,started:n.started,expire:n.expire,finished:n.finished,updated:n.updated,jobID:n.jobID,message:n.message,processID:n.processID,progress:n.progress,status:n.status,type:n.type})}catch(e){throw e}}static getResultOfSpecificJob(t){try{const s=this.JOBS_URL+"/"+t+"/results";return e.GETMethod(s)}catch(e){throw e}}static async deleteSpecificJob(t){try{const s=this.JOBS_URL+"/"+t;return e.DELETEMethod(s)}catch(e){throw e}}static setJobUrl(e){this.JOBS_URL=e}}class o{constructor(e,t,s){this.occurrence=s;const i=this.firstPartBuilder(e.replaceAll(":","-"),t.title);this.control=i[0],this.fieldDiv=i[1]}firstPartBuilder(e,t){const s=document.createElement("div");s.setAttribute("class","control-group"),s.id="processing-input-"+e+"-group-"+this.occurrence;const i=document.createElement("label");i.setAttribute("class","jforms-label control-label"),i.setAttribute("for","processing-input-"+e),i.innerHTML=t,i.id="processing-input-"+e+"-label-"+this.occurrence,s.appendChild(i);const n=document.createElement("div");return n.setAttribute("class","controls"),s.appendChild(n),[s,n]}getInput(){return this.control}dispatchInputValueUpdate(e,t,s){document.dispatchEvent(new CustomEvent("WPSInputValueChanged",{detail:{processId:e.replaceAll(":","-"),inputId:t,newInputValue:s}}))}addError(e,t,s){document.dispatchEvent(new CustomEvent("WPSAddError",{detail:{id:e,input:t,text:s}}))}removeError(e){document.dispatchEvent(new CustomEvent("WPSRemoveError",{detail:{id:e}}))}}class r extends o{constructor(e,t,s){super(e,t,s);const i=["vector","source","raster","boolean","enum"],n=e.replaceAll(":","-"),o=t.metadata.find((e=>"processing:type"===e.title))?.href;"boolean"===o&&(t.schema.enum=["False","True"]);const r=t.schema.enum,a=document.createElement(i.includes(o)||r?"select":"input");if(a.id="processing-input-"+n+"-"+this.occurrence,a.name=n,a.title=t.title,this.fieldDiv.appendChild(a),a.setAttribute("class","qgisType-"+o),i.includes(o)||r){a.addEventListener("change",(s=>{this.dispatchInputValueUpdate(t.processId,e,a.value)}));const s=this.getRestrictedLayers(n,t),i=this.getLayersList(o,s);let c=i[0],l=i[1];if(["vector","source"].includes(o))this.fillSelectField(a,c),"source"===o&&this.handleSourceType(a,n,t);else if("raster"===o)this.fillSelectField(a,l);else{let e=document.createElement("option");e.innerHTML="",a.appendChild(e);for(let s in t.schema.enum)e=document.createElement("option"),e.value=r[s],e.innerHTML=r[s],a.appendChild(e)}}else"number"===o?(a.placeholder=t.schema.default,a.value=t.schema.default?t.schema.default:""):a.placeholder=n,a.addEventListener("blur",(s=>{this.checkValues(a,e,t,o)}));this.dispatchInputValueUpdate(t.processId,e,a.value)}checkValues(e,t,s,i){if(""===e.value)return this.addError(e.id,s,"value is empty."),void this.dispatchInputValueUpdate(s.processId,t,"");if(this.removeError(e.id),"number"===i){const t="integer"===s.schema.type?"integer":"float";let i;if(i="integer"===t?/^-?[0-9]*$/gm:/^-?[0-9]+(.[0-9]+)?$/gm,i.exec(e.value)){this.removeError(e.id);const t=s.schema.minimum,i=s.schema.maximum;parseFloat(e.value)>=t&&parseFloat(e.value)<=i?this.removeError(e.id):this.addError(e.id,s,"value should be between "+t+" and "+i+".")}else this.addError(e.id,s,"value should be "+t+".")}this.dispatchInputValueUpdate(s.processId,t,e.value)}handleSourceType(e,t,s){const i=document.createElement("br"),n=document.createElement("label");n.setAttribute("class","checkbox inline disabled");const o=document.createElement("input");o.setAttribute("id","processing-input-"+t+"-selection-"+this.occurrence),o.setAttribute("type","checkbox"),o.setAttribute("class","selection"),o.disabled=!0,e.addEventListener("change",(i=>{const o=document.getElementById("processing-input-"+t+"-selection-"+this.occurrence);""===e.value?(o.disabled=!0,n.classList.add("disabled")):(o.disabled=!1,n.classList.remove("disabled"),this.selectionCheckBoxEvent(t,s,e))})),n.addEventListener("click",(i=>{this.selectionCheckBoxEvent(t,s,e)})),n.appendChild(o),n.innerHTML+="Selection",e.parentNode.insertBefore(n,e.nextSibling),e.parentNode.insertBefore(i,e.nextSibling)}selectionCheckBoxEvent(e,t,s){const i=document.getElementById("processing-input-"+e+"-selection-"+this.occurrence);if(i.checked&&!i.disabled){let e=t.data,s=e;s?.startsWith("layer:")&&(s=s.split("?")[0].slice(6));let i=lizMap.config.layers[s];"selectedFeatures"in i&&i.selectedFeatures.length>0?e="layer:"+s+"?select="+encodeURIComponent("$id IN ( "+i.selectedFeatures.join()+" )"):"filteredFeatures"in i&&i.filteredFeatures.length>0?e="layer:"+s+"?select="+encodeURIComponent("$id IN ( "+i.filteredFeatures.join()+" )"):"request_params"in i&&"exp_filter"in i.request_params&&i.request_params.exp_filter&&(e="layer:"+s+"?select="+encodeURIComponent(i.request_params.exp_filter)),t.data=e}else t.data=s.value}fillSelectField(e,t){const s=document.createElement("option");s.innerHTML="",e.appendChild(s);for(var i=0,n=t.length;i<n;i++){const s=t[i];var o=lizMap.config.layers[s];const n=document.createElement("option");n.value=s,n.innerHTML=o.title,e.appendChild(n)}2===e.children.length&&e.removeChild(s)}getLayersList(e,t){let s=[[],[]];if(["vector","source","raster"].includes(e))for(let e in lizMap.config.layers){var i=lizMap.config.layers[e];"layer"===i.type&&(0!==t.length&&-1===t.indexOf(e)||("geometryType"in i?s[0].push(e):s[1].push(e)))}return s}getRestrictedLayers(e,t){let s=[];return"undefined"!=typeof wps_wps_project_config&&t.processId in wps_wps_project_config&&e in wps_wps_project_config[t.processId]&&(s=wps_wps_project_config[t.processId][e],Array.isArray(s)||(s=[])),s}}class a extends o{constructor(e,t,s){super(e,t,s);const i=this.partialPartBuilder(e.replaceAll(":","-"),t);this.selectorCRS=i[0],this.btn=i[1]}partialPartBuilder(e,t){const s=document.createElement("input");s.title=t.title,s.id="processing-input-"+e+"-"+this.occurrence,s.name=e,this.fieldDiv.appendChild(s);const i=t.metadata.find((e=>"processing:type"===e.title))?.href;s.setAttribute("class","qgisType-"+i);const n=document.createElement("select");n.id="processing-input-"+e+"-select-"+this.occurrence,n.setAttribute("class","span1 wps-digitizing extent");const o=document.createElement("option");o.value=lizMap.config.options.qgisProjectProjection.ref,o.label=lizMap.config.options.qgisProjectProjection.ref.split(":")[1],n.appendChild(o);const r=document.createElement("option");r.value=lizMap.config.options.projection.ref,r.label=lizMap.config.options.projection.ref.split(":")[1],n.appendChild(r);const a=document.createElement("button");return a.id="processing-input-"+e+"-btn-"+this.occurrence,a.setAttribute("class","btn btn-mini wps-digitizing wkt "+i),a.innerHTML="Drawing "+i,a.addEventListener("click",(e=>{this.addEventOnButton(a)})),lizMap.mainEventDispatcher.addListener((()=>this.updateDigitizing()),["digitizing.featureDrawn"]),[n,a]}addEventOnButton(e){e.className.includes("extent")?this.addDigitizingExtentHandler(e):e.className.includes("point")&&this.addDigitizingPointHandler(e)}addDigitizingExtentHandler(e){e.className.includes("active")?(lizMap.mainLizmap.digitizing.toolSelected="deactivate",e.classList.remove("active")):(e.classList.remove("active"),lizMap.mainLizmap.digitizing.toolSelected="box",e.classList.add("active"))}addDigitizingPointHandler(e){e.className.includes("active")?(lizMap.mainLizmap.digitizing.toolSelected="deactivate",e.classList.remove("active")):(e.classList.remove("active"),lizMap.mainLizmap.digitizing.toolSelected="point",e.classList.add("active"))}updateDigitizing(){const e=document.querySelector("#processing-input button.wps-digitizing.active");e.className.includes("extent")?this.updateDigitizingExtent(e):e.className.includes("point")&&this.updateDigitizingPoint(e)}updateDigitizingExtent(e){const t=e.previousSibling,s=lizMap.mainLizmap.digitizing.featureDrawn.at(-1);s.set("text",t.title);const i=lizMap.ol.extent.applyTransform(s.getGeometry().getExtent(),lizMap.ol.proj.getTransform(lizMap.ol.proj.get(lizMap.mainLizmap.projection),lizMap.ol.proj.get(t.value)));e.parentElement.firstChild.value=i.join(",")+" ("+t.value+")",e.parentElement.firstChild.dispatchEvent(new Event("blur")),lizMap.mainLizmap.digitizing.featureDrawn.length>1&&lizMap.mainLizmap.digitizing._eraseFeature(lizMap.mainLizmap.digitizing.featureDrawn.at(0))}updateDigitizingPoint(e){const t=e.previousSibling,s=lizMap.mainLizmap.digitizing.featureDrawn.at(-1);s.set("text",t.title),e.parentElement.firstChild.value='{ "geometry": '+(new lizMap.ol.format.GeoJSON).writeGeometry(s.getGeometry(),{featureProjection:lizMap.mainLizmap.projection,dataProjection:t.value})+',  "crs": { "type": "name", "properties": { "name": "'+t.value+'" } } }',e.parentElement.firstChild.dispatchEvent(new Event("blur")),lizMap.mainLizmap.digitizing.featureDrawn.length>1&&lizMap.mainLizmap.digitizing._eraseFeature(lizMap.mainLizmap.digitizing.featureDrawn.at(0))}}class c extends a{constructor(e,t,s){super(e,t,s),this.fieldDiv.firstChild.addEventListener("blur",(s=>{this.checkValues(this.fieldDiv.firstChild,e,t)})),this.fieldDiv.placeholder="left,bottom,right,top (EPSG:4326)";const i=document.createElement("br");this.fieldDiv.insertBefore(i,this.fieldDiv.nextSibling),this.fieldDiv.insertBefore(this.selectorCRS,i.nextSibling),this.fieldDiv.insertBefore(this.btn,this.selectorCRS.nextSibling)}checkValues(e,t,s){let i=/(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *\((EPSG:\d+)\)/gi.exec(e.value);if(void 0===i||6!==i?.length)return this.addError(e.id,s,"value isn't correct."),void this.dispatchInputValueUpdate(s.processId,t,"");this.removeError(e.id);let n=i[5].toUpperCase(),o=[i[1],i[2],i[3],i[4]];"EPSG:4326"===n&&(o=[i[2],i[1],i[4],i[3]]),o={left:o[0],bottom:o[1],right:o[2],top:o[3]},this.dispatchInputValueUpdate(s.processId,t,{boundingBoxData:{projection:n,bounds:o}})}}class l extends a{constructor(e,t,s){super(e,t,s),this.fieldDiv.firstChild.addEventListener("blur",(s=>{this.checkValues(this.fieldDiv.firstChild,e,t)}));const i=document.createElement("br");this.fieldDiv.insertBefore(i,this.fieldDiv.nextSibling),this.fieldDiv.insertBefore(this.selectorCRS,i.nextSibling),this.fieldDiv.insertBefore(this.btn,this.selectorCRS.nextSibling)}checkValues(e,t,s){""===e.value?this.addError(e.id,s,"value is empty."):this.removeError(e.id);const i=e.value?{complexData:{mimeType:"application/vnd.geo+json",encoding:"utf8",schema:"",value:e.value}}:"";this.dispatchInputValueUpdate(s.processId,t,i)}}class d{static GetProcessingForm(e){let t=[];for(const[s,i]of Object.entries(e)){let e=i.minOccurs;do{let n=null;switch(i.typeHint){case"literalData":n=new r(s,i,e),n=n.getInput();break;case"boundingboxData":n=new c(s,i,e),n=n.getInput();break;case"complexData":n=new l(s,i,e),n=n.getInput();break;default:console.error("TypeHint "+i.typeHint+" not supported.")}if(n&&i.minOccurs>0){const e=n.querySelector("label");e.classList.add("jforms-required");const t=document.createElement("span");t.classList.add("jforms-required-star"),t.appendChild(document.createTextNode("* ")),e.appendChild(t)}t.push(n),e-=1}while(e>=1)}return t}}class p{body;constructor(e){let t='{ "inputs": { ';Object.keys(e).forEach((s=>{const i=this.getValueFromInput(e[s]);null===i?t+="ERROR,":"{"!==i[0]?t+='"'+s+'": "'+i+'",':t+='"'+s+'": '+i+","})),t+="}}",t=t.replace(/,}/g,"}"),this.body=t}getBody(){return this.body}getValueFromInput(e){if("literalData"===e.typeHint)return e.data;if("boundingboxData"===e.typeHint)return'{ "bbox" : ['+e.data.boundingBoxData.bounds.left+", "+e.data.boundingBoxData.bounds.bottom+", "+e.data.boundingBoxData.bounds.right+", "+e.data.boundingBoxData.bounds.top+'], "projection": "'+e.data.boundingBoxData.projection+'" }';if("complexData"===e.typeHint){let t=e.data.complexData;const s='{"type": "Feature", '+t.value.slice(1);return JSON.stringify({format:{mediaType:t.mimeType},value:s})}return console.error("No value type found."),null}}class h{constructor(e){this.process=e;const t=document.createElement("div");t.setAttribute("class","form-actions");const s=document.createElement("button");s.innerHTML="Execute",s.setAttribute("id","processing-execute-button"),s.setAttribute("class","btn"),t.appendChild(s),document.getElementById("processing-input").appendChild(t),this.btn=s}async execute(){try{if(this.process.getAllInputsValuesWithMinOccursGreaterThan0().includes("")||document.getElementById("processing-form-errors").children.length>0)throw new Error("Not executed. Missing or incorrect values...");const e=this.process.getInputs();for(let[t,s]of Object.entries(e)){const e=s.metadata.find((e=>"processing:type"===e.title))?.href;"source"===e&&this.handleSourceType(t,s)}const t=new p(e).getBody();return await i.executeProcess(this.process.getId(),t)}catch(e){throw e}}handleSourceType(e,t){let s=t.data,i=s;i.startsWith("layer:")&&(i=i.split("?")[0].slice(6));let n=lizMap.config.layers[i];"filteredFeatures"in n&&n.filteredFeatures.length>0?s="layer:"+i+"?select="+encodeURIComponent("$id IN ( "+n.filteredFeatures.join()+" )"):"request_params"in n&&"exp_filter"in n.request_params&&n.request_params.exp_filter&&(s="layer:"+i+"?select="+encodeURIComponent(n.request_params.exp_filter)),$("#processing-input-"+e.replaceAll(":","_").replaceAll(" ","_")+"-selection").is(":checked")&&"selectedFeatures"in n&&n.selectedFeatures.length>0&&(s="layer:"+i+"?select="+encodeURIComponent("$id IN ( "+n.selectedFeatures.join()+" )")),t.data=s}getBtn(){return this.btn}}class u{constructor(e,t,s,i){this.uuid=window.crypto.randomUUID(),this.close=s?"closable":"",this.html=`\n        <div id="flash-message-${this.uuid}" class="flash-message ${this.close}">\n            <p class="flash-message-text type-${t}">\n                ${e}\n            </p>\n            <div class="timer-bar-holder type-${t}">\n                <div class="timer-bar-scroller type-${t}"></div>\n            </div>\n        </div>\n    `,document.getElementById("message").insertAdjacentHTML("beforeend",this.html),this.element=document.getElementById(`flash-message-${this.uuid}`),s&&this.element.addEventListener("click",(()=>{this.removeElement()}));const n=this.element.querySelector(".timer-bar-scroller");n.style.transition="linear",n.style.transitionDuration=`${i}ms`,setTimeout((()=>{n.style.width="0%"}),50)}getId(){return`flash-message-${this.uuid}`}removeElement(){this.element.style.transition="ease",this.element.style.transitionDuration="500ms",this.element.style.opacity="0%",setTimeout((()=>{this.element.remove()}),500)}}class g{static ERRORS_ARRAY={};static addError(e,t,s){this.ERRORS_ARRAY[e]={title:t.title,text:s},document.getElementById(e).style.border="#ff5f5f solid 2px",document.getElementById(e).style.backgroundColor="#fff3f3",this.updateError()}static removeError(e){delete this.ERRORS_ARRAY[e],document.getElementById(e).style.border="",document.getElementById(e).style.backgroundColor="",this.updateError()}static resetErrors(){this.ERRORS_ARRAY={},this.updateError()}static updateError(){const e=document.getElementById("processing-form-errors");if(e.innerHTML="",Object.keys(this.ERRORS_ARRAY).length<1)return;let t='<div class="alert alert-error">';t+="<ul>",Object.values(this.ERRORS_ARRAY).values().forEach((e=>{t+=`<li>${e.title} input : ${e.text}</li>`})),t+="</ul>",t+="</div>",e.innerHTML=t}}const m=globalThis,f=m.ShadowRoot&&(void 0===m.ShadyCSS||m.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,y=Symbol(),b=new WeakMap;class v{constructor(e,t,s){if(this._$cssResult$=!0,s!==y)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(f&&void 0===e){const s=void 0!==t&&1===t.length;s&&(e=b.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&b.set(t,e))}return e}toString(){return this.cssText}}const w=(e,...t)=>{const s=1===e.length?e[0]:t.reduce(((t,s,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[i+1]),e[0]);return new v(s,e,y)},x=(e,t)=>{if(f)e.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const s of t){const t=document.createElement("style"),i=m.litNonce;void 0!==i&&t.setAttribute("nonce",i),t.textContent=s.cssText,e.appendChild(t)}},E=f?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return(e=>new v("string"==typeof e?e:e+"",void 0,y))(t)})(e):e,{is:_,defineProperty:A,getOwnPropertyDescriptor:S,getOwnPropertyNames:j,getOwnPropertySymbols:M,getPrototypeOf:L}=Object,I=globalThis,D=I.trustedTypes,C=D?D.emptyScript:"",z=I.reactiveElementPolyfillSupport,P=(e,t)=>e,T={toAttribute(e,t){switch(t){case Boolean:e=e?C:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=null!==e;break;case Number:s=null===e?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch(e){s=null}}return s}},O=(e,t)=>!_(e,t),R={attribute:!0,type:String,converter:T,reflect:!1,useDefault:!1,hasChanged:O};Symbol.metadata??=Symbol("metadata"),I.litPropertyMetadata??=new WeakMap;class k extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=R){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(e,s,t);void 0!==i&&A(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){const{get:i,set:n}=S(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const o=i?.call(this);n?.call(this,t),this.requestUpdate(e,o,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??R}static _$Ei(){if(this.hasOwnProperty(P("elementProperties")))return;const e=L(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(P("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(P("properties"))){const e=this.properties,t=[...j(e),...M(e)];for(const s of t)this.createProperty(s,e[s])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,s]of t)this.elementProperties.set(e,s)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const s=this._$Eu(e,t);void 0!==s&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const e of s)t.unshift(E(e))}else void 0!==e&&t.push(E(e));return t}static _$Eu(e,t){const s=t.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return x(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(void 0!==i&&!0===s.reflect){const n=(void 0!==s.converter?.toAttribute?s.converter:T).toAttribute(t,s.type);this._$Em=e,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(e,t){const s=this.constructor,i=s._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=s.getPropertyOptions(i),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:T;this._$Em=i;const o=n.fromAttribute(t,e.type);this[i]=o??this._$Ej?.get(i)??o,this._$Em=null}}requestUpdate(e,t,s){if(void 0!==e){const i=this.constructor,n=this[e];if(s??=i.getPropertyOptions(e),!((s.hasChanged??O)(n,t)||s.useDefault&&s.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(i._$Eu(e,s))))return;this.C(e,t,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:n},o){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),!0!==n||void 0!==o)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,s]of e){const{wrapped:e}=s,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,s,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach((e=>e.hostUpdate?.())),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach((e=>this._$ET(e,this[e]))),this._$EM()}updated(e){}firstUpdated(e){}}k.elementStyles=[],k.shadowRootOptions={mode:"open"},k[P("elementProperties")]=new Map,k[P("finalized")]=new Map,z?.({ReactiveElement:k}),(I.reactiveElementVersions??=[]).push("2.1.1");const U=globalThis,N=U.trustedTypes,B=N?N.createPolicy("lit-html",{createHTML:e=>e}):void 0,H="$lit$",F=`lit$${Math.random().toFixed(9).slice(2)}$`,J="?"+F,q=`<${J}>`,V=document,W=()=>V.createComment(""),G=e=>null===e||"object"!=typeof e&&"function"!=typeof e,Q=Array.isArray,Y="[ \t\n\f\r]",Z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,K=/-->/g,X=/>/g,ee=RegExp(`>|${Y}(?:([^\\s"'>=/]+)(${Y}*=${Y}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),te=/'/g,se=/"/g,ie=/^(?:script|style|textarea|title)$/i,ne=e=>(t,...s)=>({_$litType$:e,strings:t,values:s}),oe=ne(1),re=(ne(2),ne(3),Symbol.for("lit-noChange")),ae=Symbol.for("lit-nothing"),ce=new WeakMap,le=V.createTreeWalker(V,129);function de(e,t){if(!Q(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==B?B.createHTML(t):t}const pe=(e,t)=>{const s=e.length-1,i=[];let n,o=2===t?"<svg>":3===t?"<math>":"",r=Z;for(let t=0;t<s;t++){const s=e[t];let a,c,l=-1,d=0;for(;d<s.length&&(r.lastIndex=d,c=r.exec(s),null!==c);)d=r.lastIndex,r===Z?"!--"===c[1]?r=K:void 0!==c[1]?r=X:void 0!==c[2]?(ie.test(c[2])&&(n=RegExp("</"+c[2],"g")),r=ee):void 0!==c[3]&&(r=ee):r===ee?">"===c[0]?(r=n??Z,l=-1):void 0===c[1]?l=-2:(l=r.lastIndex-c[2].length,a=c[1],r=void 0===c[3]?ee:'"'===c[3]?se:te):r===se||r===te?r=ee:r===K||r===X?r=Z:(r=ee,n=void 0);const p=r===ee&&e[t+1].startsWith("/>")?" ":"";o+=r===Z?s+q:l>=0?(i.push(a),s.slice(0,l)+H+s.slice(l)+F+p):s+F+(-2===l?t:p)}return[de(e,o+(e[s]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]};class he{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let n=0,o=0;const r=e.length-1,a=this.parts,[c,l]=pe(e,t);if(this.el=he.createElement(c,s),le.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=le.nextNode())&&a.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(H)){const t=l[o++],s=i.getAttribute(e).split(F),r=/([.?@])?(.*)/.exec(t);a.push({type:1,index:n,name:r[2],strings:s,ctor:"."===r[1]?ye:"?"===r[1]?be:"@"===r[1]?ve:fe}),i.removeAttribute(e)}else e.startsWith(F)&&(a.push({type:6,index:n}),i.removeAttribute(e));if(ie.test(i.tagName)){const e=i.textContent.split(F),t=e.length-1;if(t>0){i.textContent=N?N.emptyScript:"";for(let s=0;s<t;s++)i.append(e[s],W()),le.nextNode(),a.push({type:2,index:++n});i.append(e[t],W())}}}else if(8===i.nodeType)if(i.data===J)a.push({type:2,index:n});else{let e=-1;for(;-1!==(e=i.data.indexOf(F,e+1));)a.push({type:7,index:n}),e+=F.length-1}n++}}static createElement(e,t){const s=V.createElement("template");return s.innerHTML=e,s}}function ue(e,t,s=e,i){if(t===re)return t;let n=void 0!==i?s._$Co?.[i]:s._$Cl;const o=G(t)?void 0:t._$litDirective$;return n?.constructor!==o&&(n?._$AO?.(!1),void 0===o?n=void 0:(n=new o(e),n._$AT(e,s,i)),void 0!==i?(s._$Co??=[])[i]=n:s._$Cl=n),void 0!==n&&(t=ue(e,n._$AS(e,t.values),n,i)),t}class ge{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??V).importNode(t,!0);le.currentNode=i;let n=le.nextNode(),o=0,r=0,a=s[0];for(;void 0!==a;){if(o===a.index){let t;2===a.type?t=new me(n,n.nextSibling,this,e):1===a.type?t=new a.ctor(n,a.name,a.strings,this,e):6===a.type&&(t=new we(n,this,e)),this._$AV.push(t),a=s[++r]}o!==a?.index&&(n=le.nextNode(),o++)}return le.currentNode=V,i}p(e){let t=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class me{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=ae,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ue(this,e,t),G(e)?e===ae||null==e||""===e?(this._$AH!==ae&&this._$AR(),this._$AH=ae):e!==this._$AH&&e!==re&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>Q(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==ae&&G(this._$AH)?this._$AA.nextSibling.data=e:this.T(V.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,i="number"==typeof s?this._$AC(e):(void 0===s.el&&(s.el=he.createElement(de(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new ge(i,this),s=e.u(this.options);e.p(t),this.T(s),this._$AH=e}}_$AC(e){let t=ce.get(e.strings);return void 0===t&&ce.set(e.strings,t=new he(e)),t}k(e){Q(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,i=0;for(const n of e)i===t.length?t.push(s=new me(this.O(W()),this.O(W()),this,this.options)):s=t[i],s._$AI(n),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class fe{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,n){this.type=1,this._$AH=ae,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=n,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=ae}_$AI(e,t=this,s,i){const n=this.strings;let o=!1;if(void 0===n)e=ue(this,e,t,0),o=!G(e)||e!==this._$AH&&e!==re,o&&(this._$AH=e);else{const i=e;let r,a;for(e=n[0],r=0;r<n.length-1;r++)a=ue(this,i[s+r],t,r),a===re&&(a=this._$AH[r]),o||=!G(a)||a!==this._$AH[r],a===ae?e=ae:e!==ae&&(e+=(a??"")+n[r+1]),this._$AH[r]=a}o&&!i&&this.j(e)}j(e){e===ae?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ye extends fe{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===ae?void 0:e}}class be extends fe{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==ae)}}class ve extends fe{constructor(e,t,s,i,n){super(e,t,s,i,n),this.type=5}_$AI(e,t=this){if((e=ue(this,e,t,0)??ae)===re)return;const s=this._$AH,i=e===ae&&s!==ae||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,n=e!==ae&&(s===ae||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class we{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){ue(this,e)}}const xe=U.litHtmlPolyfillSupport;xe?.(he,me),(U.litHtmlVersions??=[]).push("3.3.1");const Ee=globalThis;class $e extends k{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,s)=>{const i=s?.renderBefore??t;let n=i._$litPart$;if(void 0===n){const e=s?.renderBefore??null;i._$litPart$=n=new me(t.insertBefore(W(),e),e,void 0,s??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return re}}$e._$litElement$=!0,$e.finalized=!0,Ee.litElementHydrateSupport?.({LitElement:$e});const _e=Ee.litElementPolyfillSupport;_e?.({LitElement:$e}),(Ee.litElementVersions??=[]).push("4.2.1");class Ae{static extGroupMapState;static showResults(e,t){let s={text:{},layer:{}};for(let[i,n]of Object.entries(e))if(n.href){this.handleLayerType(i,n.href,n.type,t);const e=this.getQueryParam(n.href,"layers");s.layer[e]="On the map"}else s.text[i]=n;return s}static handleLayerType(e,t,s,i){if("application/x-ogc-wms"!==s)return void console.error(s+" not supported.");let n=window.location.origin+"/index.php/wps/ows?MAP="+this.getQueryParam(t,"MAP");const o=lizMap.map,r=i.split(":").reverse()[0],a=this.getQueryParam(t,"layers"),c=this.getUuidFromLink(t)+"-"+e.replaceAll(":","_").replaceAll(" ","_"),l={version:"1.3.0",layers:a,styles:"",crs:"EPSG:900913"!==o.getProjection()?o.getProjection():"EPSG:3857",format:"image/png",transparent:"true",exceptions:"application/vnd.ogc.se_inimage",dpi:96},d=new lizMap.ol.layer.Image({source:new lizMap.ol.source.ImageWMS({url:n,params:l,ratio:1,serverType:"qgis"}),properties:{wpsLayerName:c,wmsTitle:r+" "+a}});this.extGroupMapState||(this.extGroupMapState=lizMap.mainLizmap.state.rootMapGroup.createExternalGroup("WPS Results")),this.extGroupMapState.addOlLayer(c,d).icon="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtMTEuMTU4IDEuNS0uODAzIDIuMjM0LjAxMi4xMy4zOSAxLjk0LTIuMjYuOTM0LTEuMDk1LTEuNjQ2LS4wODQtLjA5OC0yLjE0OC0xLjAxNC0xLjE5IDEuMTkgMS4wMTQgMi4xNDguMDk4LjA4NCAxLjY0NiAxLjA5Ni0uOTM1IDIuMjU4LTEuOTQtLjM5LS4xMy0uMDEtMi4yMzMuODAydjEuNjg0bDIuMjM0LjgwMy4xMy0uMDEyIDEuOTQtLjM5LjkzNCAyLjI2LTEuNjQ2IDEuMDk1LS4wOTguMDg0LTEuMDE0IDIuMTQ4IDEuMTkgMS4xOSAyLjE0OC0xLjAxNC4wODQtLjA5OCAxLjA5Ni0xLjY0NiAyLjI1OC45MzUtLjM5IDEuOTQtLjAxLjEzLjgwMiAyLjIzM2gxLjY4NGwuODAzLTIuMjM0LS4wMTItLjEzLS4zOS0xLjk0IDIuMjYtLjkzNCAxLjA5NSAxLjY0Ni4wODQuMDk4IDIuMTQ4IDEuMDE0IDEuMTktMS4xOS0xLjAxNC0yLjE0OC0uMDk4LS4wODQtMS42NDYtMS4wOTYuOTM1LTIuMjU4IDEuOTQuMzkuMTMuMDEgMi4yMzMtLjgwMnYtMS42ODRsLTIuMjM0LS44MDMtLjEzLjAxMi0xLjk0LjM5LS45MzQtMi4yNiAxLjY0Ni0xLjA5NS4wOTgtLjA4NCAxLjAxNC0yLjE0OC0xLjE5LTEuMTktMi4xNDggMS4wMTQtLjA4NC4wOTgtMS4wOTYgMS42NDYtMi4yNTgtLjkzNS4zOS0xLjk0LjAxLS4xMy0uODAyLTIuMjMzem0uODQyIDhhMi41IDIuNSAwIDAgMSAyLjUgMi41IDIuNSAyLjUgMCAwIDEgLTIuNSAyLjUgMi41IDIuNSAwIDAgMSAtMi41LTIuNSAyLjUgMi41IDAgMCAxIDIuNS0yLjV6IiBmaWxsPSIjOThiNWQ4IiBzdHJva2U9IiM0NTdhYmUiLz48L3N2Zz4K";let p=t.split("/"),h="";for(let e=3;e<p.length;e++)h+="/"+p[e]}static removeLayer(e){const t=[];if(this.extGroupMapState)for(const s of this.extGroupMapState.getChildren())s.olLayer.get("wpsLayerName").startsWith(e)&&t.push(s.name);for(const e of t)this.extGroupMapState.removeOlLayer(e)}static getQueryParam(e,t){const s=e.indexOf("?");if(-1===s)return;const i=e.substring(s+1).split("&");for(let e=0;e<i.length;e++){const s=i[e].split("=");if(decodeURIComponent(s.shift()).toLowerCase()===t.toLowerCase())return decodeURIComponent(s.join("="))}}static getUuidFromLink(e){return e.split("wps-results:")[1].split("/")[0]}}class Se extends $e{static properties={state:{type:String},progress:{type:String}};constructor(){super()}fillSvg(){switch(this.state){case"accepted":case"running":return oe`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M208 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm0 416a48 48 0 1 1 96 0 48 48 0 1
                        1 -96 0zM48 208a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm368 48a48 48 0 1 1 96 0 48 48 0 1
                        1 -96 0zM75 369.1A48 48 0 1 1 142.9 437 48 48 0 1 1 75 369.1zM75 75A48 48 0 1 1 142.9
                        142.9 48 48 0 1 1 75 75zM437 369.1A48 48 0 1 1 369.1 437 48 48 0 1 1 437 369.1z
                        M369.1 75A48 48 0 1 1 437 142.9 48 48 0 1 1 369.1 75z" fill="#ec9a00"/>
                    </svg>
                `;case"successful":return oe`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4
                        13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5
                        101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z" fill="#067506"/>
                    </svg>
                `;case"failed":return oe`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9
                        393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5
                        12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8
                        0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z" fill="#d00"/>
                    </svg>
                `;case"dismissed":return oe`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9
                        393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5
                        12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8
                        0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z" fill="#454545"/>
                    </svg>
                `;default:return oe`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M64 160c0-53 43-96 96-96s96 43 96 96c0 42.7-27.9 78.9-66.5 91.4-28.4
                        9.2-61.5 35.3-61.5 76.6l0 24c0 17.7 14.3 32 32 32s32-14.3 32-32l0-24c0-1.7 .6-4.1
                        3.5-7.3 3-3.3 7.9-6.5 13.7-8.4 64.3-20.7 110.8-81 110.8-152.3 0-88.4-71.6-160-160-160S0
                        71.6 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm96 352c22.1 0 40-17.9
                        40-40s-17.9-40-40-40-40 17.9-40 40 17.9 40 40 40z" fill="#454545"/>
                    </svg>
                `}}render(){const e=this.getState();let t="";if("running"===e){const e=this.calculateProgress();t=`background: repeating-conic-gradient(#ffa700 0deg ${e}deg, white ${e}deg 360deg);`}return oe`
            <div class="circle ${e}" style="${t}">
                <div class="circle-cache ${e}-cache">
                    ${this.fillSvg()}
                </div>
            </div>
        `}getState(){return["accepted","running","successful","failed","dismissed"].includes(this.state)?this.state:"undefined"}calculateProgress(){return 360*parseInt(this.progress)/100}static styles=w`
        .circle {
            width: 28px;
            height: 28px;
            border-radius: 250px;
            box-shadow: 0 0 5px 0.5px rgb(0 0 0 / 35%);

            display: flex;
            justify-content: center;
            align-items: center;
        }

        .circle-cache {
            width: 18px;
            height: 18px;
            border-radius: 25px;
            background-color: white;

            display: flex;
            justify-content: center;
            align-items: center;
        }

        svg {
            width: 14px;
            height: 14px;
        }

        .running {
            background: white;
        }

        .successful {
            background: #25c125;
        }

        .failed {
            background: red;
        }

        .dismissed {
            background: grey;
        }

        .undefined {
            background: grey;
        }
    `}customElements.define("job-loading-spinner",Se);class je extends $e{static properties={jobArray:{type:Object},jobByProcess:{type:Object},activeProcesses:{type:Array},jobsSelected:{type:Array}};constructor(){super(),this.jobArray={},this.jobByProcess={},this.jobsSelected=[],this.activeProcesses=[],this.activeJobByProcesses={},this.results={}}processesTemplate(e){let t=oe``;for(let s of e){let e,i=oe``;if(this.jobByProcess[s].length<1)continue;for(let e of this.jobByProcess[s])i=oe`
                    ${i}
                    ${this.jobTemplate(e)}
                `;e=this.activeProcesses.includes(s)?oe`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M201.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8
                         12.5-45.3 0L224 173.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"/>
                    </svg>
                    <p>${s}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M201.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8
                         12.5-45.3 0L224 173.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"/>
                    </svg>
                `:oe`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8
                        -12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
                    </svg>
                    <p>${s}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8
                        -12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
                    </svg>
                `;let n=this.activeJobByProcesses[s]?this.activeJobByProcesses[s].length:0;t=oe`
                ${t}
                <div id="duo-proc-nbselected-${s}"
                     class="duo-proc-nbselected">
                    <div id="proc-panel-${s}"
                         class="jobs-info-container-process">
                        <div class="jobs-info-container-process-title"
                             @click=${()=>this.actionOnProcess(s)}>
                            ${e}
                        </div>
                        <div class="job-element-list">
                            ${i}
                        </div>
                    </div>
                    <div id="nbselected-check-${s}"
                         class="nbselected-check">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                             https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                            <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7
                             64-64l0-320c0-35.3-28.7-64-64-64L64 32zM308.4 212.7l-80 128c-4.2 6.7-11.4 10.9-19.3
                             11.3s-15.5-3.2-20.2-9.6l-48-64c-8-10.6-5.8-25.6 4.8-33.6s25.6-5.8 33.6 4.8l27 36
                             61.4-98.3c7-11.2 21.8-14.7 33.1-7.6s14.7 21.8 7.6 33.1z" fill="#717171"/>
                        </svg>
                        <h4 id="nbselected-${s}"
                            class="nbselected">
                            ${n}
                        </h4>
                    </div>
                </div>
            `}return t}jobTemplate(e){const t=this.jobArray[e];return oe`
            <div id="${e}"
                 class="job-element"
                 @click=${e=>this.actionOnJob(e)}>
                <job-loading-spinner state="${t.getStatus()}" progress="${t.getProgress()}"></job-loading-spinner>
                <p>${new Date(t.getTimes().created).toLocaleString()}</p>
            </div>
        `}rightPanelTemplate(){if(this.jobsSelected.length<1)return oe`
                <h3 id="jobs-info-right-panel-title"
                    class="right-panel-title">
                    Select a Job on the left side
                </h3>
            `;{let e=oe``;for(let t of this.jobsSelected){let s=oe``;const i=this.jobArray[t];if(this.results[t])for(let[e,i]of Object.entries(this.results[t]))for(let[t,n]of Object.entries(i))s=oe`
                                ${s}
                                <tr>
                                    <td class="${e}">${e}</td>
                                    <td class="${e}">${t}</td>
                                    <td class="${e}">${"layer"===e?oe`<i>${n}</i>`:n}</td>
                                </tr>
                            `;e=oe`
                    ${e}
                    <div id="jobs-info-holder-${t}"
                         class="jobs-info-holder">
                        <h3 id="jobs-info-right-panel-title-${t}"
                            class="right-panel-title">
                            Job using ${i.getProcessID()}
                        </h3>
                        <p id="jobs-info-uuid-${t}"
                           class="uuid">
                            ${t}
                        </p>
                        <p id="jobs-info-message-${t}"
                           class="message">
                            ${i.getMessage()}
                        </p>
                        <div id="jobs-info-time-${t}"
                             class="time">
                            <div id="jobs-info-time-left-column-${t}"
                                 class="jobs-info-time-column">
                                <p>
                                    <strong>Created : </strong>${new Date(i.getTimes().created).toLocaleString()}
                                </p>
                                <p>
                                    <strong>Expire : </strong>${new Date(i.getTimes().expire).toLocaleString()}
                                </p>
                            </div>
                            <div id="jobs-info-time-right-column-${t}"
                                 class="jobs-info-time-column">
                                <p>
                                    <strong>Updated : </strong>${new Date(i.getTimes().updated).toLocaleString()}
                                </p>
                                <p>
                                    <strong>Finished : </strong>${new Date(i.getTimes().finished).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div class="jobs-info-table-container">
                            <table id="jobs-results-${t}"
                                   class="results">
                                <thead>
                                <td><b>Type</b></td>
                                <td><b>Title</b></td>
                                <td><b>Result</b></td>
                                </thead>
                                <tbody>
                                ${s}
                                </tbody>
                            </table>
                        </div>
                        <div id="jobs-info-logs-${t}"
                             class="logs">
                            <h5 id="jobs-info-logs-title-${t}"
                                class="logs-title">
                                Job logs
                            </h5>
                            <div id="jobs-info-logs-container-${t}"
                                 class="logs-container">
                                <p id="jobs-info-logs-text-${t}"
                                   class="logs-text">
                                    No log for the moment
                                </p>
                            </div>
                        </div>
                    </div>
                `}return e}}render(){return oe`
            <div id="jobs-info-left-panel">
                <h3 id="jobs-info-left-panel-title">All jobs by processes</h3>
                <div id="jobs-info-container-all-processes">
                    ${this.processesTemplate(Object.keys(this.jobByProcess))}
                </div>
            </div>
            <div id="jobs-info-right-panel">
                ${this.rightPanelTemplate()}
            </div>
        `}updated(e){if(e.has("jobsSelected")){for(let[e,t]of Object.entries(this.jobByProcess)){this.activeJobByProcesses[e]=[];for(let s of t)this.jobsSelected.includes(s)&&this.activeJobByProcesses[e].push(s)}this.requestUpdate()}}async updatePanel(e,t){this.jobArray=e,this.jobByProcess=t,this.requestUpdate()}async actionOnProcess(e){const t=this.renderRoot.getElementById("proc-panel-"+e);t.className.includes("active")?(t.classList.remove("active"),this.activeProcesses=this.removeSpecificStringFromArray(this.activeProcesses,e)):(t.classList.add("active"),this.activeProcesses=this.activeProcesses.concat(e))}async actionOnJob(e){const t=e.target.closest(".job-element");t.className.includes("active")?(t.classList.remove("active"),this.jobsSelected=this.removeSpecificStringFromArray(this.jobsSelected,t.id),"successful"===this.jobArray[t.id].getStatus()&&Ae.removeLayer(t.id)):(t.classList.add("active"),this.jobsSelected=this.jobsSelected.concat(t.id),"successful"===this.jobArray[t.id].getStatus()?await this.showResults(this.jobArray[t.id]):delete this.results[t.id]),this.requestUpdate()}async showResults(e){let t={};try{e.areResultsUp()&&(t=await n.getResultOfSpecificJob(e.getJobID()))}catch(e){document.dispatchEvent(new CustomEvent("WPSAddFlashMessage",{detail:{message:e,type:"danger",closable:!0,duration:5e3}})),console.error(e)}this.results[e.getJobID()]=Ae.showResults(t,e.getProcessID())}removeSpecificStringFromArray(e,t){const s=e.indexOf(t),i=e.slice(0,s),n=e.slice(s+1);return i.concat(n)}static styles=w`
        :host {
            width: 100%;
            font-family: "Trebuchet MS", sans-serif;
            position: relative;
            z-index: 0;

            display: flex;
        }

        #jobs-info-left-panel-title, .right-panel-title {
            margin: 5px auto;
            text-align: center;
        }

        /*
         * Left side
         */

        #jobs-info-left-panel {
            flex: 1;
            height: 100%;
            flex-direction: column;
            user-select: none;
            max-width: 50%;

            display: flex;
            overflow: auto;
        }

        #jobs-info-container-all-processes {
            margin: 10px auto;
            flex-direction: column;
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 90%;
            max-width: 95%;
        }

        .duo-proc-nbselected {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }

        .nbselected-check {
            display: flex;
            width: 50px;
            max-width: 100px;
            justify-content: space-between;
        }

        .nbselected-check svg {
            min-width: 20px;
            max-width: 20px;
            width: 20px;
        }

        .nbselected {
            min-width: 35px;
            text-align: center;
            margin-left: 5px;
            color: #00000091;
        }

        .jobs-info-container-process {
            height: fit-content;
            margin: 5px 15px;
            font-size: 14px;
            border-radius: 10px;
            background: white;
            max-width: 100%;
            width: 78%;
        }

        .jobs-info-container-process-title {
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            padding: 0 10px;
            border: #606060 solid 2px;
            border-radius: 10px;
            background: #ffffff;
            z-index: 1;
            position: relative;
        }

        .jobs-info-container-process-title:hover {
            transition: 0.15s linear;
            background: #dcdcdc;
        }

        .jobs-info-container-process-title:active {
            background: #c8c8c8;
        }

        .jobs-info-container-process-title > svg {
            margin: auto 10px;
            height: fit-content;
            width: 16px;
        }

        .job-element-list {
            max-height: 150px;
            overflow: auto;
            background: white;
            border-radius: 10px;
            display: none;
        }

        .jobs-info-container-process.active {
            box-shadow: 0 0 5px 0.5px rgb(67 113 140 / 70%);

            .jobs-info-container-process-title {
                border: #43718c solid 2px;
            }

            .job-element-list {
                display: block;
            }
        }

        .job-element {
            font-size: 14px;
            font-weight: bolder;
            cursor: pointer;
            display: flex;
            justify-content: center;
            margin: 15px 25px;
            border-radius: 12px;
            background: #ffffff;
        }

        .job-element:hover {
            background: #dadada;
        }

        .job-element:active {
            background: #d3d3d3;
        }

        .job-element.active {
            background: #d3d3d3;
        }

        .job-element > job-loading-spinner {
            padding: 0 5px;
            margin: auto 10px;
            height: fit-content;
        }


        /*
         * Right side
         */

        #jobs-info-right-panel {
            flex: 1;
            height: 100%;
            max-width: 50%;
            display: flex;
            flex-direction: column;
            overflow: auto;

            border-left: solid black 2px;
        }

        .jobs-info-holder {
            overflow: auto;
            padding-bottom: 15px;
        }

        #jobs-info-right-panel .jobs-info-holder:not(:first-child) {
            padding-top: 15px;
            border-top: solid black 2px;
        }

        .uuid {
            font-size: 14px;
            text-align: center;
            margin: 5px auto;
        }

        .message {
            font-size: 14px;
            text-align: center;
            margin: 5px auto;
        }

        .time {
            width: 90%;
            height: 100px;
            margin: 10px auto;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .jobs-info-time-column {
            flex: 1;
            font-size: 14px;
        }

        .jobs-info-table-container {
            overflow-x: auto;
            width: 90%;
            max-width: 90%;
            margin: auto;
        }

        table {
            font-size: 15px;
            width: 100%;
        }

        thead td {
            background: #dcdcdc;
        }

        td {
            padding: 8px;
        }

        .layer {
            background: #bdd9ff;
        }

        .text {
            background: #c5eccf;
        }

        .logs {
            width: 90%;
            max-width: 90%;
            margin: 10px auto;
            border: black solid 1px;

            display: flex;
            flex-direction: column;
        }

        .logs-title {
            text-align: center;
            border-bottom: black solid 1px;
            padding: 5px 0;
            margin: 0;
        }

        .logs-container {
            overflow: auto;
            flex-grow: 1;
        }

        .logs-text {
            font-size: 13px;
            line-height: 17px;
            font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
            margin: 0;
            padding: 10px;
            text-wrap: nowrap;
        }
    `}customElements.define("jobs-panel",je),function(){let e,t,s={},o={},r={};function a(){i.setProccesesUrl(lizWpsUrls.wps_ogc_processes),n.setJobUrl(lizWpsUrls.wps_ogc_jobs);const a=document.querySelector("#processing-processes");a.addEventListener("change",(()=>{if(function(){const e=document.getElementById("processing-title"),t=document.getElementById("processing-abstract");e.innerHTML="",t.innerHTML="";let s=document.querySelectorAll("#processing-info-inputs tr:not(:first-child)");s.forEach((e=>e.remove())),s=document.querySelectorAll("#processing-info-outputs tr:not(:first-child)"),s.forEach((e=>e.remove()));const i=document.getElementById("processing-form-errors"),n=document.getElementById("processing-input");i.innerHTML="",n.innerHTML="",lizMap.mainLizmap.digitizing.toolSelected="deactivate"}(),""!==a.value){const i=a.value.replaceAll(":","-");(function(s){const i=document.getElementById("processing-input"),n=d.GetProcessingForm(s.getInputs());let a=!0;g.resetErrors(),i.innerHTML+="<h3>Input:</h3>";for(let e of n){if(!e){document.getElementById("processing-input").innerHTML='<span class="notsupported">Sorry, the WPS builder does not support the selected process.</span>',a=!1;break}i.appendChild(e)}if(a){const i=new h(s);i.getBtn().addEventListener("click",(()=>{i.execute().then((s=>{p("Process executed ! Find it in results pane.","success",!0,3e3),o[s.getJobID()]=s,r[s.getCleanProcessID()].push(s.getJobID()),e.updatePanel(o,r),function(){let e=5;window.clearInterval(t),t=window.setInterval((function(){e<0?(window.clearInterval(t),"none"!==document.getElementById("bottom-dock").style.display?l(-1):t=null):l(e),e-=1}),1e3)}()})).catch((e=>{p(e,"danger",!0,5e3),console.error(e)}))}))}})(s[i]),function(e){const t=document.getElementById("processing-title"),s=document.getElementById("processing-abstract"),i=document.querySelector("#processing-info-inputs > tbody"),n=document.querySelector("#processing-info-outputs > tbody"),o=e.getInputs(),r=e.getOutputs();t.textContent=e.getTitle(),s.textContent=e.getDescription();for(const e of Object.values(o)){let t;for(let s=0;s<e.metadata.length;s++)if("processing:type"===e.metadata[s].title){t=e.metadata[s].href;const i=c(e.schema);t!==i&&(t+=" ("+i+")");break}i.innerHTML+=`\n                <tr>\n                    <td>${e.title}</td>\n                    <td>${t}</td>\n                    <td>${e.minOccurs>0?"&#10003;":""}</td>\n                </tr>`}for(const e of Object.values(r))n.innerHTML+=`\n                <tr>\n                    <td>${e.title}</td>\n                    <td>${c(e.schema)}</td>\n                </tr>`}(s[i])}})),i.getAllProcesses().then((n=>{n.forEach((async e=>{let t=document.createElement("option");t.setAttribute("value",e.getId()),t.textContent=e.getTitle(),a.appendChild(t);const n=e.getCleanId();try{s[n]=await i.getSpecificProcess(e.getId()),r[n]=[]}catch(e){p(e,"danger",!0,5e3),console.error(e)}})),e=document.querySelector("jobs-panel"),lizMap.events.on({bottomdockopened:function(e){"processing-results"===e.id&&(t||l(-1))},bottomdockclosed:function(e){"processing-results"===e.id&&(window.clearInterval(t),t=null)}})})).catch((e=>{p(e,"danger",!0,5e3),console.error(e)}))}function c(e){if(e.type)return e.type;if(e.oneOf){let t=e.oneOf[0].type;for(let s=1;s<e.oneOf.length;s++)if(e.oneOf[s].type!==t)return"mixed";return t}return""}function l(s){n.getAllJobs().then((t=>{for(let[e,s]of Object.entries(t)){o[e]=s;const t=s.getCleanProcessID();r[t].includes(s.getJobID())||r[t].push(s.getJobID())}e.updatePanel(o,r)})).catch((e=>{p(e,"danger",!0,5e3),console.error(e)})),s<0&&(window.clearInterval(t),t=window.setInterval((function(){l(1)}),1e4))}function p(e,t,s,i){const n=new u(e,t,s,i);void 0!==i&&setTimeout((function(){n.removeElement()}),i)}lizMap.events.on({uicreated:function(e){const t=document.querySelector("#processing-processes"),i=document.querySelector("#processing-results");null!==t&&null!==i&&(a(),t.length&&($("#button-processing span.icon").css("background-image","none").html('<i class="icon-cog icon-white" style="margin-left: 4px;"></i>'),$("#button-processing-results span.icon").css("background-image","none").html('<i class="icon-eye-open icon-white" style="margin-left: 4px;"></i>')),document.addEventListener("WPSInputValueChanged",(function(e){const{processId:t,inputId:i,newInputValue:n}=e.detail;s[t].setInputValue(i,n)})),document.addEventListener("WPSAddFlashMessage",(function(e){const{message:t,type:s,closable:i,duration:n}=e.detail;p(t,s,i,n)})),document.addEventListener("WPSAddError",(function(e){const{id:t,input:s,text:i}=e.detail;g.addError(t,s,i)})),document.addEventListener("WPSRemoveError",(function(e){const{id:t}=e.detail;g.removeError(t)})))}})}()})();