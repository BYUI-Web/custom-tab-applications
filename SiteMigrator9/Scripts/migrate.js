dojo.require("dojo.widget.*");
dojo.require("dojo.uri.*");
dojo.require("dojo.json");
dojo.require("dojo.widget.LayoutContainer");
dojo.require("dojo.widget.TabContainer");
dojo.require("dojo.widget.ContentPane");
dojo.require("dojo.widget.ComboBox");
dojo.require("dojo.lang");
dojo.require("dojo.event");

//override dojo.widget.PopupManager's registerWin function, to prevent "Can't execute a freed script" error in IE
dojo.widget.PopupManager.registerWin = function(/*Window*/win){
		// summary: register a window so that when clicks/scroll in it, the popup can be closed automatically
		if(!win.__PopupManagerRegistered)
		{
			try
			{
				dojo.event.connect(win.document, 'onmousedown', this, 'onClick');
				dojo.event.connect(win, "onscroll", this, "onClick");
				dojo.event.connect(win.document, "onkey", this, 'onKey');
				win.__PopupManagerRegistered = true;
				this.registeredWindows.push(win);
			}
			catch (e) {}
		}
	};

var missingList = new Array();

var statusForTab = {
	pack: "",
	expand: "",
	batchMove: ""
}

//the resizer class
var resizer = function (resizerID, elementID)
{
	this.resizeHandler = dojo.byId(resizerID);
	this.element = dojo.byId(elementID);
}

dojo.lang.extend(resizer, {
		//minimum height
		minHeight: 60,
		
		//last Y position
		lastY: 0,

		init: function()
		{
			dojo.event.connect(this.resizeHandler, "onmousedown", this, "startResize");
		},
		
		startResize: function(e)
		{
			this.lastY = e.clientY;

			dojo.event.connect(document.documentElement, "onmousemove", this, "resizing");	
			dojo.event.connect(document.documentElement, "onmouseup", this, "stopResize");
			
			dojo.event.browser.stopEvent(e);
		},
		
		stopResize: function (e)
		{
			dojo.event.disconnect(document.documentElement, "onmousemove", this, "resizing");
			dojo.event.disconnect(document.documentElement, "onmouseup", this, "stopResize");
		},
		
		resizing: function (e)
		{
			var diffHeight = e.clientY - this.lastY;
			
			var newHeight = Math.max(this.minHeight, this.element.offsetHeight + diffHeight);
			
			this.element.style.height = newHeight;
			
			this.lastY = e.clientY;
		}

	});

var tabs = null;

var treeMan = TreeManager.getTreeManager();

dojo.addOnLoad( function (evt) {

	tabs = dojo.widget.byId("mainTabContainer");

	//assign the onmouseup and onmousedown events tot he resize handler
	var resizerInstance = new resizer("statusResizer", "status");
	
	resizerInstance.init();	

	
	//connect the expand tab select to populate the package list
	dojo.event.connect(tabs, "selectChild", function (e) {
	
			if (tabs.allowSwitchTab)
			{
				//reset page list
				pageList = null;
				idMaps = new Array();
				idMapsClone = new Array();
				packPath = "";	
		
				//tabs.selectedChildWidget.refresh();
		
				//clear the status
				var statusText = "";
				
				if (tabs.selectedChildWidget.label == "Expand")
					statusText = statusForTab.expand;
				else if (tabs.selectedChildWidget.label == "Package")
					statusText = statusForTab.pack;				
				else if (tabs.selectedChildWidget.label == "Utility - Batch Move")
					statusText = statusForTab.batchMove;
				
				dojo.byId("status").value = statusText;	
				
				//hit the package list server to get the list back
				if (tabs.selectedChildWidget.label == "Expand")
				{
					tabs.selectedChildWidget.refresh()
					dojo.byId("logLinkDiv").style.display = "none";				
					dojo.byId("refreshButtn").style.display = "none";	
					
					var packages = dojo.byId("packageNameUnpack");
					packages.style.display = "none";		
					dojo.byId("loadPackList").style.display = "block";

					var d = migratorAjax.getPackages({});

					d.addErrback(function (error) {
						alert(error.message);
					});

					d.addCallback(function (data) {
						if (data) {
							//turn the list into options
							for (var i = 0; i < packages.options.length; i++) {
								packages.options[i] = null;
							}

							packages.options[0] = new Option("[Select a package to expand]", "");

							for (var i = 0; i < data.length; i++) {
								packages.options[i + 1] = new Option(data[i][0], data[i][1]);
							}

							packages.style.display = "block";
							dojo.byId("loadPackList").style.display = "none";
						}
					});
				}					
			}				
		});
	});

dojo.lang.extend(dojo.widget.TabContainer, {
		//templateCssPath: "migrator.css",
		templateCssString: "",
		allowSwitchTab: true,
		selectChild: function (page, callingWidget) 
		{
			if (this.allowSwitchTab)
			{
				page = dojo.widget.byId(page);
				this.correspondingPageButton = callingWidget;
				if (this.selectedChildWidget) {
					this._hideChild(this.selectedChildWidget);
				}
				this.selectedChildWidget = page;
				this.selectedChild = page.widgetId;
				this._showChild(page);
				
				page.isFirstChild = (page == this.children[0]);
				page.isLastChild = (page == this.children[this.children.length - 1]);
				dojo.event.topic.publish(this.widgetId + "-selectChild", page);				
			}
		}
	});
	
dojo.lang.extend(String, {
	trim: function ()
	{
		return this.replace(/^\s+|\s+$/, '');
	}
});
	
function scrollToBottom (element) 
{	
	element.scrollTop = element.scrollHeight;
}	

var total = 0;
var current = 0;

function initProgress(totalSteps)
{
	total = totalSteps;
	current = 0;
	dojo.byId("percent").innerHTML = "";
}

function incrementProgress()
{
	if (total) {
		current++;
		var percent = Math.round(current * 100 / total);
		dojo.byId("percent").innerHTML = percent + "%";
	}
	else
		dojo.byId("percent").innerHTML = "";
}

function setProgress(max, progress) {
	current = progress;
	var percent = Math.round(current * 100 / max);
	dojo.byId("percent").innerHTML = percent + "%";
}

function doneProgress() {
	
	dojo.byId("percent").innerHTML = "100%";
}

var moveFuncs = {
		pageIDs: [],
		
		addEntry: function(str)
		{
			var status = dojo.byId("status");	

			status.value = status.value + "\r\n" + str;	
			
			scrollToBottom(status);			
		},			
		
		initialize: function()
		{
			dojo.byId("status").value = "";
		
			var idsText = dojo.byId("movePage_idList").value;
			//remove all spaces
			idsText = idsText.replace(/ /g, "");	
			idsText = idsText.replace(/\t/g, "");

			idsText = idsText.replace(/\|/g, "\n");
			idsText = idsText.replace(/\,/g, "\n");
			idsText = idsText.replace(/\;/g, "\n");

			//break by line returns
			this.pageIDs = idsText.split("\n");

			dojo.byId("movePage_idList").value = idsText;
			
			var yes = confirm("Page moving can not be undone, are you sure you want to continue?");
			
			if (yes)			
				this.movePage();
		},
		
		movePage: function()
		{			
			//disable tab switching
			tabs.allowSwitchTab = false;
			
			//disable button
			dojo.byId("moveButton").disabled = "true";
			
			var id = this.pageIDs.pop();
			var self = this;

			var d = migratorAjax.movePages({
				pageID: id,
				targetID: dojo.byId("movePage_target").value
			});

			d.addErrback(function (error) {
				self.addEntry(error.message);
				//enable tab switching again
				tabs.allowSwitchTab = true;

				dojo.byId("moveButton").removeAttribute("disabled");
			});

			d.addCallback(function (data) {
				if (data) {
					if (data.Error != "") {
						self.addEntry(data.Error)
					}
					else {
						self.addEntry(data.Message);
					}

					if (self.pageIDs.length > 0)
						self.movePage();
					else {

						//show refresh button
						dojo.byId("refreshButtn").style.display = "inline";

						//cache the status
						statusForTab.batchMove = dojo.byId("status").value;
						alert("Page moving completed");
					}

					//enable tab switching again
					tabs.allowSwitchTab = true;

					dojo.byId("moveButton").removeAttribute("disabled");
				}
			});
		}
	};

function refreshTree()
{
	treeMan.refreshChildren("x1");
}

//has to use jquery to work with signalr
$(function () {
	// Declare a proxy to reference the hub. 
	var chat = $.connection.messenger;
	// Create a function that the hub can call to broadcast messages.
	chat.client.serverMessage = function (message) {
		moveFuncs.addEntry(message);
	};
});