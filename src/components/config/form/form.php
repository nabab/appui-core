<!-- HTML Document -->
<component :is="source.item.editable ? 'bbn-form' : 'div'"
           :scrollable="false"
           :source="source"
           :action="source.root + 'actions/settings'">
  <div class="bbn-padded">
    <div v-if="source.item.viewable"
         v-text="source.value">
    </div>
    <bbn-dropdown v-else-if="source.item.source"
                  :source="source.item.source"
                  class="bbn-w-100"
                  v-model="source.value">
    </bbn-dropdown>
    <bbn-input v-else-if="source.item.editable"
               class="bbn-w-100"
               v-model="source.value">
    </bbn-input>
  </div>
</component>