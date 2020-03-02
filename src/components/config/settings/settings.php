<div class="bbn-padded appui-core-config-settings">
  <div class="bbn-section" v-for="schema in source.schema">
    <div class="bbn-legend" v-text="schema.text"></div>
    <div class="bbn-grid-fields">
      <template v-for="(item, idx) in schema.items">
        <div class="bbn-label">
          <bbn-button v-if="item.desc"
                      icon="nf nf-mdi-help_circle_outline"
                      @click="getPopup().alert(item.desc, '<?=_('Description')?>')"
                      :notext="true">
          </bbn-button> &nbsp; 
          <span v-text="item.text"></span>
        </div>
        <div>
          <bbn-button v-if="item.viewable"
                      icon="nf nf-fa-eye"
                      @click="open(item)"
                      :notext="true">
          </bbn-button>
          <bbn-button v-else-if="item.editable"
                      icon="nf nf-fa-edit"
                      @click="open(item)"
                      :notext="true">
          </bbn-button> &nbsp; 
          <span v-text="item.viewable ? '**********' : source.settings[item.name]"></span>
        </div>
      </template>
    </div>
  </div>
</div>