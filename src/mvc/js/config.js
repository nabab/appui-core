// Javascript Document
/* jslint esversion: 6 */
(() => {
  return {
    props: ['source'],
    data(){
      return {
        visible: true,
        num: this.source.current
      }
    },
    computed: {
      root(){
        return bbn.fn.get_field(this.source.plugins, {name: 'appui-core'}, 'url') + '/';
      },
      advisedSource() {
        let r = [];
        bbn.fn.iterate(this.source.oplugins, o => {
          let row = bbn.fn.get_row(this.source.plugins, {name: o.sname});
          let tmp = bbn.fn.extend({}, o);
          tmp.url = row ? row.url : null;
          r.push(tmp);
        });
        return r;
      },
      devSource() {
        let r = [];
        bbn.fn.iterate(this.source.plugins, o => {
          let row = bbn.fn.get_row(this.source.oplugins, {sname: o.name});
          if (!row) {
            r.push(bbn.fn.extend({}, o, row));
          }
        });
        return r;
      },
      envs(){
        return this.source.environments.map((a, i) => {
          return {value: i, text: a.hostname + ' in ' + a.app_path}
        });
      }
    },
    watch: {
      num(){
        this.visible = false;
        setTimeout(() => {
          this.visible = true;
        }, 150)
      }
    }
  };
})();