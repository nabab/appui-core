<!-- HTML Document -->
<div class="bbn-padded">
  <div class="bbn-grid-fields">
    <div class="bbn-grid-full bbn-c">
      <bbn-dropdown :source="envs" v-model="num" class="bbn-wider"></bbn-dropdown>
    </div>
    <template v-for="(v, k) in source.environments[num]">
    	<label v-text="k"></label>
      <bbn-input v-model="source.environments[num][k]" :readonly="true"></bbn-input>
    </template>
  </div>
  <ul>
  </ul>
</div>