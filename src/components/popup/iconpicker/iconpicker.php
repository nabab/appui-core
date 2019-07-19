<div class="appui-icon-picker bbn-overlay">
  <div class="bbn-flex-height">
    <div class="bbn-w-100 bbn-c" style="padding: 0 1em 1em 0">
      <bbn-input style="width: 300px"
                 :placeholder="getTotal"
                 v-model="toSearch"
      ></bbn-input>
    </div>
    <div class="bbn-flex-fill">
      <bbn-scroll v-if="isReady">
        <bbn-button v-for="(icon, idx) in icons"
                    :key="idx"
                    class="btn-icon bbn-middle"
                    @click="selectIcon(icon)"
                    :title="icon"
                    :icon="icon"
                    style="width:45px; height:45px"
        ></bbn-button>
      </bbn-scroll>
      <div v-else class="bbn-overlay bbn-middle">
        <?=_('LOADING ICONS')?>
      </div>
    </div>
  </div>
</div>
