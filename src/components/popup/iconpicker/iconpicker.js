/**
 * Created by BBN Solutions.
 * User: Mirko Argentino
 * Date: 20/02/2018
 * Time: 18:04
 */
(() => {
  return {
    props: ['source'],
    data(){
      return {
        isReady: false,
        allIcons: [],
        total: 0,
        toSearch: '',
        toSearchFix: '',
        timeout: false,
        root: appui.plugins['appui-core'] + '/'
      }
    },
    computed: {
      getTotal(){
        return bbn._('Search in') + ' ' + this.total.toString() + ' ' + bbn._('icons');
      },
      icons(){
        if ( this.toSearchFix ){
          return this.allIcons.filter(icon => icon.search(this.toSearchFix.toLowerCase()) > -1);
        }

        return this.allIcons;
      }
    },
    methods: {
      selectIcon(icon){
        this.source.obj[this.source.field] = icon;
        this.closest('bbn-popup').close();
      }
    },
    watch: {
      toSearch(newVal) {
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
          this.toSearchFix = newVal;
        }, 500);
      },
    },
    created(){
      this.post(this.root + 'iconology/iconpicker', (d) => {
        if ( d.success && d.data.icons && d.data.total ){
          this.allIcons = d.data.icons;
          this.total = d.data.total;
          this.isReady = true;
        }
      });
    }
  }
})();
