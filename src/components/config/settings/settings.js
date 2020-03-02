// Javascript Document
(()=>{
  return{
    props: ['source'],
    data(){
      return {
        env: this.source.is_dev ? 'dev' : (this.source.is_test ? 'test' : 'prod')
      };
    },
    methods: {
      open(item){
        let title = item.editable ? bbn._('Setting modification') : bbn._('Setting visualization');
        title += ': ' + item.text
				this.getPopup().open({
          title: title,
          component: 'appui-core-config-form',
          width: 450,
          height: 150,
          source: {
            item: item,
            value: this.source.settings[item.name],
            root: this.source.root
          },
        })        
      }
    }
  }
})();