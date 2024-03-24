<div class="bbn-iblock bbn-nowrap bbn-vmiddle">
  <bbn-input v-model="currentValue" class="bbn-right-space"/>
  <i :class="['bbn-xxl', 'bbn-right-space', currentValue]"
       :title="currentValue"
       v-if="currentValue"/>
  <bbn-button @click="browse"><?= _("Browse") ?></bbn-button>
</div>