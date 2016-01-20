//initialize dojo
dojo.require("dojo.io.*");
dojo.require("dojo.lang.*");
dojo.require("dojo.event.*");
dojo.require("dojo.html.*");
dojo.require("dojo.dnd.*");
dojo.require("dojo.json");
dojo.require("dojo.widget.Tooltip");
dojo.require("dojo.Deferred");

var drags;
var dropTgts;
var FieldMapDivs = new Array();



/*
	schemaMaps object is a array of mappings constructed in the following way
	
	{
		maps: [
				{
					oldSchema: schemaObj
					newSchema: schemaObj,
					eleMaps: []
				},
				{
					oldSchema: schemaObj,
					newSchema: schemaObj,
					eleMaps: [
						{
							oldEleName: str,
							newEleName: str
						},
						...
					]						
				},					
				...
			],
		-- function --
	}
	
	
	schemaObj structure
	{
		name: str,
		fileName: str
	}
	
	
	It is used to store the mapping on client side temporarily before saving to XML format through
	AJAX call
*/

var dragMan = new dojo.dnd.HtmlDragManager();

//external array for easy tracking of dragSources
var dragSourcesArray = new Array();

var schemaMaps = {
	maps: [],

	tip: null,

	showTip: function (e, node) {

		if (this.tip == null) {
			this.tip = dojo.widget.byId("tooltip");
			this.tip.showDelay = 100;
			this.tip.hideDelay = 100;

		}

		this.tip.close();

		this.tip.domNode.firstChild.innerHTML = node.getAttribute("fileName");

		this.tip._connectNode = node;

		this.tip.onMouseOver(e);
	},

	deleteSchema: function (filePath, nodeID, tip) {

		var yes = confirm("Are you sure you want to remove this schema file?")

		if (yes) {
			var self = this;
			dojo.io.bind({
				url: "deleteFile.asp",
				mimetype: "text/json",
				method: "POST",
				preventCache: true,
				content: {
					filePath: filePath
				},
				load: function (type, data, xhr) {
					if (data == false)
						self.addEntry("Invalid JSON Response from " + this.url);
					else if (data.error != "") {
						self.addEntry(data.error)
					}
					else {
						//hide the tooltip
						tip.hide();

						//remove the Node
						var node = dojo.byId(nodeID);

						node.parentNode.removeChild(node);
					}
				},
				error: function (type, error) {
					this.addEntry(error.message);
					node.parentNode.removeChild(node);
				}
			});
		}
	},

	checkMappingStatus: {
		OK: 1,
		MissingSchema: 2,
		SchemaWithoutEleMap: 3
	},

	checkMapping: function () {
		if (this.maps.length < dropTgts.length) {
			return this.checkMappingStatus.MissingSchema;
		}
		else {
			for (var i = 0; i < this.maps.length; i++) {
				if (this.maps[i].eleMaps.length == 0) {
					return this.checkMappingStatus.SchemaWithoutEleMap;
				}
			}
		}

		return this.checkMappingStatus.OK;
	},

	addSetSchemaMapping: function (origSchemaName, targetSchemaName, origSchemaFile, targetSchemaFile) {
		var index = this.lookUpSchemaMapping(origSchemaName);

		if (index != -1) {
			this.maps[index].newSchema = {
				name: targetSchemaName,
				fileName: targetSchemaFile
			};
			this.maps[index].eleMaps = new Array();
		}
		else {
			var mapObj = {
				oldSchema: {
					name: origSchemaName,
					fileName: origSchemaFile
				},
				newSchema: {
					name: targetSchemaName,
					fileName: targetSchemaFile
				},
				eleMaps: []
			};
			this.maps.push(mapObj);
		}
	},

	clearSchemaMapping: function () {
		this.maps = new Array();
	},

	removeSchemaMapping: function (origSchemaName) {
		var index = this.lookUpSchemaMapping(origSchemaName);

		if (index != -1) {
			this.maps.splice(index, 1);
		}
	},

	removeSchemaFieldsMapping: function (origSchemaName) {
		var index = this.lookUpSchemaMapping(origSchemaName);

		if (index != -1) {
			this.maps[index].eleMaps = new Array();
		}

	},

	lookUpSchemaMapping: function (origSchemaName) {
		var index = -1;

		for (var i = 0; i < this.maps.length; i++) {
			if (this.maps[i].oldSchema.name + "" == origSchemaName) {
				index = i;
				break;
			}
		}

		return index;
	},

	// this function will look up a specific field in a specific schema
	// and return a JSON object of index in the format of:
	/*
			{
				schemaIndex: int,
				fieldIndex: int
			};
	*/
	lookUpSchemaMappingEle: function (origSchemaName, origFieldName) {
		var index = {
			schemaIndex: -1,
			fieldIndex: -1
		};

		for (var i = 0; i < this.maps.length; i++) {
			if (this.maps[i].oldSchema.name + "" == origSchemaName) {
				index.schemaIndex = i;

				if (this.maps[i].eleMaps.length == 0) {
					break;
				}
				else {
					for (var j = 0; j < this.maps[i].eleMaps.length; j++) {
						if (this.maps[i].eleMaps[j].oldEleName == origFieldName) {
							index.fieldIndex = j;
							break;
						}
					}
				}
			}
		}

		return index;
	},

	//this function either add or set the mapping for certain original schema fields
	addSetSchemaMappingEle: function (origSchemaName, origFieldName, newFieldName, notSameType) {

		var index = this.lookUpSchemaMappingEle(decodeURIComponent(origSchemaName), decodeURIComponent(origFieldName));

		if (index.fieldIndex != -1) {
			this.maps[index.schemaIndex].eleMaps[index.fieldIndex].newEleName = newFieldName;
		}
		else {
			var eleMapObj = {
				oldEleName: origFieldName,
				newEleName: newFieldName,
				notSameType: !!notSameType
			};
			this.maps[index.schemaIndex].eleMaps.push(eleMapObj);
		}
	},

	removeSchemaMappingEle: function (origSchemaName, origFieldName) {

		var index = this.lookUpSchemaMappingEle(origSchemaName, origFieldName);

		if ((index.schemaIndex != -1) && (index.fieldIndex != -1)) {
			this.maps[index.schemaIndex].eleMaps.splice(index.fieldIndex, 1);
		}
	}

};





dojo.lang.extend(dojo.dnd.HtmlDragObject, {

	//overriding the createDragNode method from DOJO
	createDragNode: function () {
		var node = this.domNode.cloneNode(true);
		if (this.dragClass) { dojo.html.addClass(node, this.dragClass); }
		if (this.opacity < 1) { dojo.html.setOpacity(node, this.opacity); }

		node.style.zIndex = 999;
		return node;
	},


	onDragEnd: function (e) {
		switch (e.dragStatus) {

			case "dropSuccess":
				dojo.html.removeNode(this.dragClone);
				this.dragClone = null;
				//hide the dragable
				if (this.dragClass == "schemaEntryGhost")
					dojo.html.removeNode(this.domNode);
				else if (this.domNode.className != "schemaEntry")
					this.domNode.style.display = "none";
				break;

			case "dropFailure": // slide back to the start				

				//slide to the original place 
				var startCoords = dojo.html.getAbsolutePosition(this.dragClone, true);
				// offset the end so the effect can be seen
				var endCoords = {
					left: this.dragStartPosition.x + 1,
					top: this.dragStartPosition.y + 1
				};

				// animate
				var anim = dojo.lfx.slideTo(this.dragClone, endCoords, 500, dojo.lfx.easeOut);
				var dragObject = this;
				dojo.event.connect(anim, "onEnd", function (e) {
					// pause for a second (not literally) and disappear
					dojo.lang.setTimeout(function () {
						dojo.html.removeNode(dragObject.dragClone);
						// Allow drag clone to be gc'ed
						dragObject.dragClone = null;
					},
						200);
				});
				anim.play();
				this.domNode.style.display = "block";

				break;
		}

		dojo.event.topic.publish('dragEnd', { source: this });
	}


});

dojo.lang.extend(dojo.dnd.HtmlDropTarget, {
	lastDragClone: null,
	lastDragObject: null,
	emptyBorder: "dotted gray 1px",
	overBorder: "dotted blue 1px",
	occupiedBorder: "solid blue 1px",
	configuredBorder: "solid #2364ef 2px",



	femptyBorder: "dotted gray 1px",
	foverBorder: "dotted #990000 1px",
	foccupiedBorder: "solid #990000 1px",
	fdiffoverBorder: "dotted #9900ff 1px",
	fdiffoccupiedBorder: "solid #9900ff 1px",

	mappingButton: null,



	onDragOver: function (e) {
		if (!this.accepts(e.dragObjects)) { return false; }

		if (this.domNode.className == "schemaEntryTargetLink") {
			this.domNode.style.border = this.overBorder;
		}
		else if (this.domNode.className == "fieldEntryTargetLink") {
			//if the icons don't match, don't highlight border, and prevent drop
			var origFieldIcon = this.getIcon(this.domNode);
			var newFieldIcon = this.getIcon(e.dragObjects[0].domNode);

			var origFieldName = this.domNode.getAttribute("fieldName") + "";
			var newFieldName = e.dragObjects[0].domNode.getAttribute("fieldName") + "";

			if (origFieldIcon != newFieldIcon) {
				if ((origFieldName.substr(0, 6) == "xpower") ||
					(newFieldName.substr(0, 6) == "xpower")) {
					//don't allow cross mapping to or from any xpower elements
					return false;
				}
				else {
					//allow cross mapping on attributes and text element,
					//but show different border
					//that include dhtml original element

					this.domNode.style.border = this.fdiffoverBorder;
				}
			}
			else {
				this.domNode.style.border = this.foverBorder;
			}
		}

		return true;
	},

	onDragMove: function (e, dragObjects) {
	},

	onDragOut: function (e) {

		if (this.domNode.className == "schemaEntryTargetLink") {
			var index = this.domNode.id;
			index = index.split("_")[1];

			this.mappingButton = dojo.byId("eleMapButton_" + index);

			if (this.mappingButton.style.display == "none")
				this.domNode.style.border = this.emptyBorder;
			else
				this.domNode.style.border = this.occupiedBorder;

			if (this.lastDragClone != null)
				dojo.html.removeNode(this.dragClone)
		}
		else if (this.domNode.className == "fieldEntryTargetLink") {
			var index = this.domNode.id;
			index = index.split("_")[1];

			if (this.domNode.lastChild.className != "fieldEntry")
				this.domNode.style.border = this.femptyBorder;
			else
				this.domNode.style.border = this.foccupiedBorder;

			if (this.lastDragClone != null)
				dojo.html.removeNode(this.dragClone)
		}

	},

	onDrop: function (e) {

		if (this.domNode.className == "schemaEntryTargetLink") {
			//establishing a mapping,
			var index = this.domNode.id;
			var ids = index.split("_");
			var index = ids[ids.length - 1];

			this.mappingButton = dojo.byId("eleMapButton_" + index);

			var dragSource = e.dragObject.dragSource;
			var sourceNode = dragSource.domNode;

			//if moved from another occupation, remove the last child and mapping first
			if (sourceNode.parentNode.className == "schemaEntryTargetLink") {

				this.removeSchemaMapping(e);
			}

			//if the link is already occupied, pop the last linked target schema back first
			if (this.mappingButton.style.display != "none") {
				var lastDragClones = dojo.html.getElementsByClass("schemaEntry", this.domNode);

				dojo.lang.forEach(lastDragClones, function (lastDragClone) {
					if (lastDragClone) {

						for (var i = 0; i < drags.length; i++) {
							if (drags[i].getAttribute("schemaName") == lastDragClone.getAttribute("schemaName")) {
								this._slideBack(lastDragClone, drags[i], true);
							}
						}
					}
				}, this);
			}

			//link to the newly dropped schema
			this.lastDragObject = e.dragObject;
			this.lastDragClone = this.lastDragObject.domNode.cloneNode(true);
			this.lastDragClone.style.clear = "none";

			//enable mapping button
			this.mappingButton.style.display = "block";
			this.mappingButton.className = "smallbuttonD";


			this.domNode.insertBefore(this.lastDragClone, this.mappingButton);
			this.domNode.style.border = this.occupiedBorder;

			//turn the internally placed drag-over object as drag source
			var ghost = new dojo.dnd.HtmlDragSource(this.lastDragClone, "schemaEntryGhost");

			//update the mapping JSON object
			schemaMaps.addSetSchemaMapping(this.domNode.getAttribute("schemaName"),
				this.lastDragClone.getAttribute("schemaName"),
				this.domNode.getAttribute("fileName") + "",
				this.lastDragClone.getAttribute("fileName") + "");

			//show the element mapping			
			popEles("eleMap_" + index, dojo.html.getMarginBox(this.domNode).width);
		}
		else if (this.domNode.className == "fieldEntryTargetLink") {

			//establishing a mapping between fields,
			var index = this.domNode.id;
			index = index.split("_")[1];

			var dragSource = e.dragObject.dragSource;
			var sourceNode = dragSource.domNode;

			var crossMap = false;

			//if moved from another occupation, remove the last child and mapping first
			if (sourceNode.parentNode.className == "fieldEntryTargetLink") {

				//unregister drag source first				
				dragMan.unregisterDragSource(dragSource);

				//remove the mapping			
				schemaMaps.removeSchemaMappingEle(sourceNode.parentNode.getAttribute("origSchema") + "",
						sourceNode.parentNode.getAttribute("fieldName"));

				//reset the parent border style
				sourceNode.parentNode.style.border = this.femptyBorder;

				//remove the drag source node
				sourceNode.parentNode.removeChild(sourceNode);

				crossMap = true;
			}

			if (this.domNode.lastChild.className == "fieldEntry") {
				if (this.lastDragObject != null) {
					this._slideBack(this.lastDragClone, this.lastDragObject.domNode);
				}
				else {
					var div = this.domNode.parentNode.parentNode.parentNode;
					var fdrags = dojo.html.getElementsByClass("fieldEntry", div);
					//pre-linked case, has to locate the last child manually
					var lastDragClone = this.domNode.lastChild;
					var lastDragObjectDomNode;

					for (var i = 0; i < fdrags.length; i++) {
						if (fdrags[i].childNodes[0].innerHTML == lastDragClone.childNodes[0].innerHTML) {
							lastDragObjectDomNode = fdrags[i];
							break;
						}
					}

					this._slideBack(lastDragClone, lastDragObjectDomNode);

				}
			}

			//link to the newly dropped schema
			if (crossMap) {
				this.lastDragClone = e.dragObject.domNode.cloneNode(true);
				this.domNode.appendChild(this.lastDragClone);
			}
			else {
				this.lastDragObject = e.dragObject;
				this.lastDragClone = this.lastDragObject.domNode.cloneNode(true);
				this.lastDragClone.style.clear = "none";

				this.domNode.appendChild(this.lastDragClone);
			}


			//if the map is cross map show differnt color border

			var notSameType = false;

			if (this.domNode.style.borderColor == "#990000")
				this.domNode.style.border = this.foccupiedBorder;
			else {
				this.domNode.style.border = this.fdiffoccupiedBorder;
				notSameType = true;
			}

			//turn the internally placed drag-over object as drag source
			new dojo.dnd.HtmlDragSource(this.lastDragClone, "fieldEntryGhost");

			//update the mapping JSON object
			schemaMaps.addSetSchemaMappingEle(this.domNode.getAttribute("origSchema"),
					this.domNode.getAttribute("fieldName"),
					this.lastDragClone.getAttribute("fieldName"),
					notSameType
				);

		}
		else if (this.domNode.id == "tgtSchemas") {
			//breaking up an mapping		


			//restore the display on original
			//they will have to be manual look up, because the old draging object information was lost
			for (var i = 0; i < drags.length; i++) {
				if (drags[i].childNodes[0].innerHTML == e.dragObject.domNode.childNodes[0].innerHTML) {
					drags[i].style.display = "block";
					break;
				}
			}

			this.removeSchemaMapping(e);

		}
		else if (this.domNode.className == "tgtEles") {

			//breaking up an mapping

			var fdrags = dojo.html.getElementsByClass("fieldEntry", this.domNode);
			//restore the display on original
			//they will have to be manual look up, because the old draging object information was lost
			for (var i = 0; i < fdrags.length; i++) {
				if (fdrags[i].childNodes[0].innerHTML == e.dragObject.domNode.childNodes[0].innerHTML) {
					fdrags[i].style.display = "block";
					break;
				}
			}

			//restore the link container border
			e.dragObject.domNode.parentNode.style.border = this.femptyBorder;
			var index = e.dragObject.domNode.parentNode.id;
			index = index.split("_")[1];

			this.lastDragClone = null;
			this.lastDragObject = null;



			//remove the mapping			
			schemaMaps.removeSchemaMappingEle(e.dragObject.domNode.parentNode.getAttribute("origSchema"),
					e.dragObject.domNode.parentNode.getAttribute("fieldName"));


			//remove the dragObject
			dojo.html.removeNode(e.dragObject.domNode);
		}


		return true;
	},

	removeSchemaMapping: function (e) {
		//restore the link container border
		e.dragObject.domNode.parentNode.style.border = this.emptyBorder;
		var index = e.dragObject.domNode.parentNode.id;
		index = index.split("_")[1];

		var mappingButton = dojo.byId("eleMapButton_" + index);

		mappingButton.style.display = "none";

		var mappingDiv = dojo.byId("eleMap_" + index);

		//unregister dragSources and dropTragets
		unregisterDnd(mappingDiv);

		mappingDiv.style.display = "none";

		this.lastDragClone = null;
		this.lastDragObject = null;


		//remove the mapping			
		schemaMaps.removeSchemaMapping(e.dragObject.domNode.parentNode.childNodes[0].childNodes[0].innerHTML);


		//remove the dragObject
		dojo.html.removeNode(e.dragObject.domNode);
	},

	getIcon: function (node) {
		var iconNode = dojo.html.getElementsByClass("fieldIcon", node)[0];

		return iconNode.getAttribute("src");
	},

	_slideBack: function (dragClone, dragObjectDomNode, dontAnimate) {
		function showHide() {
			dojo.html.removeNode(dragClone);
			dragObjectDomNode.style.visibility = "visible";
		}

		if (!dontAnimate) {
			var startCoords = dojo.html.getAbsolutePosition(dragClone, true);
			dragObjectDomNode.style.display = "block";
			dragObjectDomNode.style.visibility = "hidden";

			var endCoords = dojo.html.getAbsolutePosition(dragObjectDomNode, true);

			// animate
			var anim = dojo.lfx.slideTo(dragClone, endCoords, 500, dojo.lfx.easeOut);
			dojo.event.connect(anim, "onEnd", function (e) {
				// pause for a second (not literally) and disappear
				dojo.lang.setTimeout(dojo.lang.hitch(this, function () { showHide(); }), 200);
			});

			anim.play();
		}
		else {
			showHide();
		}
	}
});

/**
 * Fix the box size for cross-browser consistency
 */
function fixBoxes() {
	//fix the big container
	var bodyWidth = document.body.offsetWidth;
	var container = dojo.byId("container");

	dojo.html.setMarginBox(container, { width: bodyWidth - 2 })


	//fix the target links
	var linkBoxes = dojo.html.getElementsByClass("schemaEntryTargetLink");
	var linkContainerSize = dojo.html.getContentBox(dojo.byId("origSchemas"));

	for (var i = 0; i < linkBoxes.length; i++) {
		dojo.html.setMarginBox(linkBoxes[i], {
			width: linkContainerSize.width - 22
		});


		var fieldMappingContainer = linkBoxes[i].nextSibling;

		if (fieldMappingContainer.style.display != "none") {
			dojo.html.setMarginBox(fieldMappingContainer, {
				width: linkContainerSize.width - 22
			});

			var origSchemaName = fieldMappingContainer.getAttribute("origschema");
			fixFieldMappingSizes(fieldMappingContainer, origSchemaName);
		}
	}



	//fix the source entries
	var srcEntries = dojo.html.getElementsByClass("schemaEntry", dojo.byId("tgtSchemas"));

	for (var i = 0; i < srcEntries.length; i++) {
		dojo.html.setMarginBox(srcEntries[i], {
			width: 148
		});
	}
}

function initDnD() {

	drags = dojo.html.getElementsByClass("schemaEntry");
	dropTgts = dojo.html.getElementsByClass("schemaEntryTargetLink");

	//initialize dragables
	for (var i = 0; i < drags.length; i++) {
		if (drags[i].getAttribute("ghost") == "true")
			new dojo.dnd.HtmlDragSource(drags[i], "schemaEntryGhost");
		else
			new dojo.dnd.HtmlDragSource(drags[i], "schemaEntry");
	}

	//initialize drop targets
	for (var i = 0; i < dropTgts.length; i++) {
		var drop = new dojo.dnd.HtmlDropTarget(dropTgts[i], ["schemaEntry", "schemaEntryGhost"]);
	}

	//add the container of target schemas as drop target for disconnecting schema mappings
	new dojo.dnd.HtmlDropTarget("tgtSchemas", ["schemaEntryGhost"]);

	//pre-populate the mapping if there are premaps
	schemaMaps.maps = preMaps;

	//set mapping status to opener upon loading, so if all mapping already defined, save button pressing is not needed.
	if (window.opener) {
		window.opener.onSchemaMapClose(schemaMaps.checkMapping());
	}
}


function showEleMapping(divID, buttonID) {
	var div = dojo.byId(divID);
	var button = dojo.byId(buttonID);

	if (div.style.display == "block") {
		button.className = "smallbuttonR";
		div.style.display = "none";
	}
	else {
		button.className = "smallbuttonD";
		if (div.innerHTML == "") {
			//initial, pop content

			popEles(divID, dojo.html.getMarginBox(div.previousSibling).width);
		}
		else {
			showOne(div);
		}
	}
}

function showOne(div) {

	var eleMaps = dojo.html.getElementsByClass("schemaEntryEleMap");
	for (var i = 0; i < eleMaps.length; i++) {
		//toggle button in the same time
		var id = eleMaps[i].id;

		id = id.split("_");
		id = id[id.length - 1];

		var buttonID = "eleMapButton_" + id;



		if (eleMaps[i].id != div.id) {
			eleMaps[i].style.display = "none";
			dojo.byId(buttonID).className = "smallbuttonR";
		}
		else {
			eleMaps[i].style.display = "block";
			dojo.html.setMarginBox(eleMaps[i], {
				width: dojo.html.getMarginBox(eleMaps[i].previousSibling).width
			});
		}
	}
}

function popEles(divID, newWidth) {
	var div = dojo.byId(divID);

	dojo.html.setMarginBox(div, { width: newWidth });

	showOne(div);
	unregisterDnd(div);

	var loaderGif = dojo.byId("loaderGifImg").src;

	div.innerHTML = "Loading...<img src=\"" + loaderGif + "\">";

	var origSchemaName = div.getAttribute("origSchema");

	var index = schemaMaps.lookUpSchemaMapping(origSchemaName);

	var newSchemaFile = "";
	var origSchemaFile = "";

	var fieldPreMap = "[]";

	if (index != -1) {
		newSchemaFile = schemaMaps.maps[index].newSchema.fileName;
		origSchemaFile = schemaMaps.maps[index].oldSchema.fileName;

		if (schemaMaps.maps[index].eleMaps.length > 0)
			fieldPreMap = dojo.json.serialize(schemaMaps.maps[index].eleMaps);
		else
			fieldPreMap = "[]";
	}

	var packagePath = dojo.byId("packagePath").value;

	var d = new dojo.Deferred();

	//ajax call to retrieve list of fields for both old schema and new schema
	dojo.io.bind({
		url: "SchemaFieldMapping",
		mimetype: "text/html",
		method: "POST",
		content: {
			oSchema: origSchemaFile,
			nSchemaId: newSchemaFile,
			oSchemaName: origSchemaName,
			packagePath: packagePath,
			fieldPreMap: fieldPreMap,
			divID: divID
		},
		preventCache: true,
		load: function (type, data, xhr) {
			dndForFields(type, data, xhr, div, origSchemaName);
			d.callback({
				container: div,
				data: data,
				origSchemaName: origSchemaName
			});
		},
		error: function (type, error) {
			if (request) {

				var resp = eval("(" + request.responseText + ")");
				alert(resp.message);
			}
			else {
				alert(error.message);
			}
			d.errback(error);
		}
	});

	return d;
}

function fixFieldMappingSizes(div, origSchemaName) {
	var container = dojo.html.getElementsByClass("fieldMappingContainer", div)[0];

	var width = dojo.html.getMarginBox(div).width;

	dojo.html.setMarginBox(container, { width: width - 36 });

	var tgtContainer = dojo.byId("tgtEles_" + encodeURIComponent(origSchemaName));
	var origContainer = dojo.byId("origEles_" + encodeURIComponent(origSchemaName));

	var leftSize = width - 142 - 80;

	dojo.html.setMarginBox(origContainer, { width: leftSize });

	//set sizes for fieldEntryLinks
	var fieldEntryLinks = dojo.html.getElementsByClass("fieldEntryTargetLink");

	for (var i = 0; i < fieldEntryLinks.length; i++) {
		dojo.html.setMarginBox(fieldEntryLinks[i], {
			width: leftSize - 22
		});
	}
}

//this function inplement the drag and drop for fields
function dndForFields(type, data, xhr, div, origSchemaName) {
	div.innerHTML = data;
	//adjust sizes first
	fixFieldMappingSizes(div, origSchemaName);

	var fdrags = dojo.html.getElementsByClass("fieldEntry", div);
	var fdropTgts = dojo.html.getElementsByClass("fieldEntryTargetLink", div);

	//initialize dragables
	for (var i = 0; i < fdrags.length; i++) {
		if (fdrags[i].getAttribute("ghost") == "true") {
			new dojo.dnd.HtmlDragSource(fdrags[i], "fieldEntryGhost");
		}
		else
			dragSourcesArray.push(new dojo.dnd.HtmlDragSource(fdrags[i], "fieldEntry" + div.id));

	}

	//initialize drop targets
	for (var i = 0; i < fdropTgts.length; i++) {
		var drop = new dojo.dnd.HtmlDropTarget(fdropTgts[i], ["fieldEntry" + div.id, "fieldEntryGhost"]);
	}

	var tgtContainer = dojo.byId("tgtEles_" + escape(origSchemaName));
	//add the container of target schemas as drop target for disconnecting schema mappings
	new dojo.dnd.HtmlDropTarget(tgtContainer, ["fieldEntryGhost"]);

}

function mapSameNameFields(divID, origSchemaName) {
	//clear off the fields mapping for this schema first
	schemaMaps.removeSchemaFieldsMapping(origSchemaName);

	var div = dojo.byId(divID);

	var fdrags = dojo.html.getElementsByClass("fieldEntry", div);
	var fdropTgts = dojo.html.getElementsByClass("fieldEntryTargetLink", div);

	for (var i = 0; i < fdrags.length; i++) {
		//restore visual first
		fdrags[i].style.display = "block";
	}

	for (var j = 0; j < fdropTgts.length; j++) {
		//remove existing mapping first
		if (fdropTgts[j].lastChild.className == "fieldEntry") {
			fdropTgts[j].removeChild(fdropTgts[j].lastChild);
			fdropTgts[j].style.border = "dotted gray 1px";
		}

		for (var i = 0; i < fdrags.length; i++) {
			if (fdrags[i].parentNode) {
				if ((fdrags[i].parentNode.className != "fieldEntryTargetLink") &&
					(fdrags[i].getAttribute("fieldName") ==
						fdropTgts[j].getAttribute("fieldName"))) {
					mapSameNameField(fdrags[i], fdropTgts[j]);
				}
			}
		}
	}
}

function mapSameNameSchemas() {

	if (!clearSchemaMapping())
		return false;

	var fieldMapContainers = dojo.html.getElementsByClass("schemaEntryEleMap");

	var dHub = new dojo.Deferred();

	dojo.byId("buttons").style.display = "none";

	dojo.lang.forEach(fieldMapContainers, function (fieldMapContainer) {
		dHub.addCallback(dojo.lang.hitch(window, function () {

			//get drop target
			var index = fieldMapContainer.id;
			var ids = index.split("_");
			var index = ids[ids.length - 1];
			var dropTagDomNode = dojo.byId("link_" + index);

			//first need to locate the matching name target, if doesn't exist, skip it
			var origSchemaName = dropTagDomNode.getAttribute("schemaName");

			var tgtSchemaNode;

			var drags = dojo.html.getElementsByClass("schemaEntry");
			for (var i = 0; i < drags.length; i++) {
				var dragNode = drags[i];
				var tgtSchemaName = dragNode.getAttribute("schemaName");

				if (tgtSchemaName == origSchemaName) {
					tgtSchemaNode = dragNode;
					break;
				}
			}

			var d;

			if (!tgtSchemaNode) {
				d = new dojo.Deferred();
				d.callback({});
			}
			else {

				var mappingButton = dojo.byId("eleMapButton_" + index);

				//enable mapping button
				mappingButton.style.display = "block";
				mappingButton.className = "smallbuttonD";

				var tgtSchemaNodeClone = tgtSchemaNode.cloneNode(true);

				dropTagDomNode.insertBefore(tgtSchemaNodeClone, mappingButton);
				dropTagDomNode.style.border = dojo.dnd.HtmlDropTarget.prototype.occupiedBorder;

				//turn the internally placed drag-over object as drag source
				var ghost = new dojo.dnd.HtmlDragSource(tgtSchemaNodeClone, "schemaEntryGhost");

				//update the mapping JSON object
				schemaMaps.addSetSchemaMapping(dropTagDomNode.getAttribute("schemaName"),
					tgtSchemaNodeClone.getAttribute("schemaName"), dropTagDomNode.getAttribute("fileName") + "", tgtSchemaNodeClone.getAttribute("fileName") + "");

				var width = dojo.html.getMarginBox(dropTagDomNode).width;

				d = popEles(fieldMapContainer, width);
				d.addCallback(dojo.lang.hitch(window, function (data) {
					mapSameNameFields(data.container, data.origSchemaName);

					return data;
				}));
			}
			return d;
		}))
	});

	dHub.addCallback(dojo.lang.hitch(window, function (data) {
		dojo.byId("buttons").style.display = "";
	}));
	dHub.callback({});
}


function mapSameNameField(dragNode, dropNode) {
	//establishing a mapping between fields,
	var index = dropNode.id;
	index = index.split("_")[1];

	var dropTarget = locateDropTarget(dragMan, dropNode);

	if (dropNode.lastChild.className == "fieldEntry") {
		dropNode.removeChild(dropNode.lastChild);
	}

	//link to the newly dropped schema	
	var dragNodeClone = dragNode.cloneNode(true);
	dragNodeClone.style.display = "block";
	dragNode.style.display = "none";
	dropNode.appendChild(dragNodeClone);
	dropNode.style.border = dropTarget.foccupiedBorder;

	//turn the internally placed drag-over object as drag source
	var ghost = new dojo.dnd.HtmlDragSource(dragNodeClone, "fieldEntryGhost");

	//update the mapping JSON object
	schemaMaps.addSetSchemaMappingEle(dropNode.getAttribute("origSchema"),
			dropNode.getAttribute("fieldName"),
			dragNode.getAttribute("fieldName")
		);
}

function locateDragSource(dragMan, node) {
	for (var i = 0; i < dragSourcesArray.length; i++) {
		if (dragSourcesArray[i].domNode.id == node.id) {
			return dragSourcesArray[i];
		}
	}

	return null;
}

function locateDropTarget(dragMan, node) {

	for (var i = 0; i < dragMan.dropTargets.length; i++) {
		if (dragMan.dropTargets[i].domNode == node) {
			return dragMan.dropTargets[i];
		}
	}
	return null;
}

//this function will unregister all the dragsource and drop target in the div
//and clear it off cleanly.
function unregisterDnd(div) {

	//remove mappingDiv nodes
	if (div.innerHTML != "") {
		var fdrags = dojo.html.getElementsByClass("fieldEntry", div);
		var fdropTgts = dojo.html.getElementsByClass("fieldEntryTargetLink", div);



		for (var i = 0; i < fdrags.length; i++) {
			//locate the drag Source
			var dragSource = locateDragSource(dragMan, fdrags[i]);

			if (dragSource != null)
				dragMan.unregisterDragSource(dragSource);
		}

		for (var i = 0; i < fdropTgts.length; i++) {
			var dropTarget = locateDropTarget(dragMan, fdropTgts[i]);

			if (dropTarget != null)
				dragMan.unregisterDropTarget(dropTarget);
		}

		while (div.childNodes.length >= 1) {
			div.removeChild(div.firstChild);
		}
	}
}

//this function will clear all schema mapping
function clearSchemaMapping() {
	var c = confirm("This action will clear off all existing schema mappings. Are you sure you want to continue?");
	if (!c)
		return false;

	//clear the mapping in the schemaMaps object
	schemaMaps.clearSchemaMapping();

	//make all drag sources visible
	for (var i = 0; i < drags.length; i++) {
		drags[i].style.display = "block";
	}

	//remove mapping in all drop targets
	for (var i = 0; i < dropTgts.length; i++) {
		//remove the last child, if it is "schemaEntry" class	
		var mappedSchemaNodes = dojo.html.getElementsByClass("schemaEntry", dropTgts[i]);
		if (mappedSchemaNodes.length > 0) {
			var mapNode = mappedSchemaNodes[0];
			mapNode.parentNode.removeChild(mapNode);
			dropTgts[i].style.border = "dotted gray 1px";
			dropTgts[i].lastChild.style.display = "none";
		}
	}

	//make all field mapping divs blank and invisible
	FieldMapDivs = dojo.html.getElementsByClass("schemaEntryEleMap");

	for (var i = 0; i < FieldMapDivs.length; i++) {
		while (FieldMapDivs[i].childNodes.length >= 1) {
			FieldMapDivs[i].removeChild(FieldMapDivs[i].firstChild);
		}

		FieldMapDivs[i].style.display = "none";
	}

	return true;
}

//this function will clear field mapping for a specifc original schema
function clearFieldMapping(divID, origSchemaName) {
	//clear off the fields mapping for this schema first
	schemaMaps.removeSchemaFieldsMapping(origSchemaName);

	var div = dojo.byId(divID);

	var fdrags = dojo.html.getElementsByClass("fieldEntry", div);
	var fdropTgts = dojo.html.getElementsByClass("fieldEntryTargetLink", div);

	for (var i = 0; i < fdrags.length; i++) {
		//restore visual first
		fdrags[i].style.display = "block";
	}

	for (var j = 0; j < fdropTgts.length; j++) {
		//remove existing mapping
		if (fdropTgts[j].lastChild.className == "fieldEntry") {
			fdropTgts[j].removeChild(fdropTgts[j].lastChild);
			fdropTgts[j].style.border = "dotted gray 1px";
		}
	}
}



//this function will save the mapping to the tree.xml as a JSON object for easiest load and save
function saveMapping(finalSave) {
	var confirmed = true;

	//check to make sure all schemas are mapped, if not, show confirmation box
	var mappingStatus = schemaMaps.checkMapping();

	if (mappingStatus == schemaMaps.checkMappingStatus.OK)
		confirmed = true;
	else if (finalSave && mappingStatus == schemaMaps.checkMappingStatus.MissingSchema) {
		confirmed = false;
		alert("Please make sure all the schemas are mapped before continue.");
	}
	else if (finalSave && mappingStatus == schemaMaps.checkMappingStatus.SchemaWithoutEleMap) {
		confirmed = false;
		alert("Some schemas don't have field mapping");
	}

	if (confirmed) {
		dojo.io.bind({
			url: "../MigratorAPI/SaveMapping",
			method: "POST",
			content: {
				mapping: dojo.json.serialize(schemaMaps.maps),
				package: dojo.byId("packagePath").value
			},
			mimetype: "text/json",
			preventCache: true,
			load: function (type, data, xhr) {
				if (data.Error) {
					alert(data.Error);
					return;
				}

				if (finalSave) {
					if (window.opener) {
						window.opener.onSchemaMapClose(mappingStatus);
					}
					window.close();
				}
			},
			error: function (type, error) {
				alert(error.message);
			}
		});
	}
}

function getElementText(ele) {
	if (ele.innerText)
		return ele.innerText;
	else if (ele.textContent)
		return ele.textContent;
	else
		return ele.innerHTML;
}

function onResize(e) {
	setTimeout(function () {
		var windowHeight = document.body.clientHeight;
		var textHeight = dojo.byId("desc").offsetHeight;
		var containersHeight = windowHeight - 130 - textHeight + "px";
		dojo.byId("tgtSchemas").style.height = containersHeight;
		dojo.byId("origSchemas").style.height = containersHeight;

		//adjust the links width
		var leftWidth = document.body.offsetWidth - 100 - 170 + "px";
		dojo.byId("origSchemas").style.width = leftWidth;

		fixBoxes();
	}, 50);

}