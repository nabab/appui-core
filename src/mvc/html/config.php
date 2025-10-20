<!-- HTML Document -->
<bbn-router class="appui-core-config"
            mode="tabs"
            :autoload="false"
>
	<bbn-container url="general"
                 label="<?= _('General') ?>"
                 :fixed="true"
                 :scrollable="true">
    <appui-core-config-settings :source="{
                                         schema: source.schema.settings,
                                         settings: source.settings,
                                         root: root,
                                         data: {}
                                         }">
    </appui-core-config-settings>
  </bbn-container>
  <bbn-container url="environments"
                 label="<?= _('Environments') ?>"
                 :fixed="true"
                 :scrollable="true">
      <div class="bbn-w-100 bbn-c bbn-padding">
        <bbn-dropdown :source="envs"
                      v-model="envIndex"
                      class="bbn-wider">
        </bbn-dropdown>
        <div v-if="originalIndex === envIndex"
             class="bbn-green bbn-m bbn-b"
             v-text="_('This is the current environment')">
        </div>
      </div>
      <appui-core-config-settings v-if="visible && currentEnvironment"
                                  :source="{
                                           schema: source.schema.environment,
                                           settings: currentEnvironment,
                                           root: root,
                                           data: {env: envIndex}
                                           }">
      </appui-core-config-settings>
  </bbn-container>
  <bbn-container url="routes"
                 label="<?= _('Routes') ?>"
                 :fixed="true">
    <bbn-table :source="source.aliases"
               ref="aliases-table"
               :toolbar="[{
                         text: '<?= _('New route') ?>',
                         action: 'insert'
                         }]"
               @saverow="routeSave"
               :editable="true">
      <bbns-column field="url"
                   label="<?= _('URL') ?>"
                   :width="350">
      </bbns-column>
      <bbns-column field="path"
                   label="<?= _('Real path') ?>">
      </bbns-column>
      <bbns-column field="path"
                   :width="100"
                   class="bbn-c"
                   label="<?= _('Action') ?>"
                   :sortable="false"
                   :buttons="[{
                               text: '<?= _('Edit') ?>',
                             	 icon: 'nf nf-fa-edit',
                             	 notext: true,
                               action: 'edit'
                             }, {
                               text: '<?= _('Delete') ?>',
                             	 icon: 'nf nf-fa-times',
                             	 notext: true,
                               action: 'delete'
                             }]">
      </bbns-column>
    </bbn-table>
  </bbn-container>
  <bbn-container url="plugins"
                 label="<?= _('Plugins') ?>"
                 :fixed="true">
    <bbn-router class="bbn-overlay"
                default="official"
                mode="tabs"
                :autoload="false"
    >
      <bbn-container url="official"
                     label="<?= _('Official plugins') ?>"
                     :fixed="true">
        <bbn-table :source="advisedSource"
                   :editable="true">
          <bbns-column label="<?= _('Name') ?>"
                       :width="150"
                       field="sname">
          </bbns-column>
          <bbns-column label="<?= _('URL') ?>"
                       field="url"
                       :width="250">
          </bbns-column>
          <bbns-column label="<?= _('Description') ?>"
                       field="description">
          </bbns-column>
          <bbns-column field="path"
                       :width="100"
                       class="bbn-c"
                       label="<?= _('Action') ?>"
                       :sortable="false"
                       :buttons="[{
                                   text: '<?= _('Edit') ?>',
                                   action: 'edit',
                                   icon: 'nf nf-fa-edit',
                                   notext: true
                                 }, {
                                   text: '<?= _('Delete') ?>',
                                   action: 'delete',
                                   icon: 'nf nf-fa-times',
                                   notext: true
                                 }]">
          </bbns-column>
        </bbn-table>
      </bbn-container>
      <bbn-container url="other"
                     label="<?= _('Other plugins') ?>"
                     :fixed="true">
        <bbn-table :source="devSource"
                   ref="oplugins-table"
                   :toolbar="[{
                             text: '<?= _('New plugin') ?>',
                             action: 'insert'
                             }]"
                   :editable="true">
          <bbns-column label="<?= _('Name') ?>"
                       :width="200"
                       field="name">
          </bbns-column>
          <bbns-column label="<?= _('Root') ?>"
                       :width="100"
                       :source="[{text: _('Application'), value: 'app'}, {text: _('Library'), value: 'lib'}]"
                       field="root">
          </bbns-column>
          <bbns-column label="<?= _('URL') ?>"
                       :width="250"
                       field="url">
          </bbns-column>
          <bbns-column label="<?= _('Description') ?>"
                       field="description">
          </bbns-column>
          <bbns-column field="path"
                       :width="100"
                       class="bbn-c"
                       label="<?= _('Action') ?>"
                       :sortable="false"
                       :buttons="[{
                                   text: '<?= _('Edit') ?>',
                                   action: 'edit',
                                   icon: 'nf nf-fa-edit',
                                   notext: true
                                 }, {
                                   text: '<?= _('Delete') ?>',
                                   action: 'delete',
                                   icon: 'nf nf-fa-times',
                                   notext: true
                                 }]">
          </bbns-column>
        </bbn-table>
      </bbn-container>
    </bbn-router>
  </bbn-container>
  <bbn-container url="packages"
                  label="<?= _('Packages') ?>"
                 :fixed="true"
                 :scrollable="true">
    <div class="bbn-padding">
      <h2>Composer</h2>
      <div class="bbn-grid-fields">
        <label><?= _('Name') ?></label>
        <bbn-input v-model="source.composer.name"></bbn-input>

        <label><?= _('Description') ?></label>
        <bbn-textarea v-model="source.composer.description" class="bbn-w-100" :rows="3"></bbn-textarea>

        <template v-for="pack in source.packages">
          <div class="bbn-label">
            <span v-text="pack.name"></span> &nbsp; 
            <bbn-button icon="nf nf-md-help_circle_outline"
                        :notext="true">
            </bbn-button>
            <bbn-button icon="nf nf-fa-times"
                        :notext="true">
            </bbn-button>
          </div>
          <div v-text="pack.version"></div>
        </template>
      </div>
      <div class="bbn-vpadding bbn-w-100">
        <bbn-button icon="nf nf-fa-plus"
                    label="<?= _('Add a new package') ?>"
                    @click="addPackage()">
        </bbn-button>
      </div>
    </div>
  </bbn-container>
</bbn-router>