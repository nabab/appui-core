/* jslint esversion: 6 */
(() => {
  return (data) => {
    //bbn.fn.log(["DATA SENT TO INDEX JS", data]);
    const slots = bbn.fn.createObject();
    if (data.slots) {
      bbn.fn.iterate(data.slots, (arr, slot) => {
        slots[slot] = [];
        bbn.fn.iterate(arr, a => {
          try {
            let tmp = eval(a.script);
            if (bbn.fn.isObject(tmp)) {
              if (a.content) {
                tmp.template = a.content;
              }
              slots[slot].push({
                cp: bbnData.immunizeValue(tmp),
                data: a.data || {}
              });
            }
          }
          catch (e) {
            bbn.fn.log(a, slot, e);
            bbn.fn.error(bbn._("Impossible to read the slot %s in %s", slot, a.name));
          }
        });
      });
    }

    bbn.fn.init({
      env: {
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
        cdn: data.shared_path,
        theme: data.theme
      },
      lng: bbn.fn.extend(true, {}, data.lng || {}),
      opt: data.options || {}
    });
    let js_data = {};
    if (data.js_data) {
      js_data = eval(data.js_data) || {};
      //bbn.fn.log("JSDATA CREATED", js_data);
    }

    if (!js_data.cfg) {
      js_data.cfg = {};
    }
    const cfg = {
      header: true,
      nav: true,
      status: true,
      splittable: true,
      list: [
        {
          url: data.plugins['appui-core'] + '/home',
          label: bbn._("Home"),
          load: true,
          fixed: true,
          icon: 'nf nf-fa-home'
        }
      ],
      browserNotification: true
    };
    for (let n in cfg) {
      if (js_data.cfg?.[n] === undefined) {
        js_data.cfg[n] = cfg[n];
      }
    }

    const urlPrefix = 'components/';
    bbn.fn.each(data.plugins, (path, name) => {
      bbn.cp.addUrlAsPrefix(
        name,
        urlPrefix,
        bbn.cp.mixins.basic
      );
    });
    const methods = {
      getTab(){
        return this.closest('bbns-container');
      },
      popup(){
        return this.getTab().popup.apply(this, arguments);
      }
    };
    if (js_data.app && js_data.app.methods) {
      for (let n in js_data.app.methods) {
        methods[n] = (...args) => appui.app[n](...args)
      }
    }
    bbn.cp.addUrlAsPrefix(
      bbn.env.appPrefix,
      urlPrefix,
      {methods}
    );

  
    /*
    bbn.fn.each(data.plugins, (path, name) => {
      bbn.cp.addPrefix(name, (tag, resolve, reject) => {
        bbn.cp.queueComponent(tag, path + '/components/' + bbn.fn.replaceAll('-', '/', tag).substr(name.length + 1), null, resolve, reject);
      });
    });


    bbn.cp.addPrefix(
      data.app_prefix,
      (tag, resolve, reject, mixins) => {
        bbn.cp.queueComponent(
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
            return this.closest('bbns-container');
          },
          popup(){
            return this.getTab().popup.apply(this, arguments);
          }
        }
      }, js_data.componentsMixin)
    );
    */

    bbn.cp.initDefaults({
      appui: {
        /*
        root: data.root,
        list: [{
          source: data.list || js_data.appuiMixin.list
        }],
        /*
        nav: true,
        status: true,
        header: true,
        footer: false,
        broserNotification: true,
        clipboard: true,
        logo: data.logo,
        pollable: (data.pollable === undefined) || data.pollable,
        theme: data.theme
        */
      }
    });

    if (window.dayjs !== undefined) {
      dayjs.updateLocale(bbn.env.lang, {
        calendar: {
          lastDay: '[' + bbn._('Yesterday at') + '] LT',
          sameDay: '[' + bbn._('Today at') + '] LT',
          nextDay: '[' + bbn._('Tomorrow at') + '] LT',
          lastWeek: '[' + bbn._('last') + '] dddd [' + bbn._('at') + '] LT',
          nextWeek: 'dddd [' + bbn._('at') + '] LT',
          sameElse: 'L'
        }
      });
    }

    window.app = bbn.cp.createApp(document.body.querySelector('div.appui'), {
      data() {
        return {
          appSlots: slots,
          options: data.options,
          plugins: data.plugins,
          browserNotification: true,
          cfg: js_data.cfg,
          app: {
            ...js_data.app,
            data() {
              return data.app
            }
          },
          users: data.users,
          user: data.user,
          groups: data.groups,
        }
      },
      methods: {
        init() {
          this.$el.parentNode.style.opacity = 1;
        },
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
      },
      created(){
        if ( this.isMobile ){
          document.body.classList.add('bbn-mobile');
        }
        if ( this.isTablet ){
          document.body.classList.add('bbn-tablet');
        }
      },
    });
  };
})();
