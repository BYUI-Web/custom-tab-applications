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
    [ExportMetadata("controller", "CustomTabController")]
    [PartCreationPolicy(System.ComponentModel.Composition.CreationPolicy.NonShared)]
    public class CustomTabController : CustomTabApplicationController
    {
        public ActionResult Index()
        {
            using (var session = OpenReadSession())
            {
                var siteList = new List<string>();

                GetSite(CMSContext.GetPage(session), ref siteList);

                PageContext model = new PageContext
                {
                    Page = CMSContext.GetPage(session),
                    CurrentPublishingTarget = CMSContext.GetCurrentPublishingTarget(session),
                    CurrentUser = CMSContext.GetCurrentUser(session),
                    ServerUrl = _Common.ServerUrl,
                    AppBaseUrl = CMSContext.BaseUrl,
                    AppAssetBaseUrl = CMSContext.AssetBaseUrl,
                    Site = siteList,
                    sessionID = session.Id
                };

                return View(model);
            }
        }

        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public string SyncSite()
        {
            //Set up the session data
            var common = CMS_Common.GetCommonInstance(Request.RequestContext);
            var user = common.CurrentUser;
            var store = common.ContentStore;


            //Get requested pages for sync
            var pages = Request.Form["pages"].Split('|');

            //get schema to sync
            var schema = Request.Form["schema"];

            //Schema service and sync request
            var schemaService = new IngeniuxCMService.SchemaDesignerServices();
            var syncRequest = new IngeniuxCMService.SchemaSyncRequest();

            var toSync = new List<IngeniuxCMService.SchemaSyncPageEntry>();

            using (var session = store.OpenWriteSession(user))
            {
                //check the schema id of each page
                foreach (var xid in pages)
                {
                    var page = session.Site.Page(xid.Replace(" ", ""));

                    //if the schema matches
                    if (page.Schema.Id == schema)
                    {
                        toSync.Add(new IngeniuxCMService.SchemaSyncPageEntry { ID = xid });
                    }
                }
            }

            //Pages to sync
            var pageEntries = toSync;

            syncRequest.Pages = pageEntries.ToArray();
            syncRequest.SchemaId = schema;

            //do the sync and get resutls
            var response = schemaService.SyncPagesToSchema(syncRequest);

            return new JavaScriptSerializer().Serialize(response);
        }

        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public string CopyElement()
        {
            var oldName = Request.Form["oldName"];
            var newName = Request.Form["newName"];
            var pages = Request.Form["pages"].Split('|');

            //Set up the session data
            var common = CMS_Common.GetCommonInstance(Request.RequestContext);
            var user = common.CurrentUser;
            var store = common.ContentStore;

            //Rename the element and save
            using (var session = store.OpenWriteSession(user))
            {
                var response = new Dictionary<string, List<string>>();

                foreach (var xid in pages)
                {
                    //change the element if it exists
                    var page = session.Site.Page(xid.Replace(" ", ""));
                    if (page == null)
                    {
                        response.Add("error", new List<string>() { "Could not open " + xid.Replace(" ", "") });
                        return JsonConvert.SerializeObject(response);
                    }

                    //Add each available element indexed by xid to the response.
                    response.Add(xid, new List<string>());

                    foreach (var element in page.Elements())
                    {
                        response[xid].Add(element.Name);
                    }

                    if (page.Element(oldName) != null)
                    {
                        //Rename the element
                        page.Element(oldName).Name = newName;

                        //Save the changes
                        page.Save();

                        //if the change was succesful
                        if (response.ContainsKey("changedPages"))
                        {
                            response["changedPages"].Add(xid.Replace(" ", ""));
                        }
                        else
                        {
                            response.Add("changedPages", new List<string>() { xid.Replace(" ", "") });
                        }
                    }
                    //If there was an error on the page
                    else
                    {
                        if (response.ContainsKey("errors"))
                        {
                            response["errors"].Add(xid.Replace(" ", ""));
                        }
                        else
                        {
                            response.Add("errors", new List<string>() { xid.Replace(" ", "") });
                        }
                    }
                }

                //return results
                return JsonConvert.SerializeObject(response);
            }
        }

        private void GetSite(IPage rootPage, ref List<string> siteList)
        {
            if (rootPage == null || siteList.Count() > 200)
            {
                return;
            }

            //Add the current root
            siteList.Add(rootPage.Id);

            var pageCount = 9999999;


            //for each child of the root
            foreach (var child in rootPage.Children(out pageCount))
            {
                if (child.ChildrenCount() > 0)
                {
                    GetSite(child, ref siteList);
                }
                else
                {
                    siteList.Add(child.Id);
                }
            }
        }

    }
}
