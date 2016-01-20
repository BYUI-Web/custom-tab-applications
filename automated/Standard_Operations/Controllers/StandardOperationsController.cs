using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Ingeniux.CMS;
using Ingeniux.CMS.WebAPI;

namespace Automated_Task_Standard_Operations.Controllers
{
	[Export(typeof(CMSWebAPIControllerBase))]
	[ExportMetadata("controller", "StandardOperationsController")]
	[PartCreationPolicy(System.ComponentModel.Composition.CreationPolicy.NonShared)]
	public class StandardOperationsController : AutomatedTaskWebAPIController
	{
		[HttpPost]
		public AutoTaskResponse Index()
		{
			bool toEmptyRecycleBin = GetAppSetting("DoEmptyRecycleBin", "false") == "true";

			bool toPublish = false;
			Dictionary<string, bool> pubTargetEntries = new Dictionary<string,bool>();

			//querystring trumps app settings
			string pubTargetQueryString = Request.GetQueryNameValuePairs()
				.FirstOrDefault(
					qs => qs.Key == "pubtarget")
				.ToNullHelper()
				.Propagate(
					qs => qs.Value)
				.Return(string.Empty);

			if (!string.IsNullOrWhiteSpace(pubTargetQueryString))
			{
				//explicit publish mode, skip emptying recycle folder
				toPublish = true;
				toEmptyRecycleBin = false;

				bool isFullPublish = false;
				//by default, incremental publish, unless query string is provided
				string pubType = Request.GetQueryNameValuePairs()
					.FirstOrDefault(
						qs => qs.Key == "pubtype")
					.ToNullHelper()
					.Propagate(
						qs => qs.Value)
					.Return("incremental");

				isFullPublish = pubType == "full";

				pubTargetEntries.Add(pubTargetQueryString, isFullPublish);
			}
			else
			{
				toPublish = GetAppSetting("DoPublish", "false") == "true";
				string pubTargetNamesStr = GetAppSetting("PublishTargets", "");

				if (string.IsNullOrWhiteSpace(pubTargetNamesStr))
					toPublish = false;

				pubTargetEntries = pubTargetNamesStr
					.NormalizedSplit(';')
					.Select(
						str =>
						{
							var secs = str.Split(':');
							string pubTargetName = secs[0];
							bool isFullPublish = false;

							if (secs.Length > 1 && secs[1].Trim().ToLowerInvariant() == "full")
								isFullPublish = true;

							return new KeyValuePair<string, bool>(pubTargetName, isFullPublish);
						})
					.ToDictionaryDistinct(
						p => p.Key,
						p => p.Value);
			}

			AutoTaskResponse resp = CreateAutoTaskResponse();

			if (_InitializationException != null)
				return resp;

			if (toEmptyRecycleBin)
			{
				try
				{
					using (IUserWriteSession session = OpenWriteSession())
					{
						session.Site.EmptyRecycleFolder();
					}
					resp.AddMessage("Successfully emptied recycle folder.");
				}
				catch (Exception e)
				{
					resp.AddError(e, "Error emptying recycle folder");
				}
			}

			if (toPublish)
			{
				try
				{
					using (IUserWriteSession session = OpenWriteSession())
					{
						int c;
						var targets = session.PublishingManager.Targets(out c)
							.ToDictionaryDistinct(
								t => t.Name);

						pubTargetEntries
							.ForEach(
								p =>
								{
									var target = targets.Item(p.Key);

									if (target == null)
										resp.AddError(
											new ArgumentException(
												String.Format("Cannot perform publish on target \"{0}\": pub target doesn't exist",
													p.Key)));
									else
									{
										bool fullPub = p.Value;

										//make sure publish don't throw error when no pages to publish
										try
										{
											target.Publish(!fullPub);

											resp.AddMessage(
												String.Format(
													"Successfully performed {0} publish on pub target \"{1}\"",
													(fullPub ? "Full" : "Incremental"), p.Key));
										}
										catch (NoChangedPagesToPublishException e)
										{
											resp.AddMessage(string.Format("No pages changed to publish on pub target \"{0}\"", p.Key));
										}
									}
								});
								
					}
				}
				catch (Exception e)
				{
					resp.AddError(e, "Error performing publish task");
				}
			}

			return resp;
		}
	}
}