// Javascript Document
(() => {
  return {
    data(){
      return {
        types: this.source.types,
        currentType: '',
        rf: [],
        ro: [],
        changeTimeout: 0,
        isChanging: false
      }
    },
    methods: {
      selectType(){
        let url = this.closest('bbn-container').currentURL;
        bbn.fn.log('test: ' + url);
      },
      unfoldRf(node) {
        bbn.fn.log(node.getPath());
        this.getRef('to').openPath(node.getPath());
      }
    },
    watch: {
      currentType(v){
        this.isChanging = true;
        if (this.changeTimeout) {
          clearTimeout(this.changeTimeout);
        }

        if (v) {
          bbn.fn.post(
            {type: v},
            d => {
              bbn.fn.log()
              if (d.rf) {
                this.rf = d.rf;
                this.ro = d.ro;
              }
              this.changeTimeout = setTimeout(() => {
                this.isChanging = false;
              }, 500);
              bbn.fn.log("RESPONSE", d);
            }
          );
        }
      }
    }
  }
})();