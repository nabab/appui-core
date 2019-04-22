(()=>{
  return {
    mixins: [bbn.vue.resizerComponent],
    data(){
      return {
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
        let scroll = this.getRef('scroll');
        if ( !height ){
          height = scroll.contentSize > scroll.lastKnownHeight ? scroll.contentSize + scroll.lastKnownHeight : scroll.lastKnownHeight;
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
        return new Promise((resolve) => {
          this.$nextTick(() => {
            resolve('ok');
          })
        }).then(() => {
          if ( this.getRef('ul').clientHeight < height ){
            this.firstIconsFragments(height);
          }
          else{
            this.itemsPerPage = this.currentIcons.length;
            scroll.onResize();
          }
        });
      },
      // Adds itemsPerPage icons to currentIcons
      addIcons(){
        if ( this.icons.length ){
          this.$nextTick(() => {
            let start = this.currentIcons.length;
            let end = start + this.itemsPerPage;
            if ( end > this.icons.length ){
              end = this.icons.length;
            }
            for ( let i = start; i < end; i++ ){
              this.currentIcons.push(this.icons[i]);
            }
            this.$nextTick(() => {
              this.getRef('scroll').onResize();
            })
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
        this.$refs.copyIcon.value = 'nf nf-' + icon;
        this.$refs.copyIcon.select();
        document.execCommand('copy');
        this.$nextTick(() =>{
          appui.notify(bbn._('Copied class of the icon'), false, 3);
        });
      }
    },
    mounted(){
      this.$nextTick(() => {
        this.updateIcons();
      })
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