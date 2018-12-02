bbn.fn.init({
  env: {
    lang: data.lang,
    connection_failures: 0,
    connection_max_failures: 10,
		logging: data.is_dev || data.is_test,
  }
});

new Vue({
  el: 'div.appui-login',
  props: {
    zIndex: {
      type: Number,
      default: 1
    }
  },
  data: bbn.fn.extend({
    lostPassForm: false,
    lostPassFormData: {
      email: ''
    },
    clientHeight: document.documentElement.clientHeight
  }, data),
  methods: {
    submited(d){
      if ( d == 1 ){
        window.document.location.href = bbn.env.path;
      }
      else {
        this.alert(d, bbn.lng.error);
      }
    },
    lostPasssubmited(d){
      if ( d.success ){
        this.alert(bbn._('An email has been sent to') + ' ' + this.lostPassFormData.email, bbn._('Info'));
        this.hideLostPassForm();
      }
    },
    hideLostPassForm(){
      this.lostPassForm = false;
      this.lostPassFormData.email = '';
    },
    setHeight(){
      this.clientHeight = document.documentElement.clientHeight;
    }
  },
  mounted(){
    this.$nextTick(() => {
      $("body > div.appui-login").animate({opacity: 1}, 2000).find("input:visible:first").focus();
      setTimeout(() => {
        $('div.appui-login').empty().append(
          $('<h2/>')
            .text(bbn._('Refresh the page to be able to identify yourself or click '))
            .append(
              $('<a class="bbn-p"/>')
                .text(bbn._('HERE'))
                .click(() => {
                  window.location.reload();
                })
            )
        )
      }, 1000*60*20);
    });
    window.addEventListener('resize', this.setHeight);
  },
  beforeDestroy(){
    window.removeEventListener('resize', this.setHeight);
  },
});
