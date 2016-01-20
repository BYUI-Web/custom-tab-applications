/**
 * @classDescription
 * Demo edit form, use on any component schema with a "Title" element.
 * Change the "matchingSchema" property to assign it to a component schema.
 * 
 * This demo edit form plugin widget demonstrate all standard methods that needs custom logics.
 * 
 * Don't forget to add an entry of "igx.require" in _package_.js to enable the plugin. See the file for details
 * 
 * @copyright 	Ingeniux Corporation 2010
 * 
 * @author 		Arnold Wang
 */
dojo.provide("igx.widget.custom.editFormExtensions.TestEditForm");
(function(){
	var props = {

		label: "Ingeniux CMS Edit Form Plugin Demo",
		templatePath: igx.moduleUri("igx.widget.custom.editFormExtensions", "templates/Test.html"),
		matchingSchema: "CourseComponent",

		/**
		 * Standard implementation for edit form,
		 * Change the edit form UI according to page data
		 * @param {Object} page
		 * @param {Object} isDirty
		 */
		setPageData: function(page, isDirty){
			igx.widget.custom.editFormExtensions.Test.superclass.setPageData.apply(this, arguments);
			var title = page.documentElement.childElements[0];
			this.titleInput.value = decodeURIComponent(title.nodeValue);
			
            if (this.isEditable) {
                this.enable();
            }
            else 
                this.disable();			
		},
		
		/**
		 * Standard implementation for edit form,
		 * Collect page data to save
		 */
		getData: function(){
			var pageData = igx.widget.custom.editFormExtensions.Test.superclass.getData.apply(this, arguments);
			pageData.childElements.push({
				nodeName: "Title",
				nodeValue: this.titleInput.value,
				nodePosition: 0,
				attributes: {},
				childElements: [],
				metaData: {}
			});
			
			return pageData;
		},
		
		/**
		 * Standard implementation for edit form,
		 * Perform additional tasks, e.g. send out another XHR request
		 */
		saveData: function() {
			//shake my baby here
			var times = 12;
			function wiggle(){
				clearTimeout(to);
				var lm = (times % 2 == 0)? "10px" : "0px";
				this.friend.style.marginLeft = lm;
				
				times --;
				if (times> 0)
					to = setTimeout(dojo13.hitch (this, wiggle), 50);
			}
			
			var to = setTimeout(dojo13.hitch (this, wiggle), 50);
		},
		
		minWidth: 650,
		
		/**
		 * Standard implementation for edit form,
		 * Change the edit form size as this panel resize
		 * @param {Object} size
		 */
        onResize: function(size){
            var s = size.inner;
            s.w -= 49;            

            var w = s.w;
            
            if (w < this.minWidth - this.widthDiff) 
                w = this.minWidth - this.widthDiff;

			dojo13.marginBox(this.wrapperNode, {
				w: w
			});
            
            igx.widget.custom.editFormExtensions.Test.superclass.onResize.apply(this, arguments);
        },
		
		/**
		 * Standard implementation for edit form,
		 * Enable the edit form
		 */
		enable: function() {
			igx.widget.custom.editFormExtensions.Test.superclass.enable.apply(this, arguments);
			this.titleInput.disabled = false;
		},
		
		/**
		 * Standard implementation for edit form,
		 * Disable the edit form
		 */
		disable: function() {
			igx.widget.custom.editFormExtensions.Test.superclass.disable.apply(this, arguments);
			this.titleInput.disabled = true;
		}			
	};
	igx.defineWidget("igx.widget.custom.editFormExtensions.Test", igx.widget.EditFormBase, props);
})();
