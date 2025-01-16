(() => {
  return {
    mixins: [bbn.cp.mixins.basic],
    data() {
      return {
        root: appui.plugins['appui-core'] + '/'
      };
    },
    computed: {
      powerMenu(){
        if (!appui.plugins?.['appui-core']) {//} || !this.app || !this.app.user || (!this.app.user.isAdmin && !this.app.user.isDev)) {
          return [];
        }

        return [
          {
            action: () => {
              this.confirm(
                bbn._("Are you sure you want to delete the browser storage?"),
                () => {
                  window.localStorage.clear();
                  this.$nextTick(() => {
                    document.location.reload();
                  });
                }
              );
            },
            text: bbn._("Reload with a fresh view"),
            icon: 'nf nf-md-sync_alert'
          }, {
            text: bbn._("Increase version"),
            icon: 'nf nf-oct-versions',
            action: () => {
              bbn.fn.post(appui.plugins['appui-core'] + '/service/increase').then(() => {
                if (window.bbnSW) {
                  window.bbnSW.unregister().then(() => {
                    document.location.reload();
                  });
                }
                else {
                  this.$nextTick(() => document.location.reload());
                }
              });
            }
          }
        ];
      },
      mode(){
        return bbn.env.mode;
      },
      appMode(){
        if (this.mode === 'dev') {
          return bbn._("Application in development mode");
        }

        if (this.mode === 'prod') {
          return bbn._("Application in production mode");
        }

        if (this.mode === 'test') {
          return bbn._("Application in testing mode");
        }
      },
      powerColor(){
        if (this.mode === 'dev') {
          return 'var(--purple)';
        }

        if (this.mode === 'prod') {
          return 'var(--green)';
        }

        if (this.mode === 'dev') {
          return 'var(--blue)';
        }

        return '';
      },
    }
  }
})();