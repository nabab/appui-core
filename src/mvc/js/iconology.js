/**
	* This file shows the icons. The trick is to render only what is needed in the viewport.
  *
  **/
(()=>{
  return {
    mixins: [
      bbn.cp.mixins.basic,
      bbn.cp.mixins.resizer,
      bbn.cp.mixins.keepCool
    ],
    data(){
      return {
        scroller: null,
        searchIcon:'',
        searchFix: '',
        totIcons: this.source.icons,
        ready: true,
        sectionSize: 125,
        numIcons: this.source.icons.length,
        // The real source from the items
        iconsPerPage:  10,
        containerSize: 0,
        scrollSize: 0,
        currentWidth: 0,
        isInit: false,
        scrolltop: 0,
        numberShown: 10,
        timeout: false,
      };
    },
    computed: {
      // The array from which the source (currentIcons)is built
      icons(){
        const icons = this.searchFix ? this.totIcons.filter(icon => icon.search(this.searchFix.toLowerCase()) > -1) : this.totIcons;
        this.numIcons = icons.length;
        return icons.slice(0, this.numberShown);
      }
    },
    methods:
    {
      addIcons() {
        if ( this.icons.length) {
          this.numberShown += this.iconsPerPage;
        }
        this.$nextTick(() => this.getRef('scroll').onResize(true))
      },
      setIconsPerPage() {
        if (this.icons.length) {
          let firstItem = this.getRef("item-1");
          let section = this.sectionSize;
          let iconsPerRow = 0;
          let iconsPerColumn = 0;
          for (; iconsPerRow * section < this.currentWidth ; iconsPerRow++);
          for (; iconsPerColumn * section < this.containerSize ; iconsPerColumn++);
          this.iconsPerPage = iconsPerColumn * iconsPerRow * 2;
          this.$nextTick(() => this.getRef('scroll').onResize(true))
        }
        return;
      },
      init() {
        let scroll =  this.getRef('scroll');
        this.currentWidth = scroll.containerWidth;
        this.scrollSize = scroll.contentHeight;
        this.containerSize = scroll.containerHeight;
        this.setIconsPerPage();
        if (!this.isInit && this.iconsPerPage) {
          this.isInit = true;
          this.addIcons();
        }
      },
      update() {
        this.keepCool(
          () => {
            this.init();
          }, "init", 350);
      },
      resize() {
        this.currentWidth = this.getRef('scroll').containerWidth;
        this.update();
      },
      copyIcon(icon) {
        bbn.fn.log("ICON", icon)
        bbn.fn.copy(icon);
        appui.success(bbn._("Icon class") + ' ' + icon + ' ' + bbn._("Copied to clipboard"));
      },
    },
    watch: {
      searchIcon(newVal) {
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
          this.searchFix = newVal;
        }, 500);
      },
      searchFix(newVal) {
        this.update();
        this.numberShown = this.iconsPerPage || 10;
        this.$nextTick(() => this.getRef('scroll').onResize(true))
      },
      search() {
        this.updateData();
      },
    }
  };
})();