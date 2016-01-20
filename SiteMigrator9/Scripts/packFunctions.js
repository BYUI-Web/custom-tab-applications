

function toggleInterruptPack(toInterrupt, filePath) {
	var packButton = dojo.byId("packButton");

	if (toInterrupt != null) {
		interrupt = toInterrupt;
		packButton.value = "Pause";
		packButton.onclick = function () {
			toggleInterruptPack();
		};
	}
	else if (interrupt == false) {
		interrupt = true;
		packButton.value = "Continue";
		packButton.onclick = function () {
			toggleInterruptPack(false, _filePath);
			continuePageExport(_filePath);
		};

	}
	else {
		interrupt = false;
		packButton.value = "Pause";
		packButton.onclick = function () {
			toggleInterruptPack();
		};
	}
}

function restorePackButton() {
	var packButton = dojo.byId("packButton");
	packButton.value = "Pack";
	packButton.onclick = function () {
		pack();
	};

}

var statusPanel;

function pack() {
	dojo.byId("percent").innerHTML = "";

	var packButton = dojo.byId("packButton");
	packButton.disabled = "true";

	dojo.byId("intCheckButton").disabled = true;

	//disable tab switching first
	tabs.allowSwitchTab = false;

	pageList = new Array();

	statusPanel = dojo.byId("status");

	statusPanel.value = "Walking the content tree and generate fragment tree for migration...";
	//first generate the site tree file

	var d = migratorAjax.generateTree({
		roots: dojo.byId("rootXIDs").value,
		name: dojo.byId("packageName").value,
		cat: (dojo.byId("checkbox_preserveCategorization").checked ? "true" : "false"),
		copycat: (dojo.byId("checkbox_copyTaxonomy").checked ? "true" : "false")
	});

	d.addCallback(function (data) {
		if (data)
			genTreeProcessor(data);
	});

	//dojo.io.bind({
	//	url: "MigratorAPI/GenerateTree",
	//	mimetype: "text/json",
	//	method: "POST",
	//	preventCache: true,
	//	content: {
	//		roots: dojo.byId("rootXIDs").value,
	//		name: dojo.byId("packageName").value,
	//		cat: (dojo.byId("checkbox_preserveCategorization").checked ? "true" : "false"),
	//		copycat: (dojo.byId("checkbox_copyTaxonomy").checked ? "true" : "false")
	//	},
	//	load: function (type, data, xhr) {

	//		if (type == "load") {
	//			genTreeProcessor(data);
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

var pageList = [];

function genTreeProcessor(resp) {
	if (resp.Error) {
		addEntry(resp.Error);
		//enabled tab switching
		tabs.allowSwitchTab = true;
		dojo.byId("packButton").removeAttribute("disabled");
		dojo.byId("intCheckButton").removeAttribute("disabled");
	}
	else {
		var respObj = resp.Message

		_filePath = respObj.filePath;

		pageList = respObj.pagesList;

		//prepare for next step, perform page by page copy so the process can be interrupted

		if (!dojo.byId("checkbox_preserveCategorization").checked) {
			addEntry("Fragment tree generated for the package. Proceed with file copying...");
			copySSPack(respObj.schemaList);
		}
		else {
			addEntry("Fragment tree generated for the package. Proceed with categorization packaging...");
			packTaxonomy(respObj);
		}
	}
}

function changeCategorizationSetting(evt) {
	dojo.byId("checkbox_copyTaxonomy").disabled = !dojo.byId("checkbox_preserveCategorization").checked;
	if (!dojo.byId("checkbox_preserveCategorization").checked)
		dojo.byId("checkbox_copyTaxonomy").checked = false;
}

function packTaxonomy(respObj) {

	var d = migratorAjax.packTaxonomy({
		packPath: respObj.packPath,
		cats: respObj.categoriesList.join("|")
	});

	d.addCallback(function (data) {
		if (data) {
			if (data.Error != "") {
				addEntry("Error packaging categories: " + data.Error)
			}
			else {
				addEntry(data.Message + " Proceed with file copying...");
				copySSPack(respObj.schemaList);
			}
		}
	});

	//dojo.io.bind({
	//	url: "MigratorAPI/PackTaxonomy",
	//	mimetype: "text/json",
	//	method: "POST",
	//	preventCache: true,
	//	content: {
	//		packPath: respObj.packPath,
	//		cats: respObj.categoriesList.join("|")
	//	},
	//	load: function (type, data, xhr) {

	//		if (type == "load") {
	//			if (data == false)
	//				self.addEntry("Invalid JSON Response from " + url);
	//			else if (data.Error != "") {
	//				addEntry("Error packaging categories: " + data.Error)
	//			}
	//			else {
	//				addEntry(data.Message + " Proceed with file copying...");
	//				copySSPack(respObj.schemaList);
	//			}
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

function copySSPack(schemaList) {
	//extract the schemaFileName List
	var schemaFiles = new Array();
	for (var i = 0; i < schemaList.length; i++) {
		schemaFiles.push(schemaList[i].fileName);
	}
	schemaFiles.reverse();

	addEntry("Copying schema and stylesheets...");

	var d = migratorAjax.copySS({
		toPack: "true",
		name: dojo.byId("packageName").value,
		schemas: schemaFiles.join("|")
	});


	d.addCallback(function (data) {
		if (data)
			copySSProcessorPack(data);
	});

	//dojo.io.bind({
	//	url: "MigratorAPI/SchemaStylesheetsCopy",
	//	mimetype: "text/json",
	//	method: "POST",
	//	preventCache: true,
	//	content: {
	//		toPack: "true",
	//		name: dojo.byId("packageName").value,
	//		schemas: schemaFiles.join("|")
	//	},
	//	load: function (type, data, xhr) {

	//		if (type == "load") {
	//			copySSProcessorPack(data);
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

function copySSProcessorPack(resp) {

	if (resp.Error) {
		addEntry(resp.Error);
		//enabled tab switching
		tabs.allowSwitchTab = true;

		dojo.byId("intCheckButton").removeAttribute("disabled");
	}
	else {
		addEntry("Schemas and Stylesheets Copied. Proceeding with page copying...");
		dojo.byId("packButton").removeAttribute("disabled");
		toggleInterruptPack(false, _filePath);

		initProgress(pageList.length);

		continuePageExport(_filePath);
	}
}

function continuePageExport(filesPath) {

	// Declare a proxy to reference the hub. 
	msger = $.connection.messenger;
	// Create a function that the hub can call to broadcast messages.
	msger.client.serverRestMessage = function (message) {
		var obj = dojo.json.evalJson(message);

		if (obj.step) {
			incrementProgress();
		}
	};

	msger.client.serverMessage = function (message) {
		addEntry(message);
	}

	// Start the connection.
	$.connection.hub.start();

	var d = migratorAjax.exportPages({
		pageIds: pageList.join('|'),
		path: filesPath
	});

	d.addCallback(function (data) {
		if (data)
			continuePageExportProcessor(data);
	});

	//dojo.io.bind({
	//	url: "MigratorAPI/ExportPage",
	//	mimetype: "text/json",
	//	method: "POST",
	//	preventCache: true,
	//	content: {
	//		pageIds: pageList.join('|'),
	//		path: filesPath
	//	},
	//	load: function (type, data, xhr) {

	//		if (type == "load") {
	//			continuePageExportProcessor(data);
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

var packagePath = "";

function continuePageExportProcessor(resp) {

	//stop listening to push notifications
	$.connection.hub.stop();

	if (resp.Error) {
		addEntry(resp.Error);
		//enabled tab switching
		tabs.allowSwitchTab = true;

		dojo.byId("intCheckButton").removeAttribute("disabled");
	}
	else {

		var filesPath = resp.Message.PackagePath;

		//disable the pack button and restore the text
		//dojo.byId("packButton").style.display = "None";
		packagePath = _filePath.substr(0, _filePath.lastIndexOf("\\"));

		statusForTab.pack = dojo.byId("status").value;

		if (dojo.byId("removePages").checked) {
			restorePackButton();

			dojo.byId("packButton").disabled = "true";
			deletePages();
		}
		else {
			//reenable tabs
			tabs.allowSwitchTab = true;

			dojo.byId("intCheckButton").removeAttribute("disabled");
			restorePackButton();

			doneProgress();

			var finito = "Packaging completed. The package is located at: \r\n \"" + packagePath + "\"";
			addEntry(finito);
			alert(finito);

			if (resp.ContentUnitsPackaged && resp.ContentUnitsPackaged.length > 0)
				alert("Content units are packaged. Please make sure to deploy the view/templates for content units separately.");
		}
	}
}

function addEntry(str) {
	var status = dojo.byId("status");

	var l = status.value.length;
	var trimStart = Math.max(0, l - 4000);
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

function integrityCheck() {

	//disable switching
	dojo.byId("packButton").disabled = "true";
	dojo.byId("intCheckButton").disabled = "true";

	tabs.allowSwitchTab = false;

	var rootXIDs = dojo.byId("rootXIDs").value;
	pageList = new Array();

	//display message
	dojo.byId("status").value = "Retrieving file list...";

	var d = migratorAjax.integrityCheck_GetPageList({
		picks: rootXIDs
	});

	d.addCallback(function (data) {
		if (data)
			getPageList(data);
	});
}

function getPageList(resp) {
	//this is the async event handler to retrieve page list and continue to next step
	//because everything is event based, all variable passing back and forth will
	//need to be global variables
	if (resp.Error) {
		addEntry(resp.Error);
		//enabled tab switching
		tabs.allowSwitchTab = true;

		dojo.byId("packButton").removeAttribute("disabled");
		dojo.byId("intCheckButton").removeAttribute("disabled");

	}
	else {
		addEntry("Page List Retrieved. No Error Found. Checking Integrity...\r\n");

		var d = migratorAjax.integrityCheck({
			pickIDS: resp.Message.join(",")
		});

		d.addCallback(function (data) {
			if (data)
				checkIntegrity(data);
		});
	}
}

function checkIntegrity(resp) {

	//clear the missing deps list array
	missingList = new Array();

	addEntry(" ");

	if (resp.Message.Count == 0) {
		addEntry("Integrity Check OK. All Component, Links and Navigation Start" +
			" Pages referred in all pages are included in the package");
	}
	else {
		addEntry("Integrity Check found following errors:");

		var typeEntries = [];

		for (var key in resp.Message) {
			var pages = resp.Message[key];

			var entries = [];
			while (pages.length > 0) {
				var idPair = pages.pop();
				entries.push("\t\t" + idPair.SourcePageId + " missing " + idPair.TargetPageId);
				missingList.push(idPair.TargetPageId);
			}

			if (entries.length)
				typeEntries.push("\tThe following pages are missing " + key +
					" references in the package:\r\n" + entries.join("\r\n"));
		}

		addEntry(typeEntries.join("\r\n"));

		//add missing list to move page tab

		dojo.byId("movePage_idList").value = missingList.join("\r\n");
	}

	statusForTab.pack = dojo.byId("status").value;

	dojo.byId("packButton").removeAttribute("disabled");
	dojo.byId("intCheckButton").removeAttribute("disabled");
	//enabled tab switching
	tabs.allowSwitchTab = true;
}

function openSiteTree() {
	var siteTreeURL = "siteTree.asp?multi=true";
	if (dojo.byId("rootXIDs").value != "") {
		var picks = new Array();
		picks = dojo.byId("rootXIDs").value;

		siteTreeURL += "&picks=" + picks;
	}

	var picker = window.open(siteTreeURL, 'picker', 'width=800px,height=600px, left=1px,top=1px, resizable=yes, scrollbars=yes, toolbar=no, location=no, menubar=no');
	picker.focus();
}

function deletePages() {
	addEntry("Removing the packaged pages from CMS (Archiving)...");

	var d = migratorAjax.deletePages({
		ids: dojo.byId("rootXIDs").value
	});

	d.addCallback(function (data) {
		if (data) {
			if (data.Error != "") {
				addEntry("Error removing originnal pages: " + data.Error)
			}
			else {
				addEntry(data.Message);
				//show refresh button
				dojo.byId("refreshButtn").style.display = "inline";

				alert("Packaging and Archive completed. The package is located at: \r\n \"" + packagePath + "\"");
			}

			dojo.byId("packButton").removeAttribute("disabled");
			dojo.byId("intCheckButton").removeAttribute("disabled");
			//enabled tab switching
			tabs.allowSwitchTab = true;
		}
	});

	//dojo.io.bind({
	//	url: "MigratorAPI/DeletePages",
	//	mimetype: "text/json",
	//	method: "POST",
	//	preventCache: true,
	//	content: {
	//		ids: dojo.byId("rootXIDs").value
	//	},
	//	load: function (type, data, xhr) {

	//		if (type == "load") {
	//			if (data == false)
	//				self.addEntry("Invalid JSON Response from " + this.url);
	//			else if (data.Error != "") {
	//				addEntry("Error removing originnal pages: " + data.Error)
	//			}
	//			else {
	//				addEntry(data.Message);
	//				//show refresh button
	//				dojo.byId("refreshButtn").style.display = "inline";

	//				alert("Packaging and Archive completed. The package is located at: \r\n \"" + packagePath + "\"");
	//			}
	//		}

	//		dojo.byId("packButton").removeAttribute("disabled");
	//		dojo.byId("intCheckButton").removeAttribute("disabled");
	//		//enabled tab switching
	//		tabs.allowSwitchTab = true;
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