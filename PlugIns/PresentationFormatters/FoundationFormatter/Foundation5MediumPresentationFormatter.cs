using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using HtmlAgilityPack;

namespace Ingeniux.CMS.Presentation
{
    public class Foundation5MediumPresentationFormatter : PresentationFormatterBase
    {
		public override string ColumnClassNameBase
		{
			get { return "columns "; }
		}

		public override bool SupportWrapLevels
		{
			get { return true; }
		}

		public override string Name
		{
			get { return "Presentation Formatter for Foundation 5"; }
		}

		public override string RowClassName
		{
			get { return "row"; }
		}

		public override string GetColumnGridSizeClassName(Enums.EnumLayoutRowGridsWrap wrapLevel)
		{
			switch (wrapLevel)
			{
				case Enums.EnumLayoutRowGridsWrap.NeverWrap:
					return "small-";
				case Enums.EnumLayoutRowGridsWrap.WrapOnTabletScreen:
					return "large-";
				case Enums.EnumLayoutRowGridsWrap.WrapOnMobileDeviceScreen:
				case Enums.EnumLayoutRowGridsWrap.Default:
				default:
					return "medium-";
			}
		}

		public override string GetColumnOffsetClassNameBase(Enums.EnumLayoutRowGridsWrap wrapLevel)
		{
			return string.Empty;
		}
	}
}
