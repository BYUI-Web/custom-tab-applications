using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Data.OleDb;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using Ingeniux.CMS;
using Ingeniux.CMS.Applications;
using Ingeniux.CMS.Models;
using Newtonsoft.Json;

namespace Ingeniux.CMS.Controller.Custom
{
    [Export(typeof(CMSControllerBase))]
    [ExportMetadata("controller", "AccessibilityController")]
    [PartCreationPolicy(System.ComponentModel.Composition.CreationPolicy.NonShared)]
    public class AccessibilityController : CustomTabApplicationController
    {
        public ActionResult Accessibility()
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
                    AppAssetBaseUrl = CMSContext.AssetBaseUrl,    
                    sessionID = session.Id,                 
                };

                var bcElement = CMSContext.GetPage(session).Element("BodyCopy");
                model.BodyCopy = bcElement != null ? bcElement.Value : "";

                return View(model);
            }
        }
    }
}
