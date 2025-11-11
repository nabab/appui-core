<!-- POWER BUTTON -->
<div class="bbn-right-smargin">
  <bbn-context class="bbn-iblock bbn-p bbn-rel"
               :title="appMode"
               tag="div">
    <i slot="default"
       class="nf nf-fa-power_off"
       tabindex="-1"
       :style="{color: powerColor}"/>
    <div slot="content"
         class="bbn-padding">
      <div class="bbn-grid-fields bbn-c">
        <div class="bbn-label"><?= _("Application name") ?></div>
        <div><?= $appname ?></div>

        <div class="bbn-label"><?= _("Installation type") ?></div>
        <div><?= $env ?></div>

        <div class="bbn-label"><?= _("Hostname") ?></div>
        <div><?= $hostname ?></div>

        <div class="bbn-label"><?= _("Server IP") ?></div>
        <div><?= $ip ?></div>

        <div class="bbn-label"><?= _("Client IP") ?></div>
        <div><?= $client ?></div>

        <div class="bbn-label"><?= _("Library version") ?></div>
        <div bbn-text="bbn.cp.version"/>

        <div class="bbn-label">
          <bbn-button @click="clearStorage"
                      icon="nf nf-md-sync_alert"
                      label="<?= _("Set default view") ?>"/>
        </div>
        <div>
          <bbn-button bbn-if="appui.user.isAdmin"
                      @click="increaseVersion"
                      icon="nf nf-oct-versions"
                      label="<?= _("Increase version") ?>"/>
        </div>
      </div>
    </div>

  </bbn-context>
</div>
