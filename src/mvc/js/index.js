/* jslint esversion: 6 */
bbn.fn.init({
  env: {
    logging: data.is_dev || data.is_test ? true : false,
    isDev: data.is_dev ? true : false,
    lang: data.lang,
    siteTitle: data.site_title,
    wp_url: data.wp_url,
    token: data.token,
    connection_failures: 0,
    connection_max_failures: 10,
    money: data.money
  },
  fn: {
    defaultAjaxErrorFunction: function (jqXHR, textStatus, errorThrown) {
      /** @todo */
      appui.error({title: textStatus, content: errorThrown}, 4);
      return false;
    },

    defaultHistoryFunction: function (state) {
      var r = [];
      /** @todo */
      /*
      if ((i = appui.tabnav.ele.tabNav("search", state.data.url)) > -1) {
        appui.tabnav.ele.tabNav("activate", state.data.url);
        var t = [];
        return false;
      }
      */
      return 1;
    },

    defaultPreLinkFunction: function (url, force, ele) {
      if (url === 'logout') {
        url = (data.plugins['appui-core'] ? data.plugins['appui-core'] + '/' : '') + url;
        bbn.fn.post(url);
        return false;
      }
      if ( appui.$refs.tabnav ){
        appui.$refs.tabnav.activate(url, force);
      }
      return false;
    },

    defaultAlertFunction: function(ele) {
      /** @todo */
      appui.alert.apply(appui, arguments);
    },

    defaultStartLoadingFunction: function(url, id){
      if ( window.appui && appui.$refs.loading ){
        appui.$refs.loading.start(url, id);
        return id;
      }
    },

    defaultEndLoadingFunction: function(url, id, data, res){
      if ( window.appui && appui.$refs.loading ){
        appui.$refs.loading.end(url, id, data, res);
      }
    },

    fdate: function (d, wrong_result) {
      var r;
      if ((typeof(d) === 'string') && (d.length > 5) && (d.substring(d.length - 5, d.length - 4) === '.')) {
        d = Math.floor(d);
      }
      if ((typeof(d) === 'number') && (d > 0)) {
        if (d < 10000000000) {
          d = d * 1000;
        }
        r = new Date(d);
      }
      else {
        try {
          r = kendo.parseDate(d);
        }
        catch (err) {
          r = d;
        }
      }
      if (!r) {
        return wrong_result ? wrong_result : '';
      }
      if (r.isSame && r.isSame(new Date())) {
        r = kendo.toString(r, 'H:mm');
        if (r === '0:00') {
          r = bbn._("Today");
        }
        return r;
      }
      else {
        return kendo.toString(r, 'd');
      }
    },

  },
  lng: {
    select_unselect_all: bbn._('(Un)Select all'),
    search: bbn._('Search'),
    close: bbn._('Close'),
    closeAll: bbn._('Close all'),
    closeOthers: bbn._('Close others'),
    pin: bbn._('Pin'),
    unpin: bbn._('Unpin')
  },
  opt: data.options
});
$.extend(bbn.lng, data.lng);

Vue.config.errorHandler = function (err, vm, info) {
  // handle error
  // `info` is a Vue-specific error info, e.g. which lifecycle hook
  // the error was found in. Only available in 2.2.0+
  bbn.fn.log("ERROR handler from VueJS", err, vm, info);
};
let js_data = {};
if ( data.js_data ){
  js_data = eval(data.js_data) || {};
}
if ( !js_data.appuiMixin ){
  js_data.appuiMixin = {};
}
if ( !js_data.componentsMixin ){
  js_data.componentsMixin = {};
}
bbn.fn.each(data.plugins, (path, name) => {
  bbn.vue.addPrefix(name, (tag, resolve, reject) => {
    bbn.fn.log(tag, path + '/components/' + bbn.fn.replaceAll('-', '/', tag).substr(name.length + 1));
    bbn.vue.queueComponent(tag, path + '/components/' + bbn.fn.replaceAll('-', '/', tag).substr(name.length + 1), null, resolve, reject);
  });
});
bbn.vue.addPrefix(
  data.app_prefix,
  (tag, resolve, reject, mixins) => {
    bbn.fn.log("ADDING PREFIX", tag, data.app_prefix, mixins);
    bbn.vue.queueComponent(
      tag,
      'components/' + bbn.fn.replaceAll('-', '/', tag).substr((data.app_prefix + '-').length),
      mixins,
      resolve,
      reject
    );
  },
  $.extend(true, {}, {
    methods: {
      getTab(){
        return bbn.vue.closest(this, 'bbns-tab');
      },
      popup(){
        return this.getTab().popup.apply(this, arguments);
      }
    }
  }, js_data.componentsMixin)
);

let appuiMixin = {
  data: {
    root: data.root,
    options: data.options,
    menus: data.menus,
    plugins: data.plugins,
    currentMenu: data.current_menu,
    shortcuts: data.shortcuts,
    logo: data.logo,
    list: data.list,
    leftShortcuts: [{
      url: 'dashboard',
      text: bbn._("Dashboard"),
      icon: 'fas fa-tachometer-alt'
    }, {
      command(){
        appui.popup().load('help', '90%', '90%');
      },
      text: bbn._("Help"),
      icon: 'zmdi zmdi-help-outline'
    }, {
      url: 'usergroup/main',
      text: bbn._("My profile"),
      icon: 'fas fa-user'
    }],
    rightShortcuts: [{
      command(){
        bbn.fn.toggle_full_screen();
      },
      text: bbn._("Full screen"),
      icon: 'fas fa-arrows-alt'
    }, {
      url: 'logout',
      text: bbn._("Log out"),
      icon: 'fas fa-sign-out-alt'
    }],
    app: {

      data(){
        return data.app
      },
      computed: {
        userName(){
          return bbn.fn.get_field(this.users, {value: this.user.id}, 'text') || bbn._('Unnown')
        }
      },
      methods: {
        link_email: function(em){
          return em ? '<a href="mailto:'+em+'">'+em+'</a>' : '<em>non défini</em>';
        },

        getUserName: function(id){
          return bbn.fn.get_field(this.users, "value", id, "text");
        },

        getUserGroup: function(id){
          return bbn.fn.get_field(this.users, "value", id, "id_group");
        },

        getActiveUsers() {
          if ( bbn.fn.isArray(appui.app.users) ){
            return bbn.fn.order(appui.app.users.filter(user => {
              return !!user.active;
            }), 'text', 'DESC');
          }
          return [];
        },

        historique_type: function(d){
          var op;
          if ( (typeof(d.operation) !== 'undefined') &&
            (op = bbn.fn.get_row(this.historiques, "value", d.operation)) ){
            return '<span style="color:' + op.color + '">' + op.text + '</span>';
          }
          return "";
        },

      }
    }
  },
  methods: {
    setImessage(e){
      if ( (e.hidden !== undefined) && e.id ){
        bbn.fn.post(this.root + 'actions/imessage', e, (r) => {
          if ( r.success ){
            appui.success(bbn._('Saved'));
          }
          else {
            appui.error(bbn._('Error'));
          }
        });
      }
    }
  }
};
new Vue({
  el: 'div.appui',
  mixins: [appuiMixin, js_data.appuiMixin],
});