<div class="bbn-h-100 bbn-flex-height appui-core-iconology">
  <div class="bbn-line-breaker bbn-middle bbn-c bbn-padded">
    <div style="opacity: 0; position: absolute; top: 0px; left: 0px; width: 1px; height:1px">
      <input type="text" ref="copyIcon">
    </div>
    <bbn-input :placeholder="'Search in ' + source.total + ' icons'"
               v-model="searchIcon"
               class="search bbn-xl bbn-w-50"
               ref="search"
    ></bbn-input>
    <div class="bbn-iblock bbn-hpadded bbn-l" v-text="icons.length + ' icons'" style="width: 10em"></div>
  </div>
  <div class="bbn-flex-fill">
    <bbn-scroll ref="scroll" @reachBottom="addIcons" @ready="updateIcons">
      <ul ref="ul">
        <li v-for="icon in currentIcons" class="bbn-block">
          <bbn-button :title= "icon"
                      :icon="'nf ' + icon"
                      class="btn"
                      @click="copyIcon(icon)"
          >
          </bbn-button>
          <div class="text-class" v-text="icon.substr(3)"></div>
        </li>
      </ul>
    </bbn-scroll>
  </div>
</div>