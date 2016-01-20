using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Web;
using Ingeniux.CMS.Models;

namespace Ingeniux.CMS.Applications
{
	[Export(typeof(ICMSCustomApplicationModel))]
	[ExportMetadata("model", "SampleApp")] 
	public class PageContext : ICMSCustomApplicationModel
	{
		public IPage Page;
		public IPublishingTarget CurrentPublishingTarget;
		public string ServerUrl;
		public string AppBaseUrl;
		public string AppAssetBaseUrl;
	    public List<string> Site;
	    public System.Guid sessionID;
	    public string BodyCopy;

		#region ICMSCustomApplicationModel Members

		public IUser CurrentUser
		{
			get;
			internal set;
		}

		#endregion
	}
}