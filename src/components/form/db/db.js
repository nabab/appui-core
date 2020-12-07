(() => {
  return {
    props: {
      source: {
        type: Object,
        required: true
      }
    },
    data(){
      return {
        engines: [{
          text: bbn._('MySQL'),
          value: 'mysql'
        }, {
          text: bbn._('SQLite'),
          value: 'sqlite'
        }],
        verified: false
      }
    },
    computed: {
      test(){
        return !this.verified &&
          !!this.source.engine &&
          (this.source.engine === 'mysql') &&
          !!this.source.host &&
          !!this.source.user &&
          !!this.source.pass;
      }
    },
    methods: {
      testConnection(){
        this.post(appui.plugins['appui-core'] + '/actions/db_connection', this.source, d => {
          if ( d.success ){
            this.verified = true;
            appui.success(bbn._('Connected'));
          }
          else {
            appui.error(bbn._('Not connected'));
          }
        });
      },
      formValidator(d){
        if ( (d.engine === 'mysql') && !this.verified ){
          this.alert(bbn._('You have to test the connection'));
          return false;
        }
        return true;
      }
    },
    watch: {
      source: {
        deep: true,
        handler(){
          this.verified = false;
        }
      }
    },
  };
})();