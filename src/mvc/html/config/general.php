<!-- HTML Document -->
<div class="bbn-padded">
  <h2 v-text="source.composer.name"></h2>
  <h5 v-html="source.composer.description"></h5>
  <div class="bbn-grid-fields">
    <template v-for="(v, k) in source.settings">
    	<label v-text="k"></label>
      <bbn-input v-model="source.settings[k]" :readonly="true"></bbn-input>
    </template>
  </div>
  <ul>
  </ul>
</div>