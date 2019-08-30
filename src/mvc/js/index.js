/* jslint esversion: 6 */
(() => {
  return (data) => {
    bbn.fn.autoExtend('env', {
      logging: data.is_dev || data.is_test ? true : false,
      isDev: data.is_dev ? true : false,
      lang: data.lang,
      siteTitle: data.site_title,
      wp_url: data.wp_url,
      token: data.token,
      connection_failures: 0,
      connection_max_failures: 10,
      money: data.money,
      appPrefix: data.app_prefix,
      plugins: data.plugins
    });
    bbn.fn.autoExtend('lng', {
      select_unselect_all: bbn._('(Un)Select all'),
      search: bbn._('Search'),
      close: bbn._('Close'),
      closeAll: bbn._('Close all'),
      closeOthers: bbn._('Close others'),
      pin: bbn._('Pin'),
      unpin: bbn._('Unpin')
    });
    bbn.fn.autoExtend('opt', data.options);
    bbn.fn.extend(bbn.lng, data.lng);

    Vue.config.devtools = !!data.is_dev;

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
        bbn.vue.queueComponent(tag, path + '/components/' + bbn.fn.replaceAll('-', '/', tag).substr(name.length + 1), null, resolve, reject);
      });
    });
    bbn.vue.addPrefix(
      data.app_prefix,
      (tag, resolve, reject, mixins) => {
        bbn.vue.queueComponent(
          tag,
          'components/' + bbn.fn.replaceAll('-', '/', tag).substr((data.app_prefix + '-').length),
          mixins,
          resolve,
          reject
        );
      },
      bbn.fn.extend(true, {}, {
        methods: {
          getTab(){
            return bbn.vue.closest(this, 'bbns-container');
          },
          popup(){
            return this.getTab().popup.apply(this, arguments);
          }
        }
      }, js_data.componentsMixin)
    );

    bbn.vue.initDefaults({
      appui: {
        root: data.root,
        list: data.list,
        tabnav: true,
        status: true,
        header: true,
        clipboard: true,
        logo: data.logo,
        pollable: (data.pollable === undefined) || data.pollable,
        leftShortcuts: [{
          url: 'dashboard/home',
          text: bbn._("Dashboard"),
          icon: 'nf nf-fa-tachometer'
        }, {
          command(){
            appui.popup().load({
              url: 'help',
              width: '90%',
              height: '90%',
              scrollable: false
            });
          },
          text: bbn._("Help"),
          icon: 'nf nf-mdi-help_circle_outline'
        }, {
          url: 'usergroup/main',
          text: bbn._("My profile"),
          icon: 'nf nf-fa-user'
        }],
        rightShortcuts: [{
          command(){
            bbn.fn.toggle_full_screen();
          },
          text: bbn._("Full screen"),
          icon: 'nf nf-fa-arrows_alt'
        }, {
          command(){
            window.store.remove('tabnav');
            document.location.reload();
          },
          text: bbn._("Reload with a fresh view"),
            icon: 'nf nf-mdi-sync_alert'
        }, {
          text: bbn._("Log out"),
          icon: 'nf nf-fa-sign_out',
          command(){
            bbn.fn.post('core/logout').then(() => {
              document.location.reload();
            });
          }
        }],
      }
    });

    let appuiMixin = {
      data: {
        options: data.options,
        menus: data.menus,
        plugins: data.plugins,
        currentMenu: data.current_menu,
        shortcuts: data.shortcuts,
        app: {

          data(){
            return data.app
          },
          computed: {
            userName(){
              return bbn.fn.get_field(this.users, {value: this.user.id}, 'text') || bbn._('Unknown')
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
                }), 'text', 'ASC');
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
  };
})();