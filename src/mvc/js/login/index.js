bbn.fn.init({
  env: {
    lang: "en",
    connection_failures: 0,
    connection_max_failures: 10,
		logging: data.is_dev || data.is_test ? true : false,
  }
});

new Vue({
  el: 'div.appui-login',
  data: $.extend(data, {
		formData: {
			appui_salt: data.salt,
			user: '',
			pass: ''
		}
	}),
  methods: {
    submited(d){
      if ( d == 1 ){
        let action = bbn.env.path === 'logout' ? '.' : bbn.env.path;
        window.document.location.href = action;
      }
      else {
        appui.alert(d, bbn.lng.error);
      }
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
              $('<a/>')
                .text(bbn._('HERE'))
                .attr('href', 'javascript;')
                .click(() => {
                  window.location.reload();
                })
            )
        )
      }, 1000*60*20);
    });
  }
});
