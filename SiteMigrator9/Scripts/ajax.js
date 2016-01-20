var migratorAjax = {
	xhr: function (url, content, methodName) {
		var args = {
			url: "Apps/SiteMigrator9/" + url,
			mimetype: "text/json",
			method: "POST",
			preventCache: true,
			content: content
		};

		//stop keep alive timer
		window.top.igx.cms.keepAliveTimer.stop();

		//prevent status dialog from showing
		var d = window.top.igx.cms.ajax.xhrGet(args, this._createCallingFunction(methodName, arguments), true);
		d.addBoth(function (data) {
			//start keep alive timer once completed.
			window.top.igx.cms.keepAliveTimer.start();
			return data;
		});
		return d;
	},

	_createCallingFunction: function (functionName, args) {
		// Create an anonymous function in case the xhrGet fails and the login dialog needs to execute the xhrGet again
		return function () {
			return migratorAjax[functionName].apply(migratorAjax, args);
		};
	},

	packXhr: function (url, content, methodName) {
		var d = this.xhr(url, content, methodName);
		d.addErrback(function (error) {
			addEntry(error.message);
			dojo.byId("packButton").removeAttribute("disabled");
			dojo.byId("intCheckButton").removeAttribute("disabled");
			//enabled tab switching
			tabs.allowSwitchTab = true;
		});

		return d;
	},

	generateTree: function (parameters) {
		return this.packXhr("MigratorAPI/GenerateTree", parameters, "generateTree");
	},

	packTaxonomy: function (parameters) {
		return this.packXhr("MigratorAPI/PackTaxonomy", parameters, "packTaxonomy");
	},

	copySS: function (parameters) {
		return this.packXhr("MigratorAPI/SchemaStylesheetsCopy", parameters, "copySS");
	},

	exportPages: function (parameters) {
		return this.packXhr("MigratorAPI/ExportPage", parameters, "exportPages");
	},

	integrityCheck_GetPageList: function (parameters) {
		return this.packXhr("MigratorAPI/GetPageList", parameters, "integrityCheck_GetPageList");
	},

	integrityCheck: function (parameters) {
		return this.packXhr("MigratorAPI/CheckIntegrity", parameters, "integrityCheck");
	},

	deletePages: function (parameters) {
		return this.packXhr("MigratorAPI/DeletePages", parameters, "deletePages");
	},

	getPackages: function (parameters) {
		return this.xhr("MigratorAPI/ServerFiles", parameters, "getPackages");
	},

	movePages: function (parameters) {
		return this.xhr("MigratorAPI/MovePage", parameters, "movePages");
	},

	unpack: function (parameters) {
		return this.xhr("MigratorAPI/CreatePages", parameters, "movePages");
	}
};