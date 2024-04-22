<div class="bbn-overlay bbn-flex-height appui-core-iconology">
  <div class="bbn-line-breaker bbn-middle bbn-c bbn-padded">
    <bbn-input :placeholder="'Search in ' + totIcons.length + ' icons'"
               v-model="searchIcon"
               class="search bbn-xl bbn-w-50"
               :nullable="true"
               ref="search"/>
    <div class="bbn-iblock bbn-hpadded bbn-l"
         v-text="icons.length + ' icons'"
         style="width: 10em"/>
  </div>
  <div class="bbn-flex-fill">
    <bbn-scroll ref="scroll"
                @reachbottom="addIcons"
                @resize="resize">
      <ul ref="ul">
        <li v-for="(icon, idx) in icons"
            v-if="idx < numberShown"
            class="bbn-block"
            :key="icon"
            :ref="'item-'+ idx">
          <bbn-button :title= "icon"
                      :icon="icon"
                      class="btn"
                      @click="copyIcon(icon)"/>
          <div class="text-class"
               v-text="icon.substr(3)"/>
        </li>
      </ul>
    </bbn-scroll>
  </div>
</div>