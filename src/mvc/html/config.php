<!-- HTML Document -->
<bbn-tabnav class="appui-core-config">
	<bbn-container url="general"
                 title="<?=_('General')?>"
                 :static="true"
                 :scrollable="true">
    <appui-core-config-settings :source="{
                                         schema: source.schema.settings,
                                         settings: source.settings,
                                         root: root
                                         }">
    </appui-core-config-settings>
  </bbn-container>
  <bbn-container url="environments"
                 title="<?=_('Environments')?>"
                 :static="true"
                 :scrollable="true">
    <div class="bbn-padded">
      <div class="bbn-w-100 bbn-c bbn-space-bottom">
        <bbn-dropdown :source="envs" v-model="num" class="bbn-wider"></bbn-dropdown>
      </div>
      <appui-core-config-settings v-if="visible && source.environments[num]"
                                  :source="{
                                           schema: source.schema.environment,
                                           settings: source.environments[num],
                                           root: root
                                           }">
      </appui-core-config-settings>
    </div>
  </bbn-container>
  <bbn-container url="routes"
                 title="<?=_('Routes')?>"
                 :static="true">
    <bbn-table :source="source.aliases"
               :toolbar="[{
                         text: '<?=_('New plugin')?>',
                         action: 'insert'
                         }]"
               editable="true">
      <bbns-column field="url"
                   title="<?=_('URL')?>"
                   :width="350">
      </bbns-column>
      <bbns-column field="path"
                   title="<?=_('Real path')?>">
      </bbns-column>
      <bbns-column field="path"
                   :width="100"
                   class="bbn-c"
                   title="<?=_('Action')?>"
                   :sortable="false"
                   :buttons="[{
                               text: '<?=_('Edit')?>',
                             	 icon: 'nf nf-fa-edit',
                             	 notext: true,
                               action: 'edit'
                             }, {
                               text: '<?=_('Delete')?>',
                             	 icon: 'nf nf-fa-times',
                             	 notext: true,
                               action: 'delete'
                             }]">
      </bbns-column>
    </bbn-table>
  </bbn-container>
  <bbn-container url="plugins"
                 title="<?=_('Plugins')?>"
                 :static="true">
    <bbn-tabnav class="bbn-overlay" default="official">
      <bbn-container url="official"
                     title="<?=_('Official plugins')?>"
                     :static="true">
        <bbn-table :source="advisedSource"
                   :editable="true">
          <bbns-column title="<?=_('Name')?>"
                       :width="150"
                       field="sname">
          </bbns-column>
          <bbns-column title="<?=_('URL')?>"
                       field="url"
                       :width="250">
          </bbns-column>
          <bbns-column title="<?=_('Description')?>"
                       field="description">
          </bbns-column>
          <bbns-column field="path"
                       :width="100"
                       class="bbn-c"
                       title="<?=_('Action')?>"
                       :sortable="false"
                       :buttons="[{
                                   text: '<?=_('Edit')?>',
                                   action: 'edit',
                                   icon: 'nf nf-fa-edit',
                                   notext: true
                                 }, {
                                   text: '<?=_('Delete')?>',
                                   action: 'delete',
                                   icon: 'nf nf-fa-times',
                                   notext: true
                                 }]">
          </bbns-column>
        </bbn-table>
      </bbn-container>
      <bbn-container url="other"
                     title="<?=_('Other plugins')?>"
                     :static="true">
        <bbn-table :source="devSource"
                   :toolbar="[{
                             text: '<?=_('New plugin')?>',
                             action: 'insert'
                             }]"
                   :editable="true">
          <bbns-column title="<?=_('Name')?>"
                       :width="200"
                       field="name">
          </bbns-column>
          <bbns-column title="<?=_('Root')?>"
                       :width="100"
                       :source="[{text: _('Application'), value: 'app'}, {text: _('Library'), value: 'lib'}]"
                       field="root">
          </bbns-column>
          <bbns-column title="<?=_('URL')?>"
                       :width="250"
                       :component="$options.components['gridUrl']">
          </bbns-column>
          <bbns-column title="<?=_('Description')?>"
                       field="description">
          </bbns-column>
          <bbns-column field="path"
                       :width="100"
                       class="bbn-c"
                       title="<?=_('Action')?>"
                       :sortable="false"
                       :buttons="[{
                                   text: '<?=_('Edit')?>',
                                 	 notext: true,
                                   action: 'edit'
                                 }, {
                                   text: '<?=_('Delete')?>',
                                 	 notext: true,
                                   action: 'delete'
                                 }]">
          </bbns-column>
        </bbn-table>
      </bbn-container>
    </bbn-tabnav>
  </bbn-container>
  <bbn-container url="packages"
                  title="<?=_('Packages')?>"
                 :static="true"
                 :scrollable="true">
    <div class="bbn-padded">
      <h2>
        <?=_('Composer')?>
      </h2>
      <div class="bbn-grid-fields">
        <label><?=_('Name')?></label>
        <bbn-input v-model="source.composer.name"></bbn-input>

        <label><?=_('Description')?></label>
        <bbn-textarea v-model="source.composer.description" class="bbn-w-100" :rows="3"></bbn-textarea>

        <template v-for="pack in source.packages">
          <div class="bbn-label">
            <span v-text="pack.name"></span> &nbsp; 
            <bbn-button icon="nf nf-mdi-help_circle_outline"
                        :notext="true">
            </bbn-button>
            <bbn-button icon="nf nf-fa-times"
                        :notext="true">
            </bbn-button>
          </div>
          <div v-text="pack.version"></div>
        </template>
      </div>
      <div class="bbn-vpadded bbn-w-100">
        <bbn-button icon="nf nf-fa-plus"
                    text="<?=_('Add a new package')?>"
                    @click="addPackage()">
        </bbn-button>
      </div>
    </div>
  </bbn-container>
</bbn-tabnav>