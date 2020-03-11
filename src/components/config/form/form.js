// Javascript Document
(() => {
  return {
    data(){
      return {
        formData: this.source.item.editable ? {
          value: this.source.value,
          name: this.source.item.name
        } : undefined
      }
    },
    methods: {
      success(){
        this.closest('bbn-container').find('appui-core-config-settings').success(this.formData);
      }
    }
  }
})();