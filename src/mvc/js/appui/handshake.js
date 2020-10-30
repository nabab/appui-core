// Javascript Document
(() => {
  return {
    data(){
      return {
        status: '',
        
      }
    },
    methods: {
      handshake(){
        bbn.fn.post(this.source.root + 'appui/handshake', {handshake: 1}, d => {
          if (d.success) {
            appui.success(bbn._("Handshake successful with App-UI central server"));
          }
          else {
            appui.warning(bbn._("Impossible to contact the App-UI central server"), 5);
          }
        })
      }
    },
    mounted(){
      bbn.fn.log("THE SOURCE IS", this.source);
    }
  }
})()