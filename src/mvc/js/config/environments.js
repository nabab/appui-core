// Javascript Document
(() => {
  return {
    data(){
      return {
        num: this.source.current
      }
    },
    computed: {
      envs(){
        return this.source.environments.map((a, i) => {
          return {value: i, text: a.hostname + ' in ' + a.app_path}
        });
      }
    }
  }
})()