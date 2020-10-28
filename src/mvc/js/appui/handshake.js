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
        bbn.fn.post(this.source.root)
      }
    }
  }
})()