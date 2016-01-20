dojo.require("dojo.event.*");
dojo.require("dojo.widget.*");

iframeMouseEvents = {
	
	iframePostion: null,
	
	topDragger: null,
	
	onEnter: function()
	{
		DropTragetInIframeList.cacheTargetLocations();
	},
	
	handler: function (e, dontPassEventBack)
	{
		if (!this.topDragger && window.top.dojo)
			this.topDragger = window.top.dojo.dnd.dragManager;
				
		if (this.topDragger && this.iframePostion) {
			
			// Have Dojo standardize the event object.
			window.top.dojo.event.browser.fixEvent(e, dojo.render.html.ie ? e.srcElement : e.target);
			
			// Make a copy of the event object, so that we can modify the page coordinate properties.
			e = window.top.dojo.lang.mixin({}, e);
			
			if (e.type == "mousemove") 
				this.handleMouseOnOffOnDropTargets(e);
			//else 
			//	if (e.type == "mouseup") 
			//		this.onDrop(e);
			
			e.pageX += this.iframePostion.x;
			e.pageY += this.iframePostion.y;
			
			
			// Send the event to the parent window for processing Drag and Drop events.
			switch (e.type) {
				case "mousemove":
					if (!dontPassEventBack) {
						//var posContainer = dojo.byId("posContainer");
						//posContainer.innerHTML = "Drag objects length: " + this.topDragger.dragObjects.length + "<br/>" + "Coords: " + e.pageX + "," + e.pageY;
						window.top.dojo.dnd.dragManager.onMouseMove(e);
					}
					break;
					
				case "mouseup":
					window.top.dojo.dnd.dragManager.onMouseUp(e);
					break;
			}
			
		}	
	},
	
	currentDropTarget: null,
	
	handleMouseOnOffOnDropTargets: function(e)
	{


		if (this.topDragger.dragObjects.length > 0)
		{
			//only connect mouse over event if tree node
			if (this.topDragger.dragObjects[0].dragSource.treeNode) {
							
				for (var i=0; i< DropTragetInIframeList.dropTargets.length; i++)
				{
					var d = DropTragetInIframeList.dropTargets[i];
					d.onMouseOut(e);
				}
				
				var bestTarget = DropTragetInIframeList.findBestTarget(e);

				this.currentDropTarget = bestTarget;
				
				if (bestTarget) {
					bestTarget.onMouseOver(e, this.topDragger.dragObjects[0]);
				}
			}
		}		

	},
	
	onDrop: function(e)
	{		
		//recalculate best target, somewhoe firefox doesn't stick the currentDropTarget
		var bestTarget = DropTragetInIframeList.findBestTarget(e);
		if (bestTarget) {
			var success = bestTarget.onDrop(e);
			this.currentDropTarget = null;
			return success;
		}
	}
};

dojo.addOnLoad(function(evt){
	//let this window capture mouse event
	if (!window.top.window.top.g_dragAndDropManager) {
		dojo.event.connect(document, "onmousemove", iframeMouseEvents, "handler");
		dojo.event.connect(document, "onmouseup", iframeMouseEvents, "handler");
	}
});

var DropTragetInIframeList = {
	dropTargets: [],
	dropTargetDimensions: [],
	
	registerDropTarget: function (dropTarget)
	{
		this.dropTargets.push(dropTarget);	
	},
	
	unregisterDropTarget: function(dropTarget)
	{
		var index = dojo.lang.find(this.dropTargets, dropTarget);
		
		if (index != -1)
		{
			this.dropTargets.splice(index,1 );
			this.dropTargetDimensions.splice(index, 1);
		}
	},
	
	cacheTargetLocations: function(){		
		//create a new array each time for dimensions
		//this get trigger when drag over occured on the IFrame content pane
		this.dropTargetDimensions = new Array(this.dropTargets.length);
		for (var i = 0; i < this.dropTargets.length; i++) {
			var tempTarget = this.dropTargets[i];
			var tn = tempTarget.domNode;
			var abs = dojo.html.getAbsolutePosition(tn, true);
			var bb = dojo.html.getBorderBox(tn);
			this.dropTargetDimensions[i] = [[abs.x, abs.y], // upper-left
	 			// lower-right
				[abs.x + bb.width, abs.y + bb.height], tempTarget];
		}
	},
	
	findBestTarget: function(e) {
		var _this = this;
		var bestBox = null;
		dojo.lang.every(this.dropTargetDimensions, function(tmpDA) {
			if(!_this.isInsideBox(e, tmpDA)){
				return true;
			}

			//make sure none of the ancestors of this node's display is 'none'
			var node = tmpDA[2].domNode;
			var pNode = node.parentNode;
			while (pNode.nodeName.toLowerCase() != "body")
			{
				if (pNode.style.display.toLowerCase() == "none")
					return true;
					
				pNode = pNode.parentNode;
			}

			bestBox = tmpDA[2];
		});

		return bestBox;
	},

	isInsideBox: function(e, coords){
		if(	(e.pageX > coords[0][0])&&
			(e.pageX < coords[1][0])&&
			(e.pageY > coords[0][1])&&
			(e.pageY < coords[1][1]) ){
			return true;
		}
		return false;
	}			
};

var dropTargetInIframeParams = 	{
		
		origBorderColor: "gray",
		origBorderSize: "1px",
		
		hiliteBorderColor: "orange",
		hiliteBorderSize: "2px",
		
		dropType: "",
		
		dragObject: null,
		
		postCreate: function()
		{			
			this.dropType = this.domNode.getAttribute("dropType");
			if (this.dropType != null && this.dropType != "" && this.dropType != "nodnd" &&
				window.top.dojo && window.top.dojo.dnd) {
				DropTragetInIframeList.registerDropTarget(this);
			}
		},
		
		destroy: function()
		{
				//dojo.event.disconnect(this.domNode, "onmouseover", this, "onMouseOver");
				//dojo.event.disconnect(this.domNode, "onmouseout", this, "onMouseOut");
			
			//remove from the list	
			DropTragetInIframeList.unregisterDropTarget(this);
			
			igx.widget.DropTargetInIframe.superclass.destroy.apply(this, arguments);
		},
		
		/**
		 * Perform highlight, if the window.top.dojo.dnd.dragManager contains drag Objects
		 * and connect on 
		 * @param {Object} evt
		 */
		onMouseOver: function(evt, dragObject)
		{
			this.toggleHilite(true);
			this.dragObject = dragObject;
		},
		
		onMouseOut: function(evt)
		{
			this.toggleHilite(false);
			
			//this.dragObject = null;
		},
		
		onDrop: function (evt)
		{			
			if (this.dragObject && evt.dragObject.dragSource && evt.dragObject.dragSource.treeNode) {
				
				var pageID;
				try {
					//with 7.0 and above try to see if can capture the multiple selection. Please note that
					//each drop is still its own event
					pageID = evt.dragObject.dragSource.treeNode.widgetId;
				}
				catch (e) {
					pageID = this.dragObject.dragSource.treeNode.widgetId
				};
				
				//extract the page ids information
				if (this.dropType == "single") {
					//no recycle bin
					if (pageID != "RecycleBin")
						this.domNode.value = pageID;
				}
				else if (this.dropType == "multi" || this.dropType == "children") {

					var value = this.domNode.value;

					var ids = [];

					if (value) {
						if (value.indexOf(";") != -1)
							ids = value.split(";");
						else
							ids = value.split("\n");
					}

					if (pageID == "RecycleBin" || dojo.lang.find(ids, pageID) != -1)
						return false;
					
					ids.push(pageID);
					
					var delimitor = (this.dropType == "children" ) ?  '\r\n' : ';';
					
					this.domNode.value = ids.join(delimitor);
				}
			
				//this.dragObject.onDragEnd({dragStatus:"dropSuccess"});
				
				//unregister the drag object and remove it
				//this.topDragger.dragObjects = [];
				
				this.onMouseOut(evt);
				return true;
			}
			
			//dojo.event.browser.stopEvent(evt)
		},
		
		
		
		toggleHilite: function(toHiLite)
		{
			if (this.domNode)
			{
				if (toHiLite)
				{
					/*this.origBorderColor = this.domNode.style.borderColor;
					this.origBorderSize = this.domNode.style.borderWidth;*/
					
					this.domNode.style.borderColor = this.hiliteBorderColor;
					this.domNode.style.borderWidth = this.hiliteBorderSize;
				}
				else
				{
					this.domNode.style.borderColor = this.origBorderColor;
					this.domNode.style.borderWidth = this.origBorderSize;
				}				
			}

		}
	}

/**
 * The widget to handle dragging anything from parent to iframe
 */
dojo.widget.defineWidget("igx.widget.DropTargetInIframe",
	dojo.widget.HtmlWidget,
	dropTargetInIframeParams
)



var dnd = {

	dndMgrObj: window.top.g_dragAndDropManager,
	
	mouseOverClass: "ondroptext",
	
	normalClassBuffer: "",

	getNameValue: function(strText, strName)
	{
		// Strip out the attribute value from the tag text
		var nStartIndex = strText.indexOf(strName);
		nStartIndex = strText.indexOf('"', nStartIndex) + 1;

		var nEndIndex = strText.indexOf('"', nStartIndex);

		var ret = strText.substring(nStartIndex, nEndIndex);
		ret = ret.replace(/&quot;/g, "\"");

		return ret;
	},
	
	resetHighlightColor: function(ele)
	{
		if(typeof(ele) != "undefined")
		{			
			ele.className = this.normalClassBuffer;
			if (ele.id == "movePage_idList")
				ele.style.height = "100px";
			else
				ele.style.height = "24px";
		}
		
		this.normalClassBuffer = "";
		
	},
		
	onDropChildren: function (e)
	{
		var dt = null;
		try
		{
			dt = e.dataTransfer;
		}
		catch (e){}
			
		if (dt) {
		
			var text = dt.getData("Text");
			var ele = e.srcElement;
			
			var ids = new Array();
			
			if (ele.value.trim() != "") 
				ids = ele.value.split("\r\n");
			
			var dragInID = this.getNameValue(text, "ID");
			
			
			if (e.ctrlKey) {
				//when ctrl drag, get children
				var self = this;
				
				ele.style.cursor = "wait";
				document.body.style.cursor = "wait";
				
				dojo.io.bind({
					url: "getChildPages.asp",
					mimetype: "text/json",
					method: "POST",
					preventCache: true,
					content: {
						rootID: dragInID
					},
					load: function(type, data, xhr){
						if (data == false) 
							self.addEntry("Invalid JSON Response from " + this.href);
						else 
							if (data.error != "") {
								self.addEntry(data.error)
							}
							else {
								var childIds = new Array();
								childIds = data.children.reverse();
								
								//vertify existence and add to list
								while (childIds.length > 0) {
									var childID = childIds.pop();
									
									if (ids.indexOf(childID) == -1) {
										ids.push(childID);
										ele.value = ids.join("\r\n");
									}
								}
							}
						ele.style.cursor = "auto";
						document.body.style.cursor = "auto";
						
						e.returnValue = false;
					},
					error: function(type, error){
						this.addEntry(error.message);
						e.returnValue = false;
					}
				});
			}
			else {
				//make sure the value doesn't exist
				if (ids.indexOf(dragInID) != -1) 
					e.returnValue = false;
				else {
					ids.push(dragInID);
					ele.value = ids.join("\r\n");
				}
			}
		}
			
		this.resetHighlightColor(ele);
		
		e.returnValue = false;
	},
	
	onDropSingle: function(e)
	{
		var dt = null;
		try
		{
			dt = e.dataTransfer;
		}
		catch (e){}
			
		if (dt) {
		
			var text = dt.getData("Text");
			var ele = e.srcElement;
			
			ele.value = this.getNameValue(text, "ID");
			
			this.resetHighlightColor(ele);
		}
		
		e.returnValue = false;		
	},
	
	onDropMulti: function(e)
	{

		if (e == null)
			e = window.event;
		
		var dt = null;
		try
		{
			dt = e.dataTransfer;
		}
		catch (e){}
			
		if (dt) {
		
			var text = dt.getData("Text");
			var ele = e.srcElement;
			
			if (ele.value != "") {
				var ids = ele.value.split(";");
				
				var dragInID = this.getNameValue(text, "ID");
				
				//make sure the value doesn't exist
				if (ids.indexOf(dragInID) != -1) 
					e.returnValue = false;
				else {
					ids.push(dragInID);
					ele.value = ids.join(";");
				}
			}
			else 
				ele.value = this.getNameValue(text, "ID");
			
			this.resetHighlightColor(ele);
		}
		
		e.returnValue = false;
	},
	
	onDragStart: function (e)
	{
		this.dndMgrObj.onDragStart(e);
	},
	
	onDragEnd: function (e)
	{
		this.dndMgrObj.onDragEnd(e);
	},	
	
	onDragOver: function (e)
	{
		this.dndMgrObj.onDragEventComponent(e);
	},
	
	oldHeight: 0,
	
	onDragEnter: function (e)
	{
		if (e == null)
			e = window.event;	
			
		var ele = e.srcElement;
		
		var height = ele.clientHeight;
		
		this.oldHeight = height;		
		
		if(ele && this.normalClassBuffer != this.mouseOverClass)
		{		
			var preventDragIn = false;
		
			if (ele.value != "") {		
				var ids = ele.value.split(";");
				var text = e.dataTransfer.getData("Text");				
				var dragInID = this.getNameValue(text, "ID");
				
				//make sure the value doesn't exist
				if (ids.indexOf(dragInID) != -1)
					preventDragIn = true;
			}		
			
			if (!preventDragIn)
			{
				//buffer the class to be restored
				//maintain height

				
				this.normalClassBuffer = ele.className;
				ele.className = this.mouseOverClass;
				
				ele.style.height = height + 2 + "px";
				if (height > 50)
					ele.style.overflow = "auto";
				
				this.dndMgrObj.onDragEventComponent(e);
			}
			else
				e.returnValue = false;
		}	
	},
	
	onDragLeave: function (e)
	{
		if (e == null)
			e = window.event;	
	
		var ele = e.srcElement;
			
		this.resetHighlightColor(ele);	
	},
	
	onKeyDown: function (e)
	{
		//only accept backspace and delete, intercept all key strokes so the field
		//is not typable
		if (e == null)
			e = window.event;	
	
		var ele = e.srcElement;
		
		var key = e.keyCode;
		
		
		if ((key != 8) &&
			(key != 46)) {
			
			
			e.returnValue = false;
			return false;
		}
	},
	
	cancelDrag: function (e)
	{
		e.returnValue = false;
	}
	
	
};