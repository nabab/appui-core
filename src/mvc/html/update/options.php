<!-- HTML Document -->
<div class="bbn-overlay bbn-flex-height">
  <div class="bbn-padding bbn-lg bbn-c bbn-w-100">
    <bbn-dropdown placeholder="<?= _("Choose a type to see the options") ?>"
                  :source="types"
                  v-model="currentType"/>
  </div>
  <div class="bbn-flex-fill">
    <div class="bbn-w-50 bbn-h-100">
      <div class="bbn-overlay bbn-flex-height">
        <div class="bbn-header bbn-b bbn-lg bbn-spadding bbn-c">
          <?= _("Default (from files)") ?>
        </div>
        <div class="bbn-flex-fill">
          <div class="bbn-100 bbn-padding"
               v-if="currentType && !isChanging">
            <bbn-tree :source="rf"
                      :storage="true"
                      :storage-full-name="'appui-core-updater-files-type-' + currentType"
                      ref="tf"
                      uid="code"
                      @unfold="unfoldRf"></bbn-tree>
          </div>
          <div v-else
               class="bbn-overlay bbn-middle bbn-xl">
            <?= _("Loading") ?>...
          </div>
        </div>
      </div>
    </div>
    <div class="bbn-w-50 bbn-h-100">
      <div class="bbn-overlay bbn-flex-height">
        <div class="bbn-header bbn-b bbn-lg bbn-spadding bbn-c">
          <?= _("Current (from options)") ?>
        </div>
        <div class="bbn-flex-fill">
          <div class="bbn-100 bbn-padding"
               v-if="currentType && !isChanging">
            <bbn-tree :source="ro"
                      :storage="true"
                      :storage-full-name="'appui-core-updater-options-type-' + currentType"
                      ref="to"
                      uid="code"
                      ></bbn-tree>
          </div>
          <div v-else
               class="bbn-overlay bbn-middle bbn-xl">
            <?= _("Loading") ?>...
          </div>
        </div>
      </div>
    </div>
  </div>
</div>