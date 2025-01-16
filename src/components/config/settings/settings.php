<div class="bbn-w-100 appui-core-config-settings">
  <div class="bbn-section" v-for="schema in source.schema">
    <div class="bbn-legend" v-text="schema.text"></div>
    <div class="bbn-grid-fields">
      <template v-for="(item, idx) in schema.items">
        <div class="bbn-label">
          <div v-if="item.desc"
               class="bbn-p bbn-spadding bbn-iblock"
               @click="getPopup().alert(item.desc, '<?= _('Description') ?>')"
               :title="_('Description')">
            <i class="nf nf-md-help_circle_outline"></i>
          </div>
          <span v-text="item.text"></span>
        </div>
        <div>
          <div v-if="item.viewable"
               class="bbn-p bbn-spadding bbn-iblock"
               @click="open(item)"
               :title="_('View')">
            <i class="nf nf-fa-eye"></i>
          </div>
          <div v-else-if="item.editable"
               class="bbn-p bbn-spadding bbn-iblock"
               @click="open(item)"
               :title="_('Edit')">
            <i class="nf nf-fa-edit"></i>
          </div>
          <span v-if="item.name === 'db_connection'"
                v-html="dbText">
          </span>
          <span v-else
          			v-text="item.viewable ? '**********' : source.settings[item.name]"></span>
        </div>
      </template>
    </div>
  </div>
</div>