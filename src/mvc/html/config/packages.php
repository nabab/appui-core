<!-- HTML Document -->
<div class="bbn-padded">
  <h2>
    Composer
  </h2>
  <div class="bbn-grid-fields">
    <label>Name</label>
    <bbn-input v-model="source.composer.name"></bbn-input>

    <label>Description</label>
    <bbn-textarea v-model="source.composer.description" class="bbn-w-100" rows="3"></bbn-textarea>
    
    <template v-for="pack in source.packages">
      <label v-text="pack.name"></label>
      <div v-text="pack.version"></div>
    </template>
  </div>
</div>