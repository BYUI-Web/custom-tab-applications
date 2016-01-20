using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Ingeniux.CMS;
using Ingeniux.CMS.Applications;

namespace Ingeniux.CMS.Controller.Custom
{
	[Export(typeof(CMSControllerBase))]
	[ExportMetadata("controller", "CustomTabController")]
	[PartCreationPolicy(System.ComponentModel.Composition.CreationPolicy.NonShared)]
    public class CustomTabController : CustomTabApplicationController
    {
        public ActionResult Index()
        {
			using (var session = OpenReadSession())
			{
				PageContext model = new PageContext
				{
					Page = CMSContext.GetPage(session),
					CurrentPublishingTarget = CMSContext.GetCurrentPublishingTarget(session),
					CurrentUser = CMSContext.GetCurrentUser(session),
					ServerUrl = _Common.ServerUrl,
					AppBaseUrl = CMSContext.BaseUrl,
					AppAssetBaseUrl = CMSContext.AssetBaseUrl
				};					

				return View(model);
			}
        }
    }
}
