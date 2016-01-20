using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;
using Ingeniux.CMS.Enums;
using Ingeniux.CMS.Event;
using Ingeniux.CMS.RavenDB.Indexes;
using Raven.Client.Indexes;

namespace Ingeniux.CMS.Indexes
{
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// This is the place to add custom index classes
	// All indexes put in here must be derived from AbstractIndexCreationTask<TDocument, TReduceResult> or 
	// AbstractMultiMapIndexCreationTask<TReduceResult>
	// Below is a simple example of Map-Reduce. DO NOT DEPLOYMENT THIS INDEX, since this index is already included in CSAPI with a different name
	/*
	public class WorkflowByPageSample : AbstractIndexCreationTask<Workflow, WorkflowByPageSample.WorkflowInfoSample>
	{
		public class WorkflowInfoSample : IEntityIndexMapResult
		{
			public string Id { get; set; }
			public string _PageId { get; set; }

			#region IEntityIndexMapResult Members

			public string[] ResultIDs()
			{
				return new[] { Id };
			}

			#endregion
		}

		public WorkflowByPageSample()
		{
			Map = workflows => from workflow in workflows
							   select new
							   {
								   Id = workflow.Id,
								   _PageId = workflow._PageId
							   };
		}
	}
	 */
	// For details and examples of indexes, go to http://ravendb.net/docs/client-api/querying/static-indexes?version=2
	// Please note that indexes are initialized in first site startup. Any index changes, make sure recycle app pool to apply
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}