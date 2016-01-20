using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Ingeniux.CMS.Models;

namespace Ingeniux.CMS.Controller.Custom
{
	[Export(typeof(CMSControllerBase))]
	[ExportMetadata("controller", "DynamicExecuteUIController")]
	[PartCreationPolicy(System.ComponentModel.Composition.CreationPolicy.NonShared)]
    public class DynamicExecuteUIController : DynamicExecuteInterfaceApplicationController
    {
        public ActionResult Index()
        {
			return View(ElementData);
        }
    }
}
