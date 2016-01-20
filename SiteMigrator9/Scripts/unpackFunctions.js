		var interrupt = false;		
		var _filePath;
		
		var idMaps = new Array();
		/* idMaps is an array of object in the structure of
			{
				oldID: string,
				newID: string,
			}
		 */
		 
		var catMap = "{}"; 
		var badCats = new Array();
		 
		var idMapsClone = new Array();
		
		var tree = null;
		var pageList = null;	
		var mapped = false;
	
		var supportFuncs = {
				//convert the tree structure into a flat list of parent-thisnode array
				//the parent value will be the packed parent page
				//the list will start with the roots and digg down
				
				
				serializeTree: function (treeNode)
				{
					for (var i=treeNode.children.length-1; i>=0; i--)
					{
						var subTreeNode = treeNode.children[i];
						var pagePair = {
								self: subTreeNode.id,
								selfSchema: subTreeNode.schema,
								parent: treeNode.id,
								categories: subTreeNode.categories
							};
							
						pageList.push(pagePair);
						
						if (subTreeNode.children.length > 0)
						{
							this.serializeTree(subTreeNode);
						}
					}	
				},
				
				lookUpNewID: function (oldID)
				{
					var newID = oldID;
					
					for (var i=0; i<idMaps.length; i++)
					{
						if (idMaps[i].oldID == oldID)
						{
							newID = idMaps[i].newID;
							break;
						}					
					}
					
					return newID;
				}
					
			};
			
		function openMapping()
		{
			if (!dojo.byId("packageNameUnpack").value)
				alert("Please select a package first");

			var url = "SiteMigrator/SchemaMapping?package=" +
				dojo.byId("packageNameUnpack").value;	
				
			var picker3 = window.open(url, 'picker', 'width=800px,height=600px, left=1px,top=1px, resizable=yes, scrollbars=yes, toolbar=no, location=no, menubar=no');
			picker3.focus();		
		}	
				
	
		function showHideMappingButton()
		{
			if (dojo.byId("pageCreation").value == "orig")
			{
				dojo.byId("mapButtonSpan").style.display = "none";
				mapped = false;
			}
			else
			{
				dojo.byId("mapButtonSpan").style.display = "inline";
				mapped = true;
			}				
		}

		function onPackageSelect(evt) {
			dojo.byId("unpackButton").disabled = true;
		}
	
		function toggleInterrupt(toInterrupt)
		{
			var packButton = dojo.byId("unpackButton");

			if (toInterrupt != null)
			{
				interrupt = toInterrupt;
				packButton.value = "Pause";
				packButton.onclick = function()
				{
					toggleInterrupt();
				};					
			}			
			else if (interrupt == false)
			{
				interrupt = true;
				packButton.value = "Continue";
				packButton.onclick = function (){
					toggleInterrupt(false);
					continueCreation();
				};			
			
			}
			else
			{
				interrupt = false;
				packButton.value = "Pause";
				packButton.onclick = function()
				{
					toggleInterrupt();
				};	
			}
		}
		
		function restoreUnpackButton()
		{
			var packButton = dojo.byId("unpackButton");
			packButton.value = "Pack";
			packButton.onclick = function()
			{
				unpack();
			};
				
		}		

		var msger = null;

		function createPages()
		{			
		
			// Declare a proxy to reference the hub. 
			msger = $.connection.messenger;
			// Create a function that the hub can call to broadcast messages.
			msger.client.serverRestMessage = function (message) {
				var obj = dojo.json.evalJson(message);

				if (obj.oldID) {
					addEntry("\tPage [" + obj.oldID + "] created as [" + obj.newID + "]");
				}
				else if (obj.refSetId) {
					addEntry("\tPage [" + obj.refSetId + "] references set");
				}

				if (obj.max && obj.progress)
					setProgress(obj.max, obj.progress);
			};

			msger.client.serverMessage = function (message) {
				addEntry(message);
			}

			// Start the connection.
			$.connection.hub.start();

			var packagePath = dojo.byId("packageNameUnpack").value;

			var content = {
				packagePath: packagePath,
				mapped: mapped,
				root: dojo.byId("unpackRoot").value
			};

			if (dojo.byId("checkbox_applyCategorization").checked) {
				content.cat = true;
			}

			if (dojo.byId("checkbox_addCategories").checked)
				content.createCat = true;

			if (dojo.byId("keepPageIds").checked)
				content.keepPageIds = true;

			var d = migratorAjax.unpack(content);

			d.addErrback(function (error) {
				addEntry(error.message);
				dojo.byId("packButton").removeAttribute("disabled");
				dojo.byId("intCheckButton").removeAttribute("disabled");
				//enabled tab switching
				tabs.allowSwitchTab = true;
			});

			d.addCallback(function (data) {
				if (data) {
					createPageProcessor(data);
				}
			});

			//dojo.io.bind({
			//	url: "MigratorAPI/CreatePages",
			//	mimetype: "text/json",
			//	method: "POST",
			//	preventCache: true,
			//	content: content,
			//	load: function (type, data, xhr) {

			//		if (type == "load") {
			//			createPageProcessor(data);
			//		}
			//	},
			//	error: function (type, error) {
			//		addEntry(error.message);
			//		dojo.byId("packButton").removeAttribute("disabled");
			//		dojo.byId("intCheckButton").removeAttribute("disabled");
			//		//enabled tab switching
			//		tabs.allowSwitchTab = true;
			//	}
			//});
		}
		
		/**
		 * Display any page combinations with bad categories
		 */
		function displayBadCategories() {
			if (badCats.length > 0 && dojo.byId("checkbox_applyCategorization").checked) {
				addEntry("Following pages created came with categories that don't exist on this site. The assignments to missing categories will be abandoned:");
				for (var i=0; i<badCats.length; i++) {
					var pagePair = badCats[i];
					addEntry("Page ID: " + pagePair.newID + ", Original Page ID: " + pagePair.oldID + ", Missing Categories: " + pagePair.badCats.join(", "));	
				}
			}
		}
		
		function createPageProcessor(resp)
		{
			//stop listening to push notifications
			$.connection.hub.stop();

			if (resp.Error) {
				addEntry(resp.Error);		
			}
			else
			{
				//perform entries removal at the end, this allows retry
				//pageList.splice(0, 54);

				//incrementProgress();

				result = resp.Message;
				
				idMaps = idMaps.concat(result.pagesCreated);
				
				if (result.pagesWithBadCategories) {
					badCats = badCats.concat(result.pagesWithBadCategories);
				}

				displayBadCategories();
				doneProgress();

				//message contains the download url, this url will return file result for download
				dojo.byId("logLink").setAttribute("href", result.mappingDownloadUrl);
				dojo.byId("logLinkDiv").style.display = "inline";
				dojo.byId("refreshButtn").style.display = "inline";

				//cache status
				statusForTab.expand = dojo.byId("status").value;

				alert("Expansion Completed for package \"" + dojo.byId("packageNameUnpack").value);

				if (resp.contentUnitsCreated && resp.contentUnitsCreated.length > 0)
					alert("Please make sure the template for following content units are deployed manually: \r\n" + resp.contentUnitsCreated.join(", "));
			}

			//enabled tab switching
			tabs.allowSwitchTab = true;
		}

		function onSchemaMapClose(status) {
			window.mappingStatus = status;
			dojo.byId("unpackButton").disabled = (!window.mappingStatus || window.mappingStatus > 1);
		}
		
		function unpack()
		{			
			var packageName = dojo.byId("packageNameUnpack").value;
			var rootId = dojo.byId("unpackRoot").value;
			
			if (!packageName) {
				alert("Please select package to expand first.");
				return;
			}
			
			if (!rootId || rootId.length < 2 || rootId.substr(0,1) != "x"){
				alert("Please specify root page to expand upon first.");
				return;
			}
			
			if (!window.mappingStatus || window.mappingStatus > 1) {
				alert("Please complete schema mapping first before unpack.");
				return;
			}			
			
			dojo.byId("status").value = "";
			
			//disable tab switching
			tabs.allowSwitchTab = false;
			layers = new Array();
			addEntry("Analyzing target site. Please wait...");
			
			//disabled the button
			dojo.byId("unpackButton").disabled = "true";

			dojo.byId("percent").innerHTML = "";			

			createPages();
		}
	
		function addEntry(str)
		{
			var status = dojo.byId("status");	
			
			var l = status.value.length;
			var trimStart = Math.max(0, l - 50000);
			var logText = status.value.substring(trimStart);
			
			if (trimStart != 0) {
				trimStart = logText.indexOf("\n");
				if (trimStart != -1) {
					logText = logText.substring(trimStart);
				}
			}

			status.value = logText + "\r\n" + str;	
			
			scrollToBottom(status);			
		}	
		
		var fileBrowser = null;	
		
		function openServerFiles()
		{
			if (fileBrowser == null)
				fileBrowser = dojo.widget.byId("fileBrowser");
			fileBrowser.show();
		}
		
		function openSiteTree()
		{
			var siteTreeURL = treePageUrl + "?multi=false";	
			if (dojo.byId("rootXIDs").value != "")
			{
				var picks = new Array();
				picks = dojo.byId("rootXIDs").value;
				
				siteTreeURL += "&picks=" + picks;
			}
				
			var picker2 = window.open(treePageUrl, 'siteTreeURL', 'width=800px,height=600px, left=1px,top=1px, resizable=yes, scrollbars=yes, toolbar=no, location=no, menubar=no');
			picker2.focus();
		}
		
		
		function changeUnpackCategorizationSetting(evt) {
			dojo.byId("checkbox_addCategories").disabled = !dojo.byId("checkbox_applyCategorization").checked;
			if (!dojo.byId("checkbox_applyCategorization").checked)
				dojo.byId("checkbox_addCategories").checked = false;
		}
