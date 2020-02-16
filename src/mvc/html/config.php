<!-- HTML Document -->
<bbn-tabnav>
	<bbns-container url="general"
                  title="<?=_('General')?>"
                  :static="true"
                  :load="true"
                  :source="{settings: source.settings, composer: source.composer}">
  </bbns-container>
  <bbns-container url="environment"
                  title="<?=_('Current environment')?>"
                  :static="true"
                  :load="true"
                  :source="source.environments[source.current]">
  </bbns-container>
  <bbns-container url="routes"
                  title="<?=_('Routes')?>"
                  :static="true"
                  :load="true"
                  :source="{plugins: source.plugins, aliases: source.aliases}">
  </bbns-container>
  <bbns-container url="environments"
                  title="<?=_('Environments')?>"
                  :static="true"
                  :load="true"
                  :source="{environments: source.environments, current: source.current}">
  </bbns-container>
  <bbns-container url="packages"
                  title="<?=_('Packages')?>"
                  :static="true"
                  :load="true"
                  :source="{packages: source.packages, composer: source.composer}">
  </bbns-container>
  <bbns-container url="plugins"
                  title="<?=_('Plugins')?>"
                  :static="true"
                  :load="true"
                  :source="{plugins: source.plugins}">
  </bbns-container>
</bbn-tabnav>