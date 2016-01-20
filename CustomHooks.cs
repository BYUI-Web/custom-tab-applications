using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Xml.Linq;
using Ingeniux.CMS.Enums;
using Ingeniux.CMS.Event;
using Ingeniux.CMS.Models.Hooks;

namespace Ingeniux.CMS
{
	/// <summary>
	/// The customizable class for implementing custom logics and actions, before or after an action or state change on a specific 
	/// Ingeniux CMS object.
	/// </summary>
	/// <remarks>
	/// <para>Please note that this file is compiled at runtime directly by Ingeniux CMS Site Instance. </para>
	/// <para>The purpose of "API_Extensions_Development_Harnes" project in "Custom" folder is only for development and debugging. It's build result will not be used by Ingeniux CMS Site Instance.</para>
	/// <para>However, the references of " "API_Extensions_Development_Harnes" project will be used during runtime compilation of the this file.</para>
	/// </remarks>
	public class CustomHooks : ICustomHooks
	{
		#region ICustomHooks Members

		/// <summary>
		/// This method is invoked after a new Page is created.
		/// </summary>
		/// <param name="page">Page that was created</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnNew(IPage page, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Page is renamed.
		/// DO NOT assign to Page.Name inside the method, otherwise it will cause infinite loop
		/// </summary>
		/// <param name="oldName">The old name of the Page</param>
		/// <param name="newName">The new name of the Page</param>
		/// <param name="page">The Page that was renamed</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnRename(string oldName, string newName, IPage page, IUserWriteSession session)
		{

		}

		/// <summary>
		/// This method is invoked before a Page is assigned to a User.
		/// DO NOT call Page.AssignUser or Page.AssignGroup inside this method, otherwise it will cause infinite loop
		/// </summary>
		/// <param name="page">Page that will be assigned</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeAssign(IPage page, IUserWriteSession session)
		{

		}

		/// <summary>
		/// This method is invoked after a Page is assigned to a User.
		/// DO NOT call Page.AssignUser or Page.AssignGroup inside this method, otherwise it will cause infinite loop
		/// </summary>
		/// <param name="page">Page that was assigned</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterAssign(IPage page, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a Page is checked in
		/// </summary>
		/// <param name="page">Page that will be checked in</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeCheckIn(IPage page, bool recursive, IUserWriteSession session)
		{
//		    var pageList = new List<IPage>();
//            GetSite(page, ref pageList);
//		    var s = "";
//
//		    foreach (var p in pageList)
//		    {
//		        s += p.Id + " ";
//		    }
//
//		    page.Name = s;
//            page.Save();

		}

        private void GetSite(IPage rootPage, ref List<IPage> siteList)
        {
            //Add the current root
            siteList.Add(rootPage);

            var pageCount = 9999999;

            //for each child of the root
            foreach (var child in rootPage.Children(out pageCount))
            {
                if (child.ChildrenCount() > 0)
                {
                    EventLog.WriteEntry("recursing", "again");
                    GetSite(child, ref siteList);
                }
                else
                {
                    siteList.Add(child);
                }
            }
        }

        /// <summary>
        /// This method is invoked after a Page is checked in
        /// </summary>
        /// <param name="page">Page that was be checked in</param>
        /// <param name="session">The session that must be used to perform tasks on additional objects</param>
        /// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
        public void OnAfterCheckIn(IPage page, bool recursive, IUserWriteSession session)
		{

        }

       

        /// <summary>
        /// This method is invoked before a Page is checked out
        /// </summary>
        /// <param name="page">Page that will be checked out</param>
        /// <param name="session">The session that must be used to perform tasks on additional objects</param>
        /// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
        public void OnBeforeCheckOut(IPage page, bool recursive, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Page is checked in
		/// </summary>
		/// <param name="page">Page that was checked out</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterCheckOut(IPage page, bool recursive, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a Page gets copied
		/// </summary>
		/// <param name="sourcePage">The Page to be copied</param>
		/// <param name="targetPage">The target reference location Page</param>
		/// <param name="relation">The position relative to the target reference Page</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeCopy(IPage sourcePage, IPage targetPage, EnumCopyActions relation, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Page gets copied
		/// </summary>
		/// <param name="sourcePage">The Page that was copied</param>
		/// <param name="targetPage">The target reference location Page</param>
		/// <param name="newPage">The new Page created, that was the clone of the source Page</param>
		/// <param name="relation">The position relative to the target reference Page</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterCopy(IPage sourcePage, IPage newPage, IPage targetPage, EnumCopyActions relation, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a Page moved to recycle folder to removed permenantly
		/// </summary>
		/// <param name="page">Page that will be deleted</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeDelete(IPage page, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Page moved to recycle folder to removed permenantly
		/// </summary>
		/// <param name="pageId">Id of the Page that was deleted</param>
		/// <param name="permenant">True if removed permenantly; False if removed to recycle folder</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterDelete(string pageId, bool permenant, IPage page, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a Page is marked/unmarked for publish
		/// </summary>
		/// <param name="page">Page that will be marked/unmarked for publish</param>
		/// <param name="recursive">Whether the action is recursive</param>
		/// <param name="markedTargets">The list of Publishing Targets that this Page will be marked on. Include marked versions on each Target</param>
		/// <param name="unmarkedTargets">The list of Publishing Targets that this Page will be unmarked on.</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeMarkForPublish(IPage page, bool recursive, IEnumerable<PublishingTargetWithMarkedVersion> markedTargets, IEnumerable<IPublishingTarget> unmarkedTargets, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Page was marked/unmarked for publish
		/// </summary>
		/// <param name="page">Page that was marked/unmarked for publish</param>
		/// <param name="recursive">Whether the action is recursive</param>
		/// <param name="markedTargets">The list of Publishing Targets that this Page was marked on. Include marked versions on each Target</param>
		/// <param name="unmarkedTargets">The list of Publishing Targets that this Page was unmarked on.</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>		
		public void OnAfterMarkForPublish(IPage page, bool recursive, IEnumerable<PublishingTargetWithMarkedVersion> markedTargets, IEnumerable<IPublishingTarget> unmarkedTargets, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a Page moved to another location
		/// </summary>
		/// <param name="sourcePage">The Page to be moved</param>
		/// <param name="targetPage">The target reference location Page</param>
		/// <param name="relation">The position relative to the target reference Page</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeMove(IPage sourcePage, IPage targetPage, EnumCopyActions relation, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Page moved to another location
		/// </summary>
		/// <param name="sourcePage">The Page that was moved</param>
		/// <param name="targetPage">The target reference location Page</param>
		/// <param name="relation">The position relative to the target reference Page</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterMove(IPage sourcePage, IPage targetPage, EnumCopyActions relation, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a Page gets copied via special command. On CMS UI, the Paste Special command is executed via drag and drop with "Alt" key instead "Ctrl" key pressed.
		/// The "Paster Special" command at the core is just a copy command, which this hook method invoked.
		/// </summary>
		/// <param name="sourcePage">The Page to be copied</param>
		/// <param name="targetPage">The target reference location Page</param>
		/// <param name="relation">The position relative to the target reference Page</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforePasteSpecial(IPage sourcePage, IPage targetPage, EnumCopyActions relation, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Page gets copied via special command. On CMS UI, the Paste Special command is executed via drag and drop with "Alt" key instead "Ctrl" key pressed.
		/// The "Paster Special" command at the core is just a copy command, which this hook method invoked.
		/// </summary>
		/// <param name="sourcePage">The Page that was copied</param>
		/// <param name="newPage">The new Page created, that was the clone of the source Page</param>
		/// <param name="targetPage">The target reference location Page</param>
		/// <param name="relation">The position relative to the target reference Page</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterPasteSpecial(IPage sourcePage, IPage newPage, IPage targetPage, EnumCopyActions relation, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a Page is rolled back to its previous version
		/// </summary>
		/// <param name="page">The Page to roll back</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeRollback(IPage page, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Page was rolled back to its previous version
		/// </summary>
		/// <param name="page">The Page that was rolled back</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterRollback(IPage page, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a Page abandons its checked out version and back into checked in state.
		/// </summary>
		/// <param name="page">The Page to undo check out</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeUndoCheckOut(IPage page, bool recurisve, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Page abandoned its checked out version and back into checked in state.
		/// </summary>
		/// <param name="page">The Page that undone check out</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterUndoCheckOut(IPage page, bool recurisve, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a non-Region-Root Page gets copied to under another Region Root.
		/// </summary>
		/// <param name="sourcePage">The Page to be copied</param>
		/// <param name="targetPage">The target reference location Page</param>
		/// <param name="relation">The position relative to the target reference Page</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeCrossLocaleCopy(IPage sourcePage, IPage targetPage, EnumCopyActions relation, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a non-Region-Root Page gets copied to under another Region Root.
		/// </summary>
		/// <param name="sourcePage">The Page that was copied</param>
		/// <param name="newPage">The new Page created, that was the clone of the source Page</param>
		/// <param name="targetPage">The target reference location Page</param>
		/// <param name="relation">The position relative to the target reference Page</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterCrossLocaleCopy(IPage sourcePage, IPage newPage, IPage targetPage, EnumCopyActions relation, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a Region Root Page is cloned into another Region Root Page, with lingual maps established between the two Regions.
		/// </summary>
		/// <param name="sourcePage">The Page to be copied</param>
		/// <param name="targetPage">The target reference location Page</param>
		/// <param name="relation">The position relative to the target reference Page</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <param name="targetLocale">The region code of the target Region Root's language</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeRegionRootCopy(IPage sourcePage, IPage targetPage, EnumCopyActions relation, string targetLocale, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Region Root Page was cloned into another Region Root Page, with lingual maps established between the two Regions.
		/// </summary>
		/// <param name="sourcePage">The Page that was copied</param>
		/// <param name="newPage">The new Region Root Page created, that was the clone of the source Page</param>
		/// <param name="targetPage">The target reference location Page</param>
		/// <param name="relation">The position relative to the target reference Page</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <param name="targetLocale">The region code of the target Region Root's language</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterRegionRootCopy(IPage sourcePage, IPage newPage, IPage targetPage, EnumCopyActions relation, string targetLocale, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before all Pages under Recycle Folder are permenantly removed.
		/// </summary>
		/// <param name="recycleFolder">The Recycle Folder Page</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeEmptyRecycleFolder(IPage recycleFolder, IUserSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after all Pages under Recycle Folder were permenantly removed.
		/// </summary>
		/// <param name="recycleFolder">The Recycle Folder Page</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterEmptyRecycleFolder(IPage recycleFolder, IUserSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Category Node was created
		/// </summary>
		/// <param name="category">The Category Node that was created</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnCategoryCreated(ICategoryNode category, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Category Node was created.
		/// DO NOT assign to CategoryNode.Name in thid method, otherwise it will cause infinite loop
		/// </summary>
		/// <param name="category">The Category Node that was renamed</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnCategoryRenamed(string oldName, string newName, ICategoryNode category, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a Category Node is deleted
		/// </summary>
		/// <param name="category">The Category Node to be deleted</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeCategoryDelete(ICategoryNode category, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Category Node was deleted
		/// </summary>
		/// <param name="category">The Category Node that was deleted</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterCategoryDelete(ICategoryNode category, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a User was created
		/// </summary>
		/// <param name="user">The new User that was created</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnUserCreated(IUser user, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a UserGroup was created
		/// </summary>
		/// <param name="userGroup">The new UserGroup that was created</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnUserGroupCreated(IUserGroup userGroup, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a User is deleted
		/// </summary>
		/// <param name="user">The User to delete</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeUserDelete(IUser user, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a User was deleted
		/// </summary>
		/// <param name="user">The User that was deleted</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterUserDelete(IUser user, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a UserGroup is deleted
		/// </summary>
		/// <param name="userGroup">The UserGroup to delete</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeUserGroupDelete(IUserGroup userGroup, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a UserGroup was deleted
		/// </summary>
		/// <param name="userGroup">The UserGroup that was delete</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterUserGroupDelete(IUserGroup userGroup, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a Workflow advances through a Transition
		/// </summary>
		/// <param name="transtion">The transtion that Workflow will advance through</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeWorkflowAdvance(ITransition transtion, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after a Workflow advanced through a Transition
		/// </summary>
		/// <param name="transtion">The transtion that Workflow advanced through</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterWorkflowAdvance(ITransition transtion, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked before a Publishing Task is submitted
		/// </summary>
		/// <param name="pubTarget">The Publishing Target that will submit the publish task</param>
		/// <param name="fullPublish">Whether it will be a full or incremental publish</param>
		/// <param name="pagesToPublish">Collection of information on Pages to be published</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforePublish(IPublishingTarget pubTarget, bool fullPublish, IEnumerable<PagePublishInfo> pagesToPublish, IUserWriteSession session)
		{

		}

		/// <summary>
		/// This method is invoked after a Publishing Task was completed
		/// </summary>
		/// <param name="pubTarget">The Publishing Target that submitted the publish task</param>
		/// <param name="fullPublish">Whether it was a full or incremental publish</param>
		/// <param name="pagesToPublish">Collection of information on Pages that was published</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnPublishComplete(IPublishingTarget pubTarget, bool fullPublish, IEnumerable<PagePublishInfo> pagesToPublish, Exception publishError, IUserWriteSession session)
		{

		}

		/// <summary>
		/// This method is invoked before any type of Ingeniux CMS CSAPI Entity object is saved
		/// </summary>
		/// <param name="entity">The entity to be saved</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnBeforeEntitySave(IEntity entity, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoked after any type of Ingeniux CMS CSAPI Entity object was saved
		/// </summary>
		/// <param name="entity">The entity that was saved</param>
		/// <param name="session">The session that must be used to perform tasks on additional objects</param>
		/// <remarks>When this action is invoked, none of the object involved were saved to Content Store yet.</remarks>
		public void OnAfterEntitySave(IEntity entity, IUserWriteSession session)
		{
			
		}

		/// <summary>
		/// This method is invoke before a File Upload gets processed by Ingeniux CMS Site Instance server
		/// </summary>
		/// <param name="session">The session that will be used to process the upload</param>
		/// <param name="uploadStream">Stream of the upload file</param>
		/// <param name="fileName">Name of the upload file</param>
		/// <param name="targetPhysicalFolder">Full path of target folder</param>
		public void OnBeforeUpload(IUserWriteSession session, ref System.IO.Stream uploadStream, ref string fileName, ref string targetPhysicalFolder)
		{
		}

		/// <summary>
		/// This method is invoke after a File Upload got processed by Ingeniux CMS Site Instance server
		/// </summary>
		/// <param name="session">The session that was used to process the upload</param>
		/// <param name="uploadedFile">The upload file information</param>
		/// <param name="fileSize">The size of uploaded file by KB</param>
		public void OnAfterUpload(IUserWriteSession session, System.IO.FileInfo uploadedFile, int fileSize)
		{
		}

		/// <summary>
		/// This method is invoked before a User attempt to log out
		/// </summary>
		/// <param name="userInstance">The user that is logging out</param>
		public void OnBeforeLogout(IReadonlyUser user)
		{			
		}

		/// <summary>
		/// This method is invoked after a User logged out
		/// </summary>
		/// <param name="loggedOutUserId">The User Id of the User that just logged out</param>
		public void OnAfterLogout(string loggedOutUserId)
		{
		}

		#endregion
	}
}