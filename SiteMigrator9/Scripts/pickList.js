//pick list widget is a list of items to click on and pick. It allows single selection 
//(multi will implement in the future)

dojo.provide("dojo.widget.PickList");

dojo.require("dojo.widget.Dialog");

dojo.widget.defineWidget(
	"dojo.widget.PickList",
	dojo.widget.HtmlWidget,
	{
		href: "",
		
		id: "",
		
		loaded: false,	
		
		cache: true,
		
		normalBG: "white",
		
		highlightBG: "gray",
		
		dialog: null,
		
		style: "",
	
		//pick list widget will only load from a URL,
		//the url need to return a list of capture-value part array
		/*
		[
			{
				caption: "",
				value: ""
			}, ...
		]
		*/
		show: function ()
		{
	
			if (this.dialog == null) {
			//open a pop up mordal dialog
				this.dialog = dojo.widget.createWidget("Dialog", {toggle:"fade", style:this.style}, this.domNode);
			}		
			
			if ((!this.loaded) && (this.cache))
				this.load();

			this.dialog.show();
			
		},
		
		load: function ()
		{
			var self = this;
			dojo.io.bind({
				url: this.href,
				mimetype: "text/json",
				method: "GET",
				preventCache: true,
				content: {},
				load: function (type, data, xhr)
					{
						if (data == false)
							alert("Invalid JSON Response from " + self.href);
						else
						{
							//turn the list into a list of divs
							for (var i=0; i<data.length; i++)
							{
								var div = document.createElement("<div id='pickList_" + self.id + "_" + i + 
									"' style='width:100%; display:block; background-color: " + self.normalBG + "; margin-bottom:3px' val='" + 
									data[i].value + 
									"'>");
									
								div.innerHTML = data[i].caption;
								
								self.dialog.domNode.appendChild(div);
								
								//assign onclick event	
								dojo.event.connect(div, "onclick", self, "onClick");					
							}
							
							self.loaded = true;
						}						
					},
				error: function(type, error)
					{
						alert(error.message);
					}		
				});					
		},
		
		lastHL: null,
		picked: "",
		
		onClick: function (e)
		{
			if (e ==  null)
				e =  window.event;
				
			//grab the element
			var ele = e.srcElement;
			
			//unhighlight the last highlighted
			if (this.lastHL != null) {
				this.lastHL.style.backgroundColor = this.normalBG;
				this.picked = "";
			}
				
			if (ele != this.lastHL)
			{
				ele.style.backgroundColor= this.highlightBG;
				this.picked = ele.getAttribute("val");
			}
		}
				
	});