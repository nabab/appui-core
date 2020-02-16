<!-- HTML Document -->
<div class="bbn-padded">
  <div class="bbn-grid-fields">
    <template v-for="(v, k) in source">
    	<label v-text="k"></label>
      <bbn-input v-model="source[k]" :readonly="true"></bbn-input>
    </template>
  </div>
</div>