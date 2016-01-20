using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Ingeniux.CMS.Applications;

namespace Ingeniux.CMS.Controller.Custom
{

	[Export(typeof(CMSControllerBase))]
	[ExportMetadata("controller", "WorkflowClientController")]
	[PartCreationPolicy(System.ComponentModel.Composition.CreationPolicy.NonShared)]
	public class WorkflowClientController : WorkflowClientApplicationController
	{
		public ActionResult Index()
		{
			using (var session = OpenReadSession())
			{
				WorkflowContext model = new WorkflowContext
				{
					Page = TransitionContext.GetPage(session),
					Transition = TransitionContext.GetTransition(session),
					CurrentPublishingTarget = TransitionContext.GetCurrentPublishingTarget(session),
					CurrentUser = TransitionContext.GetCurrentUser(session),
					ServerUrl = _Common.ServerUrl,
					AppBaseUrl = TransitionContext.BaseUrl,
					AppAssetBaseUrl = TransitionContext.AssetBaseUrl
				};

				return View(model);
			}
		}
	}
}