<!-- HTML Document -->

<bbn-form :action="source.action"
          :data="source.data"
          :confirm-message="confirmMessage"
          @success="success"
          :source="plugins">
  <div class="bbn-w-100 bbn-padded">
    <div class="bbn-w-100">
      <bbn-button @click="checkAll"
                  title="<?=_("Check all")?>"
                  style="padding: 0 4px"
                  icon="nf nf-fa-check_square"/>
      <bbn-button @click="uncheckAll"
                  title="<?=_("Uncheck all")?>"
                  style="padding: 0 4px"
                  icon="nf nf-fa-square"/>
    </div>
    <div v-for="plugin of source.plugins"
         class="bbn-w-100 bbn-spadded">
      <bbn-checkbox v-model="plugins[plugin.value]"
                    :label="plugin.text"/>
    </div>
  </div>
</bbn-form>
