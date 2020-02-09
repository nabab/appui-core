/**
	* This file shows the icons. The trick is to render only what is needed in the viewport.
  *
  **/
(()=>{
  return {
    mixins: [bbn.vue.resizerComponent],
    data(){
      return {
        scroller: null,
        searchIcon:'',
        totIcons: this.source.icons,
        ready: true,
        // The real source from the items
        currentIcons: [],
        itemsPerPage: 0
      }
    },
    computed: {
      // The array from which the source (currentIcons)is built
      icons(){
        // Filtered
        if ( this.searchIcon ){
          return this.totIcons.filter(icon => icon.search(this.searchIcon.toLowerCase()) > -1);
        }
        // or not
        return this.totIcons;
      }
    },
    methods:{
      // Reinitializing the size calculations
      onResize(){
        this.itemsPerPage = 0;
        this.updateIcons();
      },
      // Fills the empty container with items 
      // It does 10 at a time then lets it render through promises
      // Stops when it gets a scroll
      // Store the items' number (itemsPerPage) as reference for next additions
      firstIconsFragments(prom, height){
        if ( !this.scroller ){
          let scroll = this.getRef('scroll');
          if ( scroll ){
            this.scroller = scroll;
          }
        }
        if ( this.scroller ){
          let containerSize = this.scroller.containerHeight;
          let contentSize = this.scroller.contentHeight;
          if ( !height && !containerSize ){
            this.scroller.onResize();
          }
          if ( !height ){
            height = contentSize > containerSize ? contentSize + containerSize : containerSize;
          }
          let start = this.currentIcons.length;
          let end = start + 10;
          if ( end > this.icons.length ){
            end = this.icons.length;
          }
          if ( end <= start ){
            return;
          }
          for ( let i = start; i < end; i++ ){
            this.currentIcons.push(this.icons[i]);
          }
          return prom.then(() => {
            let ul = this.getRef('ul');
            bbn.fn.log('--------', height, contentSize, containerSize, ul.clientHeight, '*********');
            if ( contentSize <= height ){
              this.scroller.onResize().then(() => {
                let prom = new Promise((resolve, reject) => {
                  this.$nextTick(() => {
                    resolve('ok')
                  })
                });
                this.firstIconsFragments(prom, height);
              });
            }
            else{
              this.scroller.onResize().then(() => {
                this.itemsPerPage = this.currentIcons.length;
              });
            }
          });
        }
      },
      // Adds itemsPerPage icons to currentIcons
      addIcons(){
        if ( this.icons.length && this.scroller ){
          let start = this.currentIcons.length;
          let end = start + this.itemsPerPage;
          if ( end > this.icons.length ){
            end = this.icons.length;
          }
          for ( let i = start; i < end; i++ ){
            this.currentIcons.push(this.icons[i]);
          }
          this.$nextTick(() => {
            this.scroller.onResize();
          })
        }
      },
      // Initiate the launch
      updateIcons(){
        this.currentIcons.splice(0, this.currentIcons.length);
        if ( this.icons.length ){
          let promise = new Promise((resolve, reject) => {
            this.$nextTick(() => {
              resolve('ok')
            })
          });
          this.firstIconsFragments(promise);
        }
      },
      copyIcon(icon){
        bbn.fn.copy(icon);
    		appui.success(bbn._("Copied to clipboard"));
      }
    },
    watch: {
      searchIcon(newVal){
        this.$nextTick(() => {
          this.updateIcons();
        });
      }
    }
  }
})()