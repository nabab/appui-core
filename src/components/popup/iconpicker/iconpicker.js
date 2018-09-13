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
        root: 'core/'
      }
    },
    computed: {
      getTotal(){
        return bbn._('Search in') + ' ' + this.total.toString() + ' ' + bbn._('icons');
      },
      icons(){
        if ( this.toSearch ){
          return this.allIcons.filter(icon => icon.search(this.toSearch.toLowerCase()) > -1);
        }
        return this.allIcons;
      }
    },
    methods: {
      selectIcon(icon){
        this.source.obj[this.source.field] = icon;
        bbn.vue.closest(this, 'bbn-popup').close();
      }
    },
    created(){
      bbn.fn.post(this.root + 'iconology/iconpicker', (d) => {
        if ( d.success && d.data.icons && d.data.total ){
          this.allIcons = d.data.icons;
          this.total = d.data.total;
          this.isReady = true;
        }
      });
    }
  }
})();
