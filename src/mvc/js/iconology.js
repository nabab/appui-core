(()=>{
  return {
    data(){
      return {
        searchIcon:'',
        totIcons: this.source.icons,
        ready: true
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
      copyIcon(icon){
        this.$refs.copyIcon.value = icon;
        this.$refs.copyIcon.select();
        document.execCommand('copy');
        this.$nextTick(() =>{
          appui.notify(bbn._('Copied class of the icon'), false, 3);
        });
      }
    }
  }
})()
