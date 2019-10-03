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
      setTimeout(() => {
        let ele =  document.querySelector("div.appui-login");
        ele.style.opacity = '1';
        bbn.fn.each(ele.querySelectorAll("input"), (element, i) => {
          if ( (element.style.visibility === 'visible') ){
            element.focus();
            return false;
          }        
        })
      }, 500);
      setTimeout(() => {
        document.querySelector("div.appui-login").innerHTML = `
<h2>`+ bbn._('Refresh the page to be able to log in or click') + ` <a class="bbn-p" onclick="window.location.reload();">` + bbn._('HERE') + `</a></h2>`;
      }, 1200000); // 20 minutes    
    });
    window.addEventListener('resize', this.setHeight);
  },
  beforeDestroy(){
    window.removeEventListener('resize', this.setHeight);
  },
});
