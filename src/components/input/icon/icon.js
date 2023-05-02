(() => {
  return {
    mixins: [bbn.wc.mixins.basicComponent, bbn.wc.mixins.inputComponent],
    data(){
      return {
        currentValue: this.value,
        obj: {
          icon: this.currentValue
        }
      }
    },
    computed: {
    },
    methods: {
      browse(){
        this.getPopup().open({
          width: '80%',
          height: '80%',
          title: bbn._('Icon Picker'),
          component: 'appui-core-popup-iconpicker',
          source: {
            field: 'icon',
            obj: this.obj
          }
        });
      }
    },
    watch: {
      currentValue(v) {
        this.emitInput(v)
      },
      "obj.icon"(v) {
        this.currentValue = v;
      }
    }
  }
})()