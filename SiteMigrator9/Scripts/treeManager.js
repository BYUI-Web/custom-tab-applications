//This is a cross platform tree manager, 
//providing a wrapper for access of both admin and katie client

var treeManProps = {
	treeManager: null,
	
	/**
	 * Override by subclasss
	 * @param {string} pageID
	 */
	selectPage: function(pageID){
	},
	
	refreshChildren: function(pageID){
	
	}
};
/**
 * Base class of TreeManager, both admin and katie's tree manager will derive from this class
 */
dojo.declare("igx.customTabs.TreeManager",
	null,
	treeManProps,
	function ()
	{
		
	});
	

var adminTreeManProps = {
	editTabManager: null,
	selectPage: function(pageID, editMode)
	{
		var ret = this.treeManager.selectPageInTree(pageID, true);
		if (ret) {
			if (editMode == true)
				this.editTabManager.setActiveTab(window.parent.document, window.parent, "", "editTab");
		}
		else
			alert("Can not locate tree tab");			
	},
	
	/**
	 * Admin client can only refresh the entire tree
	 * @param {Object} pageID
	 */
	refreshChildren: function (pageID)
	{
		var treeFrame = this.treeManager.getTreeFrame();
		treeFrame.location.reload();		
	}
}

dojo.declare("igx.customTabs.ActiveXTreeManager",
	igx.customTabs.TreeManager,
	adminTreeManProps,
	function ()
	{
		this.treeManager = window.top.g_treeManager;
		this.editTabManager = window.top.g_editorTabManager;
	});
	
var newTreeManProps = {
	selectPage: function(pageID, editMode)
	{
		if (editMode == true)			
			this.treeManager.loadPage(pageID, "editTab");		
		else
			this.treeManager.loadPage(pageID);
	},
	
	refreshChildren: function (pageID)
	{
		var d = window.top.dojo;
		var treeNode = null;
		
		if (pageID)
			treeNode = d.widget.getWidgetById(pageID);
		
		//if the provided ID doesn't exist, default active tree node is refreshed
		this.treeManager.refresh(treeNode);
	}
}

dojo.declare("igx.customTabs.NewTreeManager",
	igx.customTabs.TreeManager,
	newTreeManProps,
	function ()
	{
		this.treeManager = window.top.igx.cms.controller;
	});	
	
	
var TreeManager = {
	
	isActiveXClient: false,
	
	getTreeManager: function()
	{
		if (window.top.g_treeManager)
		{
			this.isActiveXClient = true;
			return new igx.customTabs.ActiveXTreeManager();
		}
		else
		{
			return new igx.customTabs.NewTreeManager();
		}
	}
}
