bbn.fn.init({
  env: {
    lang: data.lang,
    connection_failures: 0,
    connection_max_failures: 10,
    logging: data.is_dev || data.is_test,
  }
});

let ele =  document.querySelector("body > div.appui-password");
new Vue({
  el: ele,
  props: {
    zIndex: {
      type: Number,
      default: 1
    }
  },
  data(){
    return bbn.fn.extend({
      ready: false,
      formData: {
        appui_action: 'init_password',
        id: data.id,
        key: data.key,
        pass1: '',
        pass2: ''
      },
      isMobile: bbn.fn.isMobile(),
      isTablet: bbn.fn.isTabletDevice(),
      passwordVisible: false
    }, data)
  },
  computed: {
    submitDisabled(){
      return !this.formData.pass1.length || !this.formData.pass2.length || (this.formData.pass1 !== this.formData.pass2);
    }
  },
  methods: {
    submited(d) {
      if (d) {
        if (d.success) {
          window.document.location.href = bbn.env.root;
        }
        else if (d && d.errorMessage) {
          this.$refs.notification.error(d.errorMessage)
        }
      }
    },
    validation(d){
      if ( this.submitDisabled ){
        this.alert(bbn._('Passwords must match!'));
        return false;
      }
      return true;
    },
    setEvents(ref){
      this.$refs[ref].$on('clickRightButton', () => {
        this.passwordVisible = !this.passwordVisible;
      });
    }
  },
  created(){
    if ( this.isMobile ){
      document.body.classList.add('bbn-mobile');
    }
    if ( this.isTablet ){
      document.body.classList.add('bbn-tablet');
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.ready = true;
      //$("body > div.appui-password").animate({opacity: 1}, 2000).find("input:visible:first").focus();
      this.$el.style.opacity = "1";
      this.$el.style.animationDuration = "2s";
      bbn.fn.each(ele.querySelectorAll("input"), (element, i) => {
        if ( (element.style.visibility === 'visible') ){
          element.focus();
          return false;
        }
      });
    });
  }
});
