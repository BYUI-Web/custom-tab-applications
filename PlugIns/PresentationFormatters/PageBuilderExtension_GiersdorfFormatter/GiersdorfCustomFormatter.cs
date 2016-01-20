using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using HtmlAgilityPack;
using Ingeniux.CMS.Enums;

namespace Ingeniux.CMS.Presentation
{
    public class GiersdorfCustomFormatter : PresentationFormatterBase
    {
		public override string ColumnClassNameBase
		{
			get { return "col w-"; }
		}

		public override bool SupportWrapLevels
		{
			get { return false; }
		}

		public override string Name
		{
			get { return "Ingeniux Professional Services Responsive Framework Formatter"; }
		}

		public override string RowClassName
		{
			get { return "colwrap"; }
		}

		public override string GetColumnOffsetClassNameBase(EnumLayoutRowGridsWrap wrapLevel)
		{
			return string.Empty;
		}

		public override bool PadZeroOnColumnWidth
		{
			get
			{
				return true; //Implementation of responsiveness is non-standard, 0 must be padding for 1 digit column sizes
			}
		}
	}
}
