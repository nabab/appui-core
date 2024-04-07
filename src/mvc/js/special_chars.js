/**
  * This file shows the chars. The trick is to render only what is needed in the viewport.
  *
  **/
(() => {
  return {
    mixins: [bbn.cp.mixins.basic, bbn.cp.mixins.resizer],
    data() {
      return {
        scroller: null,
        searchChar: '',
        totChars: this.source.data,
        ready: true,
        // The real source from the items
        currentChars: [],
        itemsPerPage: 0
      }
    },
    computed: {
      // The array from which the source (currentChars)is built
      chars() {
        // Filtered
        if (this.searchChar) {
          return bbn.fn.order(
            bbn.fn.filter(
              bbn.fn.map(
                this.totChars,
                a => {
                  let searchIdx = 0;
                  if ((this.searchChar.length === 1) && bbn.fn.compare(a.char, this.searchChar, 'contains')) {
                    searchIdx = 1;
                  }
                  else if (bbn.fn.compare(a.name, this.searchChar, 'contains')) {
                    searchIdx = 2;
                  }
                  return bbn.fn.extend({}, a, {
                    searchIdx: searchIdx,
                    fullName: a.name,
                    name: bbn.fn.shorten(a.name, 30)
                  });
                }
              ),
              a => {
                return a.searchIdx > 0;
              }
            ),
            'searchIdx'
          );
        }
        // or not
        return bbn.fn.map(
          this.totChars,
          a => {
            let searchIdx = 0;
            if ((this.searchChar.length === 1) && bbn.fn.compare(a.char, this.searchChar, 'contains')) {
              searchIdx = 1;
            }
            else if (bbn.fn.compare(a.name, this.searchChar, 'contains')) {
              searchIdx = 2;
            }
            return bbn.fn.extend({}, a, {
              searchIdx: searchIdx,
              fullName: a.name,
              name: bbn.fn.shorten(a.name, 30)
            });
          }
        );
      }
    },
    methods: {
      // Reinitializing the size calculations
      onResize() {
        this.itemsPerPage = 0;
        this.updateChars();
      },
      // Fills the empty container with items 
      // It does 10 at a time then lets it render through promises
      // Stops when it gets a scroll
      // Store the items' number (itemsPerPage) as reference for next additions
      async firstCharsFragments(height) {
        if (!this.scroller) {
          let scroll = this.getRef('scroll');
          if (scroll) {
            this.scroller = scroll;
          }
        }
        if (this.scroller) {
          let containerSize = this.scroller.containerHeight;
          let contentSize = this.scroller.contentHeight;
          if (!height && !containerSize) {
            this.scroller.onResize();
          }
          if (!height) {
            height = contentSize > containerSize ? contentSize + containerSize : containerSize;
          }
          let start = this.currentChars.length;
          let end = start + 10;
          if (end > this.chars.length) {
            end = this.chars.length;
          }
          if (end <= start) {
            return;
          }
          for (let i = start; i < end; i++) {
            this.currentChars.push(this.chars[i]);
          }

          if (contentSize <= height) {
            await this.scroller.onResize();
            await this.$nextTick();
            this.firstCharsFragments(height);
          }
          else {
            await this.scroller.onResize();
            this.itemsPerPage = this.currentChars.length;
          }
        }
      },
      // Adds itemsPerPage chars to currentChars
      async addChars() {
        bbn.fn.log("ADDING CHARS");
        if (this.chars.length && this.scroller) {
          bbn.fn.log("REALLY");
          let start = this.currentChars.length;
          let end = start + this.itemsPerPage;
          if (end > this.chars.length) {
            end = this.chars.length;
          }
          for (let i = start; i < end; i++) {
            this.currentChars.push(this.chars[i]);
          }
          await this.$nextTick();
          await this.scroller.onResize();
        }
      },
      // Initiate the launch
      async updateChars() {
        this.currentChars.splice(0, this.currentChars.length);
        if (this.chars.length) {
          await this.$nextTick();
          await this.firstCharsFragments();
        }
      },
      copyChar(char) {
        bbn.fn.copy(char.char);
        appui.success(bbn._("Copied to clipboard"));
      }
    },
    watch: {
      async searchChar(newVal) {
        await this.$nextTick();
        this.updateChars();
      }
    }
  }
})()