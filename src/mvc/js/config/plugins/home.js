// Javascript Document
(() => {
  let cp = this.
  return {
    computed: {
      gridSource() {
        let r = [];
        bbn.fn.iterate(this.source.plugins, o => {
          r.push({
            name: o.name,
            url: o.path
          });
        });
        return r;
      },
    },
    components: {
      gridUrl: {
        props: ['source'],
        template: `
<bbn-input v-model="cp.form.plugins[source.name]"
:disabled="cp.form.plugins[source.name] === undefined"
></bbn-input>`,
        data() {
          return {
            cp: cp
          }
        }
      },
      gridCheck: {
        props: ['source'],
        template: `
<bbn-checkbox :value="source.name"
:novalue="source.name"
@change="checkPlugin"
:checked="cp.form.plugins[source.name] !== undefined"
></bbn-checkbox>`,
        data() {
          return {
            cp: cp
          }
        },
        methods: {
          checkPlugin(val) {
            if (cp.form.plugins[val]) {
              cp.$delete(cp.form.plugins, val);
            } else {
              cp.$set(cp.form.plugins, val, cp.plugins[val]);
            }
          }
        }
      },
      gridCheckAll: {
        props: ['source'],
        template: `
<bbn-checkbox @change="checkAllPlugins"
:checked="allChecked"
></bbn-checkbox>`,
        data() {
          return {
            cp: cp
          }
        },
        computed: {
          allChecked() {
            return !Object.keys(cp.plugins).filter((v) => {
              return cp.form.plugins[v] === undefined;
            }).length;
          }
        },
        methods: {
          checkAllPlugins() {
            if (this.allChecked) {
              cp.$set(cp, 'selectedPlugins', {});
            } else {
              bbn.fn.each(cp.plugins, (v, i) => {
                if (cp.form.plugins[i] === undefined) {
                  cp.$set(cp.form.plugins, i, v);
                }
              });
            }
          }
        }
      }
    }
  };
})()