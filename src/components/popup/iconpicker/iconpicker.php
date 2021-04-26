<div class="appui-iconpicker bbn-overlay bbn-w-100 bbn-c">
  <div class="bbn-flex-height">
    <div class="bbn-w-100 bbn-c" style="padding: 0 1em 1em 0">
      <bbn-input style="width: 25em"
                 :placeholder="getTotal"
                 v-model="toSearch"
      ></bbn-input>
    </div>
    <div class="bbn-flex-fill">
      <bbn-scroll v-if="isReady">
        <div class="btn-icon bbn-iblock bbn-smargin"  v-for="(icon, idx) in icons">
          <bbn-button :key="idx"
                      class="bbn-c bbn-100"
                      @click="selectIcon(icon)"
                      :title="icon"
                      :icon="icon"/>
        </div>
      </bbn-scroll>
      <div v-else class="bbn-overlay bbn-middle">
        <?=_('LOADING ICONS')?>
      </div>
    </div>
  </div>
</div>
