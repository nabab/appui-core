// Javascript Document
(()=>{
  return{
    props: ['source'],
    data(){
      return {
        env: this.source.is_dev ? 'dev' : (this.source.is_test ? 'test' : 'prod')
      };
    },
    computed: {
      dbCfg(){
        let res = {};
        bbn.fn.iterate(this.source.settings, (v, k) => {
          if (k.indexOf('db_') === 0) {
            res[k] = v;
          }
        });
        return res;
      },
      dbText(){
        if (this.source.settings.db_engine === 'mysql') {
          return '<strong>' + this.source.settings.db_engine + '</strong> '
            + this.source.settings.db_user + ' ' + bbn._('on')
            + ' ' + this.source.settings.db_host;
        }
        else {
          return this.source.settings.db_engine;
        }
      }
    },
    methods: {
      success(data){
        //bbn.fn.log(data);
        this.source.settings[data.name] = data.value;
      },
      open(item){
				this.getPopup({
          label: (item.editable ? bbn._('Setting modification') : bbn._('Setting visualization')) + ': ' + item.text,
          component: 'appui-core-config-form',
          width: 450,
          height: bbn.fn.isString(item.editable) ? 300 : 150,
          source: {
            item: item,
            data: this.source.data,
            value: this.source.settings[item.name],
            root: this.source.root
          },
        })        
      }
    }
  }
})();