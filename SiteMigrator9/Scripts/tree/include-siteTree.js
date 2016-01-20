<%

var site = Session("SITE");
var fs = new ActiveXObject("Scripting.FileSystemObject");

var iconFuncs = {
		getIconPath: function(iconID, backTrackOffset)
		{
			var iconName;
			var imagePath = this.backTrackPath(0) + "client/images/icons";
			var path5 = Server.MapPath(imagePath);
			
			//4.x icon paths
			if (!fs.FolderExists(path5 + "\\default"))
			{
				imagePath = this.backTrackPath(backTrackOffset) + "client/images/icons";
				
				if (page.checkedOut)
					iconName = imagePath + iconID + ".gif";
				else
					iconName = imagePath + iconID + "r.gif";
			}	
			//5.x icon path
			else
			{
				iconName = this.getIconPath_5(iconID, true, backTrackOffset);				
			}	
			
			return iconName;	
		},

		getIconPath_5: function(iconId, checkedOut, backTrackOffset)
		{
			var iconName = this.backTrackPath(backTrackOffset) + "client/images/icons/";
			
			if (checkedOut)
				iconName += "over/";
			else
				iconName += "inactive/";

			switch(iconId)
			{
				case 0:
					iconName += "publish";
				break;
				case 1:
					iconName += "folder";
				break;
				case 2:
				case 13:
				case 15:
				case 16:
				case 17:
					iconName += "page";
				break;
				case 3:
					iconName += "image";
				break;
				case 4:
					iconName += "gateway";
				break;
				case 5:
					iconName += "user";
				break;
				case 6:
					iconName += "media";
				break;
				case 7:
					iconName += "cover";
				break;
				case 14:
				case 8:
					iconName += "section";
				break;
				case 9:
					iconName += "comcomponent";
				break;
				case 10:
					iconName += "javacomponent";
				break;
				case 11:
				case 12:
					iconName += "component";
				break;
				case 18:
					iconName += "subsection";
				break;
				case 19:
					iconName += "dbquery";
				break;
				case 20:
					iconName += "document";
				break;
				case 21:
					iconName += "pdfdocument";
				break;
				default:
					iconName += "document";
				break;

			}
			
			iconName += "16.png";

			return iconName;
		},
		

		
		//this function find out how deep the current page is, and produce backtrack path "../" to the root folder of 
		//the design time site
		//this page using it must be within XML folder, otherwise the return will be empty
		backTrackPath: function(offset)
		{
			var curPath = Server.MapPath(".");
			
			var backTrackPath = "";
			
			if (curPath.indexOf("xml") != -1)
			{
				var pathFromXML = curPath.split("\\xml")[1];
				pathFromXML = pathFromXML.split("\\");
				
				for (var i=0; i<pathFromXML.length - offset; i++)
				{
					backTrackPath += "../";
				}
			}
			
			return backTrackPath;
		}
		
	};



%>