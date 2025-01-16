<div class="bbn-grid-fields bbn-padding">
  <label><?= _('Engine') ?></label>
  <div>
    <bbn-dropdown :source="engines"
                  v-model="source.engine"
                  style="width: 100px"
                  ></bbn-dropdown>
  </div>
  <template v-if="source.engine === 'mysql'">
    <label><?= _('Host') ?></label>
    <div>
      <bbn-input v-model="source.host"></bbn-input>
    </div>
    <label><?= _('Username') ?></label>
    <div>
      <bbn-input v-model="source.user"></bbn-input>
    </div>
    <label><?= _('Password') ?></label>
    <div>
      <bbn-input v-model="source.pass"></bbn-input>
    </div>
    <label v-if="test"><?= _('Test connection') ?></label>
    <div v-if="test">
      <bbn-button icon="nf nf-md-lan_connect"
                  @click="testConnection"
                  :class="{
                          'bbn-bg-red': !verified,
                          'bbn-bg-green': verified
                          }"
                  :notext="true"
                  title="<?= _('Test connection') ?>"
                  ></bbn-button>
    </div>
  </template>
</div>