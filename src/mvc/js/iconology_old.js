(()=>{
  return {
    mixins: [bbn.vue.resizerComponent],
    data(){
      return {
        searchIcon:'',
        totIcons: this.source.icons,
        ready: true,
        currentIcons: [],
        itemsPerLine: 0,
        lineHeight: 0,
        itemsPerPage: 0
      }
    },
    computed: {
      icons(){
        if ( this.searchIcon ){
          return this.totIcons.filter(icon => icon.search(this.searchIcon.toLowerCase()) > -1);
        }
        return this.totIcons;
      }
    },
    methods:{
      onResize(){
        this.lineHeight = 0;
        this.updateIcons();
      },
      addUntil(prom, height){
        bbn.fn.log("ADD");
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
        let p = new Promise((resolve) => {
          this.$nextTick(() => {
            if ( this.getRef('ul').clientHeight < height ){
              p.then((resolve, reject) => {
                this.addUntil(height);
              })
            }
            else{
              scroll.onResize();
            }
            resolve('ok')
          })
        });
        return p;
      },
      addIcons(){
        if ( this.icons.length ){
          bbn.fn.log("ADDING ICONS");
          if ( !this.itemsPerPage ){
            this.itemsPerPage = this.currentIcons.length;
          }
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
      updateIcons(){
        bbn.fn.log("UPDATRE");
        if ( this.icons.length ){
          let promise = new Promise((resolve, reject) => {
            resolve('ok')
          });
          return promise.then(() => {
            this.addUntil(promise);
          })
        }
      },
      copyIcon(icon){
        this.$refs.copyIcon.value = icon;
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
        this.currentIcons.splice(0, this.currentIcons.length);
        this.$nextTick(() => {
          this.updateIcons();
        });
      }
    }
  }
})()