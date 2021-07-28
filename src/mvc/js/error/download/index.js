// Javascript Document
// Javascript Document
document.addEventListener("DOMContentLoaded", () => {
  bbn.vue.init({
    env: {
      //lang: data.lang,
      connection_failures: 0,
      connection_max_failures: 10,
      //logging: data.is_dev || data.is_test,
    }
  });

  new Vue({
    el: 'div.appui-errors',
    data(){
      return{
        logo: false,
        message: false//'Message opzionale'
      }
    }
  });
});