/* jslint esversion: 6 */
(() => {
  return (data) => {
    bbn.fn.autoExtend('env', {
      logging: data.is_dev || data.is_test ? true : false,
      isDev: data.is_dev ? true : false,
      mode: data.is_dev ? 'dev' : (data.is_test ? 'test' : 'prod'),
      lang: data.lang,
      siteTitle: data.site_title,
      wp_url: data.wp_url,
      token: data.token,
      connection_failures: 0,
      connection_max_failures: 10,
      money: data.money,
      appPrefix: data.app_prefix,
      appName: data.app_name,
      plugins: data.plugins,
      cdn: data.shared_path
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

    Vue.config.devtools = !!data.is_dev || !!data.is_test;

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
      js_data.appuiMixin = {
        header: true,
        nav: true,
        clipboard: true,
        status: true,
        footer: false,
        list: [
          {
            url: appui.plugins['appui-core'] + '/home',
            title: bbn._("Home"),
            load: true,
            static: true,
            icon: 'nf nf-fa-home'
          }
        ],
        searchBar: false,
        broserNotification: true
      };
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

    let rightShortcuts = [{
      action(){
        bbn.fn.toggleFullScreen();
      },
      text: bbn._("Full screen"),
      icon: 'nf nf-fa-arrows_alt'
    }, {
      action(){
				window.localStorage.clear();
        document.location.reload();
      },
      text: bbn._("Reload with a fresh view"),
        icon: 'nf nf-mdi-sync_alert'
    }, {
      text: bbn._("Log out"),
      icon: 'nf nf-fa-sign_out',
      action(){
        bbn.fn.post(appui.plugins['appui-core'] + '/logout', d => {
          if (d.success && d.data && d.data.url) {
            document.location.href = d.data.url;
          }
          else {
            appui.error();
          }
        });
      }
    }];

    if( data.app.user.isAdmin || data.app.user.isDev ){
      rightShortcuts.splice(2, 0, {
        text: bbn._("Increase version"),
        icon: 'nf nf-oct-versions',
        action(){
          bbn.fn.post(appui.plugins['appui-core'] + '/service/increase').then(() => {
            document.location.reload();
          });
        } 
      })
    }
    bbn.vue.initDefaults({
      appui: {
        root: data.root,
        list: [{
          source: data.list || js_data.appuiMixin.list
        }],
        nav: true,
        status: true,
        header: true,
        footer: false,
        clipboard: true,
        broserNotification: true,
        logo: data.logo,
        pollable: (data.pollable === undefined) || data.pollable,
        leftShortcuts: [{
          url: data.plugins['appui-dashboard'] + '/home',
          text: bbn._("Dashboard"),
          icon: 'nf nf-fa-dashboard'
        }, {
          action(){
            appui.popup().load({
              url: data.plugins['appui-core'] + '/help',
              width: '90%',
              height: '90%',
              scrollable: false
            });
          },
          text: bbn._("Help"),
          icon: 'nf nf-mdi-help_circle_outline'
        }, {
          url: data.plugins['appui-usergroup'] + '/main',
          text: bbn._("My profile"),
          icon: 'nf nf-fa-user'
        }],
        rightShortcuts: rightShortcuts,
        theme: data.theme
      }
    });

    let appuiMixin = {
      data: {
        options: data.options,
        menus: data.menus,
        plugins: data.plugins,
        currentMenu: data.current_menu,
        shortcuts: data.shortcuts,
        browserNotification: true,
        app: {
          data(){
            return data.app
          },
          computed: {
            userName(){
              return bbn.fn.getField(this.users, 'text', {value: this.user.id}) || bbn._('Unknown')
            }
          },
          methods: {
            link_email: function(em){
              return em ? '<a href="mailto:'+em+'">'+em+'</a>' : '<em>non défini</em>';
            },

            getUserName: function(id){
              return bbn.fn.getField(this.users, "text", "value", id);
            },

            getUserGroup: function(id){
              return bbn.fn.getField(this.users, "id_group", "value", id);
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
                (op = bbn.fn.getRow(this.historiques, "value", d.operation)) ){
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
      created(){
        if ( this.isMobile ){
          document.body.classList.add('bbn-mobile');
        }
        if ( this.isTablet ){
          document.body.classList.add('bbn-tablet');
        }
      }
    });
  };
})();
