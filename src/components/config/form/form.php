<!-- HTML Document -->
<component :is="source.item.editable ? 'bbn-form' : 'div'"
           :scrollable="source.item.editable ? false : undefined"
           :source="source.item.editable ? formData : undefined"
           :data="source.data"
           @success="success"
           :action="source.item.editable ? source.root + 'actions/settings' : undefined">
  <div class="bbn-padding">
    <div v-if="source.item.viewable"
         v-text="source.value">
    </div>
    <component v-else-if="typeof source.item.editable === 'string'"
               :source="formData"
               :is="source.item.editable">
    </component>
    <bbn-dropdown v-else-if="source.item.source"
                  :source="source.item.source"
                  class="bbn-w-100"
                  v-model="formData.value">
    </bbn-dropdown>
    <bbn-input v-else-if="source.item.editable"
               class="bbn-w-100"
               v-model="formData.value">
    </bbn-input>
  </div>
</component>