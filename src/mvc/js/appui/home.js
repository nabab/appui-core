// Javascript Document
(() => {
  return {
    data(){
      return {
        status: '',
        
      }
    },
    methods: {
      app_info(){
        bbn.fn.post(this.source.root + 'appui/actions/app_info', {handshake: 1}, d => {
          bbn.fn.log("RESULT", d);
          if (d.success) {
            appui.success(bbn._("Handshake successful with App-UI central server"));
          }
          else {
            appui.warning(bbn._("Impossible to contact the App-UI central server"), 5);
          }
        })
      },
      handshake(){
        bbn.fn.post(this.source.root + 'appui/actions/handshake', {handshake: 1}, d => {
          if (d.success) {
            appui.success(bbn._("Handshake successful with App-UI central server"));
          }
          else {
            appui.warning(bbn._("Impossible to contact the App-UI central server"), 5);
          }
        })
      },
      generateCert(){
        bbn.fn.post(this.source.root + 'appui/actions/gen_cert', d => {
          if (d.success) {
            appui.success(d.message);
            this.source.has_cert = true;
          }
          else {
            appui.warning(d.error);
          }
        })
      },
      register(){
        bbn.fn.post(this.source.root + 'appui/actions/register', d => {
          if (d.success) {
            appui.success(d.message);
            this.source.has_cert = true;
          }
          else {
            appui.warning(d.error);
          }
        })
      }
    },
    mounted(){
      bbn.fn.log("THE SOURCE IS", this.source);
    }
  }
})()