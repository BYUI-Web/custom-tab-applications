using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;

namespace Ingeniux.CMS
{
    /// <summary>
    /// The customizable class for implementing custom logics on providing choice items data for Enumeration Elements types, including Dropdown and Multi-select.
    /// </summary>
    /// <remarks>
    /// <para>Please note that this file is compiled at runtime directly by Ingeniux CMS Site Instance. </para>
    /// <para>The purpose of "API_Extensions_Development_Harnes" project in "Custom" folder is only for development and debugging. It's build result will not be used by Ingeniux CMS Site Instance.</para>
    /// <para>However, the references of " "API_Extensions_Development_Harnes" project will be used during runtime compilation of the this file.</para>
    /// </remarks>
    public class ElementValuesProvider
    {
        /// <summary>
        /// This function is a customization point for Enumeration and Multiselect CMS
        /// elements to provide options like data driven select lists etc. 
        /// </summary>
        /// <param name="schemaName">Schema root name (i.e. Page Type)</param>
        /// <param name="elementName">Tag name of the element</param>
        /// <param name="options">object that is used both as input and
        /// output for this customizable function. Some options include information 
        /// about the request, while others allow modifying how the response is processed.</param>
        /// <param name="site">the CSAPI Site Object, created in a special session</param>
        /// <returns>Collection of strings and field choices</returns>
        public IEnumerable<SelectionChoiceItem> GetElementValues(string schemaName, string elementName,
            ChoicesProviderOptions options, ISite site)
        {
           // return new SelectionChoiceItem[0];

            /////////////////////////////////////////////////////////////////
            // Sample:
            //
            return new[] {
            //	new SelectionChoiceItem {
            //		Label = "One",
            //		Value = "1"
            //	},
            //	new SelectionChoiceItem {
            //		Label = "Two",
            //		Value = "2"
            //	},
                new SelectionChoiceItem
                {
                    Label = "Three",
                    Value = "3"
                }
            };

        }
    }
}