<!-- HTML Document -->
<bbn-splitter :resizable="true"
              :collapsible="true"
              orientation="vertical">
  <bbn-pane>
    <div class="bbn-full-screen">
      <div class="bbn-flex-height">
        <div class="bbn-w-100 bbn-lg bbn-spadded bbn-bg-black bbn-white">
          <?=_('PLUGINS')?>
        </div>
        <div class="bbn-flex-fill">
          <bbn-table :source="source.plugins"
                     editable="inline">
          	<bbns-column field="name"
                         title="<?=_('Name')?>"
                         :width="150"
                         :editable="false"></bbns-column>
          	<bbns-column field="url"
                         title="<?=_('URL')?>"
                         :width="200"></bbns-column>
          	<bbns-column field="path"
                         title="<?=_('Real path')?>"></bbns-column>
          </bbn-table>
        </div>
      </div>
    </div>
  </bbn-pane>
  <bbn-pane>
    <div class="bbn-full-screen">
      <div class="bbn-flex-height">
        <div class="bbn-w-100 bbn-lg bbn-spadded bbn-bg-black bbn-white">
          <?=_('ALIASES')?>
        </div>
        <div class="bbn-flex-fill">
          <bbn-table :source="source.aliases"
                     editable="inline">
          	<bbns-column field="url"
                         title="<?=_('URL')?>"
                         :width="350"></bbns-column>
          	<bbns-column field="path"
                         title="<?=_('Real path')?>"></bbns-column>
          </bbn-table>
        </div>
      </div>
    </div>
	</bbn-pane>
</bbn-splitter>