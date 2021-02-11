// Javascript Document
(() => {
  // Vue object
  return {
    data(){
      return {
      }
    },
    components: {
      node: {
        props: ['source'],
        template: `
<div class="bbn-iblock">
	<span class="bbn-iblock bbn-hmargin">
  	<i :class="source.icon || 'nf nf-custom-folder'"> </i>
  </span>
  <span :class="{
    'bbn-green': source.error === undefined,
    'bbn-red': source.error === 'none',
    'bbn-blue': source.error === 'different'
    }"
    v-text="source.text + (source.code ? ' (' + source.code + ')' : '')">
  </span>
</div>

`
      }
    }
  }
})()