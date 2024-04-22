<div class="bbn-overlay bbn-flex-height appui-core-iconpicker">
  <div class="bbn-w-100 bbn-middle bbn-c bbn-padded">
    <bbn-input :placeholder="totIcons ? _('Search in %d icons', totIcons.length) : _('Loading...')"
               bbn-model="searchIcon"
               class="search bbn-xl bbn-w-50"
               :nullable="true"
               ref="search"/>
    <div class="bbn-iblock bbn-hpadded bbn-l"
         bbn-text="Math.min(numberShown, icons?.length || 0) + ' icons'"
         style="width: 10em"/>
  </div>
  <div class="bbn-flex-fill">
    <bbn-scroll ref="scroll"
                @reachbottom="addIcons"
                bbn-if="totIcons"
                @resize="resize">
      <ul ref="ul">
        <li bbn-for="(icon, idx) in icons"
            class="bbn-block"
            :key="icon"
            :ref="'item-'+ idx">
          <bbn-button :title= "icon"
                      :icon="icon"
                      class="btn"
                      @click="selectIcon(icon)"/>
        </li>
      </ul>
    </bbn-scroll>
    <div bbn-else
         class="bbn-100 bbn-middle bbn-xl">
      <?= _('LOADING ICONS') ?>
    </div>
  </div>
</div>
