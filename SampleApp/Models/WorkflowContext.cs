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
	public class WorkflowContext : PageContext
	{
		public ITransition Transition;
	}
}