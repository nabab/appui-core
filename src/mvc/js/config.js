// Javascript Document
/* jslint esversion: 6 */
(() => {
  return {
    props: ['source'],
    data(){
      return {
        visible: true,
        num: this.source.current,
        envIndex: this.source.hostname + '---' + this.source.app_path,
        originalIndex: this.source.hostname + '---' + this.source.app_path,
        originalAliases: bbn.fn.extend({}, this.source.aliases)
      }
    },
    computed: {
      root(){
        return bbn.fn.get_field(this.source.plugins, {name: 'appui-core'}, 'url') + '/';
      },
      currentEnvironment(){
        let idx = bbn.fn.search(this.envs, {value: this.envIndex});
        return this.source.environments[idx] || false;
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
          return {value: a.hostname + '---' + a.app_path, text: a.hostname + ' ' + bbn._('in') + ' ' + a.app_path};
        });
      }
    },
    methods: {
      routeSave(row, e){
        e.preventDefault();
        let table = this.getRef('aliases-table');
        let action = table.tmpRow !== false ? 'insert' : 'update';
        let ok = false;
        let err = bbn._('All the fields are mandatory');
        if (row.url && row.path) {
          if (action === 'insert') {
            if (bbn.fn.get_row(this.source.aliases, {url: row.url})) {
              err = bbn._("This URL is already registered")
            }
            else if (bbn.fn.get_row(this.source.plugins, {url: row.url})) {
              err = bbn._("This URL is already registered as a plugin")
            }
            else {
              ok = true;
            }
          }
          else if (bbn.fn.get_row(this.source.plugins, {url: row.url})) {
            err = bbn._("This URL is already registered as a plugin")
          }
          else {
            ok = true;
          }
        }
        if (!ok) {
          appui.error(err);
          return;
        }
        let obj = {
          url: row.url,
          path: row.path,
          action: action
        };
        if (action === 'update') {
          obj.index = table.editedIndex;
        }
        this.post(this.root + 'actions/settings', obj, (d) => {
          if (d.success) {
            if (action === 'insert') {
              this.source.aliases.push(row);
              table.tmpRow = false;
            }
            else if (table.currentData[table.editedIndex]) {
              bbn.fn.log("UPDATED?", table.currentData[table.editedIndex]);
              table.editedRow = false;
              table.editedIndex = null;
            }
            table.updateData();
            appui.success(bbn._('Modification saved successfully'));
          }
          else {
            appui.error();
          }
        });
      },
      pluginSave(row, e){
        e.preventDefault();
        let table = this.getRef('oplugins-table');
        let action = table.tmpRow !== false ? 'insert' : 'update';
        let ok = false;
        let err = bbn._('All the fields are mandatory');
        if (row.url && row.path) {
          if (action === 'insert') {
            if (bbn.fn.get_row(this.source.aliases, {url: row.url})) {
              err = bbn._("This URL is already registered")
            }
            else if (bbn.fn.get_row(this.source.plugins, {url: row.url})) {
              err = bbn._("This URL is already registered as a plugin")
            }
            else {
              ok = true;
            }
          }
          else if (bbn.fn.get_row(this.source.plugins, {url: row.url})) {
            err = bbn._("This URL is already registered as a plugin")
          }
          else {
            ok = true;
          }
        }
        if (!ok) {
          appui.error(err);
          return;
        }
        let obj = {
          url: row.url,
          path: row.path,
          action: action
        };
        if (action === 'update') {
          obj.index = table.editedIndex;
        }
        this.post(this.root + 'actions/settings', obj, (d) => {
          if (d.success) {
            if (action === 'insert') {
              this.source.aliases.push(row);
              table.tmpRow = false;
            }
            else if (table.currentData[table.editedIndex]) {
              bbn.fn.log("UPDATED?", table.currentData[table.editedIndex]);
              table.editedRow = false;
              table.editedIndex = null;
            }
            table.updateData();
            appui.success(bbn._('Modification saved successfully'));
          }
          else {
            appui.error();
          }
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