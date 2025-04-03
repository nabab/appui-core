(() => {
  return {
    mixins: [bbn.cp.mixins.basic, bbn.cp.mixins.input],
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
        this.getPopup({
          width: '80%',
          height: '80%',
          label: bbn._('Icon Picker'),
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