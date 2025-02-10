/**
	* This file shows the icons. The trick is to render only what is needed in the viewport.
  *
  **/
(()=>{
  return {
    methods:
    {
      copyIcon(icon) {
        bbn.fn.log("ICON", icon)
        bbn.fn.copy(icon);
        appui.success(bbn._("Icon class") + ' ' + icon + ' ' + bbn._("Copied to clipboard"));
      },
    },
  };
})();