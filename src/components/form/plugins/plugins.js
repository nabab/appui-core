// Javascript Document

(() => {
  return {
    props: ['source', 'confirmMessage', 'success'],
    data(){
      let sel = this.source.selected || [];
      let plugins = {};
      bbn.fn.each(this.source.plugins, a => {
        plugins[a.value] = sel.indexOf(a.value) === -1 ? 0 : 1;
      });
      return {
        plugins: plugins
      }
    },
    methods: {
      checkAll(){
        bbn.fn.each(this.source.plugins, a => {
          if (!this.plugins[a.value]) {
            this.plugins[a.value] = 1;
          }
        });
      },
      uncheckAll(){
        bbn.fn.each(this.source.plugins, a => {
          if (this.plugins[a.value]) {
            this.plugins[a.value] = 0;
          }
        });
      }
    }
  }
})();