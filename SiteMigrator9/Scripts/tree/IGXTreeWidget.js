dojo.require("dojo.lang.*");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.Tree");
dojo.require("dojo.widget.TreeRPCController");
dojo.require("dojo.widget.TreeSelector");
dojo.require("dojo.widget.TreeNode");
dojo.require("dojo.widget.TreeContextMenu");
dojo.require("dojo.widget.Dialog");


//extend the treeSelector widget to add a function to get the selected node ID (page XID)
dojo.lang.extend(dojo.widget.TreeSelector, {
		getSelectedNodeID: function(inputToUpdate, dialogToClose)
		{
			if (this.selectedNode == null)
				return "";
			else {
				if (inputToUpdate != null)
					inputToUpdate.value = this.selectedNode.widgetId;	
					
				if (dialogToClose != null)
					dialogToClose.hide();
							
				return this.selectedNode.id;
			}
		}	
	});
	
//extend treeNode widget to add more attributes
dojo.lang.extend(dojo.widget.TreeNode, {
		checkedOut: false,
		markedForPub: false,
		//override build child icon to handle PNGs properly
		buildChildIcon: function() {
			if(this.childIconSrc) {
				if (dojo.render.html.ie) {
					this.childIcon.style.setAttribute("cssText", "FILTER: progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + this.childIconSrc
					+ "', sizingMethod='scale')");
				}
				else
				{				
					this.childIcon.src = this.childIconSrc;				
				}
			}
			
			this.childIcon.style.display = this.childIconSrc ? 'inline' : 'none';			
		},
		
		//override createDomNode to add tooltip
		createDOMNode: function(tree, depth){

			this.tree = tree;
			this.depth = depth;


			//
			// add the tree icons
			//

			this.imgs = [];

			for(var i=0; i<this.depth+1; i++){

				var img = this.tree.makeBlankImg();

				this.domNode.insertBefore(img, this.labelNode);

				this.imgs.push(img);
			}


			this.expandIcon = this.imgs[this.imgs.length-1];


			this.childIcon = this.tree.makeBlankImg();

			// add to images before the title
			this.imgs.push(this.childIcon);

			dojo.html.insertBefore(this.childIcon, this.titleNode);

			// node with children(from source html) becomes folder on build stage.
			if (this.children.length || this.isFolder) {
				this.setFolder();
			}
			else {
				// leaves are always loaded
				//dojo.debug("Set "+this+" state to loaded");
				this.state = this.loadStates.LOADED;
			}

			dojo.event.connect(this.childIcon, 'onclick', this, 'onIconClick');


			//
			// create the child rows
			//


			for(var i=0; i<this.children.length; i++){
				this.children[i].parent = this;

				var node = this.children[i].createDOMNode(this.tree, this.depth+1);

				this.containerNode.appendChild(node);
			}


			if (this.children.length) {
				this.state = this.loadStates.LOADED;
			}

			this.updateIcons();

			this.domNodeInitialized = true;

			dojo.event.topic.publish(this.tree.eventNames.createDOMNode, { source: this } );
			
			//connect the tooltip activation to this treeNode
			
			var self = this;
			
			var labelNode = dojo.html.getElementsByClass("dojoTreeNodeLabel", this.domNode)[0];
			
			dojo.event.connect(labelNode, 'onmouseover', function (e) {
			
					if (e.ctrlLeft)
					{
						var tooltip = dojo.widget.byId("tip");
						
						//tooltip.close();
						
						//change tooltip activation node
						tooltip._connectNode = labelNode;
						
						tooltip.domNode.firstChild.innerHTML = self.widgetId;
						tooltip._mouse = {x: e.pageX, y: e.pageY};

						// Start tracking mouse movements, so we know when to cancel timers or erase the tooltip
						if(!tooltip._tracking){
							dojo.event.connect(document.documentElement, "onmousemove", tooltip, "_onMouseMove");
							tooltip._tracking=true;
						}

						tooltip._onHover(e);	
					}
				});

			return this.domNode;
		},
		
		//this function will retrieve all children widgets instances from given tree node	
		//the list is stored in the parameter and being recusively passed down	
		getAllChildWidgets: function(outPutChildrenList)
		{
			var children = this.children;
			
			for (var i=0; i<children.length; i++)
			{
				if (children[i].children.length > 0)
				{
					children[i].getAllChildWidgets(outPutChildrenList);
				}
				outPutChildrenList.push(children[i]);				
			}
		},
		
		destroyAllChildWidgets: function ()
		{
			var childrenWidgets = new Array();
			
			this.getAllChildWidgets(childrenWidgets);
			
			for (var i=0; i<childrenWidgets.length; i++)
			{
				var widgetId = childrenWidgets[i].widgetId;
				dojo.widget.manager.removeById(widgetId);
			}
			
			//remove children
			for(var i=this.children.length -1; i >= 0 ; --i) {
				this.removeNode(this.children[i]);
			}			
		}
				
		/*,
		templateString: ('<div class="dojoTreeNode"> '
			+ '<span treeNode="${this.widgetId}" checkedOut ="${this.checkedOut}" markedForPub="${this.markedForPub}" '
			+ 'class="dojoTreeNodeLabel" dojoAttachPoint="labelNode"> '
			+ '		<span dojoAttachPoint="titleNode" dojoAttachEvent="onClick: onTitleClick" class="dojoTreeNodeLabelTitle">${this.title}</span> '
			+ '</span> '
			+ '<span class="dojoTreeNodeAfterLabel" dojoAttachPoint="afterLabelNode">${this.afterLabel}</span> '
			+ '<div dojoAttachPoint="containerNode" style="display:none"></div> '
			+ '</div>').replace(/(>|<)\s+/g, '$1')	*/	
	});
	
//extend tree widget to set different loading image
dojo.lang.extend(dojo.widget.Tree, {
		//expandIconSrcLoading: dojo.uri.dojoUri("../../Custom/PieceMaker/tree/wheel.gif"),
		
		//new property to indicate tooltip 
		toolTip: null
	})
	
//extend the treeloadingcontroller widget to do special CMS server requests
dojo.lang.extend(dojo.widget.TreeLoadingController, {
		loadRemote: function(node, sync, callObj, callFunc){
			var _this = this;

			
			var params = {
				node: this.getInfo(node),
				tree: this.getInfo(node.tree),
				packPath: packPath,
				backTrackOffset: 1
			};
			
			
			//dojo.debug(callFunc)

			this.runRPC({
				url: this.getRPCUrl('getChildren'),
				load: function(result) {
					_this.loadProcessResponse(node, result, callObj, callFunc) ;
				},
				sync: sync,
				preventCache: true,
				lock: [node],
				params: params
			});

		}
	});
	
dojo.lang.extend(dojo.widget.TreeBasicController, {

		//use for XID search 
		expandToLevelSingle: function(node, traceList, selID) {


			var children = node.children;
			var _this = this;

			var handler = function(node, traceList, selID) {
			
				this.node = node;
				// recursively expand opened node
				this.process = function() {
					if (traceList.length > 0) {
						var childID = traceList.pop();				
						//dojo.debug("Process "+node+" level "+level);
						for(var i=0; i<this.node.children.length; i++) {
							var child = node.children[i];
							
							//only expand matching ID branch
							if (child.widgetId == childID)
								_this.expandToLevelSingle(child, traceList, selID);
						}
					}
					else
					{
						var treeNode = dojo.widget.byId(selID);
						
						if (treeNode != null)						
							treeNode.tree.selector.doSelect(treeNode);
						else
							alert("Page \"" + selID + "\" doesn't exist");
					}
				};
			}

			var h = new handler(node, traceList, selID);

			this.expand(node, false, h, h.process);
		}
	});	
	
var treeSelector, treeController, tree, rootNode, tip, menu;

	
var dialog = null;

var packPath = "";
	
//site dialog related codes
function openTreeDialog(dialogID)
{
	if (dialog == null) {
		dialog = dojo.widget.byId(dialogID);
		
		//assign close button
		dojo.event.connect(	dojo.byId("closeDialog"), "onclick", function (e) {
				//treeSelector.getSelectedNodeID(dojo.byId("root"), dialog);
				dialog.hide();
			});
	}
	
	packPath = dojo.byId("packageNameUnpack").value;
	
	if (packPath == ""){
		alert("Select a package first")
		return;
	}
	
	var packName = packPath.substring(packPath.lastIndexOf("\\")+1, packPath.length+1);
	
	
	//ajax call to sitetree.asp
	
	dojo.io.bind({
		url: treePageUrl,
		mimetype: "text/html",
		method: "GET",
		preventCache: true,
		content: {pageID: "", rootName: packName},
		load: function (type, data, xhr)
			{
				dialog.show();
				if (rootNode == null)
				{
					//initialize tooltip before anything else
					dojo.byId("treeContainerChild").innerHTML = data;
					/*
					tip = dojo.widget.createWidget("dojo:ToolTip",
						{
							connectId:"packRoot", 
							toggle:"wipe", 
							id:"tip",
							showDelay:100,
							duration: 100
						},
						dojo.byId("tip"));*/
				

					treeSelector = dojo.widget.createWidget("dojo:TreeSelector", 
						{
							id: "treeSelector"
						},
						dojo.byId("treeSelector"));
					treeController = dojo.widget.createWidget("dojo:TreeRPCController", 
						{
							id: "treeController",
							RPCUrl: "MigratorAPI/TreeFuncs"
						}, 			
						dojo.byId("treeController"));
						
					var rootNodeDom = dojo.byId("packRoot");
					
					rootNode = dojo.widget.createWidget("dojo:TreeNode", 
						{
							isFolder: "true", 
							childIconSrc: rootNodeDom.getAttribute("childIconSrc"),
							title: rootNodeDom.getAttribute("title"),
							widgetId: rootNodeDom.getAttribute("widgetId"),
							id:"packRoot"
						}, rootNodeDom);
						
					/*
					menu = dojo.widget.createWidget("dojo:TreeContextMenu", 
						{
							toggle: "explode",
							contextMenuForWindow: "false",
							widgetId: "treeContextMenu"
						}, dojo.byId("treeContextMenu"));*/
						
						
					tree = dojo.widget.createWidget("dojo:Tree", 
						{
							selector: "treeSelector", 
							toggler:"wipe",				
							controller: "treeController",
							//menu: "treeContextMenu",
							id: "siteTree"	
						}, dojo.byId("siteTree"));
						

						
					tree.addChild(rootNode);
				}
				else
				{
					//build a list of rootNode's children
					//and then remove their widget instances one by one
					//remove all child nodes and keep the root node
					rootNode.collapse();
					rootNode.state = rootNode.loadStates.UNCHECKED
					rootNode.destroyAllChildWidgets();
				}
							
			
				
			},
		error: function(type, error)
			{
				alert(error.message);
			}		
		});
}

function turnAttributesIntoProps(node)
{
	var props = {};
	
	var attrs = node.attributes;
	
	for (var i=0; i<attrs.length; i++)
	{
		if (attrs[i].nodeName.toLowerCase() != "dojotype")
		{
			props[attrs[i].nodeName] = attrs[i].nodeValue;
		}
	}
	
	return props;
}

function searchXID(searchID)
{
	
	if (searchID == "")
		searchID = dojo.byId("searchID").value;
	
	//get parent list
	
	var _this = this;

	var params = {
		searchID: searchID
	};
	
	
	//dojo.debug(callFunc)

	treeController.runRPC({
		url: treeController.getRPCUrl('search'),
		load: function(data) {
			//now start to expand all to way to the pre-filled in XID
			treeController.expandToLevelSingle(rootNode, data, searchID);
		},
		sync: false,
		preventCache: true,
		params: params
	});	
	
}
