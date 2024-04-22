/**
	* This file shows the icons. The trick is to render only what is needed in the viewport.
  *
  **/
(() => {
  const UPDATE_DELAY = 250;
  return {
  // Mixins for basic, resizer, and keepCool functionality
  mixins: [
    bbn.cp.mixins.basic,
    bbn.cp.mixins.resizer,
    bbn.cp.mixins.keepCool
  ],
  data() {
    return {
      // Total icons from the API
      totIcons: null,
      // Search filter text
      searchFix: '',
      // Number of icons shown initially
      numberShown: 10,
      // Icons per page
      iconsPerPage: 10,
      // Container size
      containerSize: 0,
      // Scroll size
      scrollSize: 0,
      // Current width of the container
      currentWidth: 0,
      // Flag to indicate if initialization is complete
      isInit: false,
      // Scroll top position
      scrolltop: 0,
      // Root URL for API requests
      root: appui.plugins['appui-core'] + '/'
    };
  },
  computed: {
    // Computed property to filter icons based on search text
    icons() {
      // If no icons are available, return an empty array
      if (!this.totIcons) return [];
      // If search filter is applied, filter icons
      if (this.searchFix) {
        return this.totIcons.filter(icon => icon.search(this.searchFix.toLowerCase()) > -1).slice(0, this.numberShown);
      }
      // Otherwise, return the first 'numberShown' icons
      return this.totIcons.slice(0, this.numberShown);
    }
  },
  methods: {
    // Initialize scroll-related variables
    initScroll() {
      const scroll = this.getRef('scroll');
      this.currentWidth = scroll.containerWidth;
      this.scrollSize = scroll.contentHeight;
      this.containerSize = scroll.containerHeight;
    },
    // Initialize icons and set up pagination
    initIcons() {
      this.setIconsPerPage();
      if (!this.isInit && this.iconsPerPage) {
        this.isInit = true;
        this.addIcons();
      }
    },
    // Add more icons to the list
    addIcons() {
      if (this.icons.length) {
        this.start = this.numberShown;
        // Calculate the end index, ensuring it doesn't exceed the total number of icons
        this.end = Math.min(this.start + this.iconsPerPage, this.source.length);
        for (let i = this.start; i < this.end; i++) {
          this.numberShown++;
        }
        this.$nextTick(() => {
          this.getRef('scroll').onResize(true);
        });
      }
    },
    // Calculate the number of icons per page based on container size
    setIconsPerPage() {
      if (this.icons.length) {
        const firstItem = this.getRef("item-1");
        const section = this.sectionSize;
        let iconsPerRow = 0;
        let iconsPerColumn = 0;
        for (; iconsPerRow * section < this.currentWidth; iconsPerRow++);
        for (; iconsPerColumn * section < this.containerSize; iconsPerColumn++);
        this.iconsPerPage = iconsPerColumn * iconsPerRow * 2;
      }
    },
    // Update the component with a delay
    update() {
      this.keepCool(
        () => {
          this.initScroll();
          this.initIcons();
        },
        "init",
        UPDATE_DELAY
      );
    },
    // ...
  },
  created() {
    // Load icons from API if not already loaded
    if (!this.totIcons) {
      bbn.fn.post(this.root + 'iconology/iconpicker', (d) => {
        if (d.success && d.data.icons && d.data.total) {
          this.total = d.data.total;
          this.totIcons = d.data.icons;
          this.onResize();
          this.$nextTick(this.update);
        }
      });
    }
  }  };
})();
