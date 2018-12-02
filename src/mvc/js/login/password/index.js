bbn.fn.init({
  env: {
    lang: data.lang,
    connection_failures: 0,
    connection_max_failures: 10,
    logging: data.is_dev || data.is_test,
  }
});

new Vue({
  el: 'div.appui-password',
  props: {
    zIndex: {
      type: Number,
      default: 1
    }
  },
  data: bbn.fn.extend({
    formData: {
      appui_action: 'init_password',
      id: data.id,
      key: data.key,
      pass1: '',
      pass2: ''
    }
  }, data),
  computed: {
    submitDisabled(){
      return !this.formData.pass1.length || !this.formData.pass2.length || (this.formData.pass1 !== this.formData.pass2);
    }
  },
  methods: {
    submited(d) {
      window.document.location.href = bbn.env.root;
    },
    validation(d){
      if ( this.submitDisabled ){
        this.alert(bbn._('Passwords must match!'));
        return false;
      }
      return true;
    }
  },
  mounted() {
    this.$nextTick(() => {
      $("body > div.appui-password").animate({opacity: 1}, 2000).find("input:visible:first").focus();
    });
  }
});
