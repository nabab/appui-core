<div class="bbn-h-100 bbn-flex-height appui-core-iconology">
  <div class="bbn-line-breaker bbn-middle bbn-c bbn-h-10">
    <bbn-input :placeholder="'Search in ' + source.total + ' icons'"
               v-model="searchIcon"
               class="search"
               ref="search"
    ></bbn-input>
    <div class="bbn-iblock bbn-hpadded bbn-l" v-text="icons.length + ' icons'" style="width: 10em"></div>
  </div>
  <div class="bbn-flex-fill">
    <bbn-scroll ref="scroll" @reachbottom="addIcons">
      <ul ref="ul">
        <li v-for="icon in currentIcons" class="bbn-block">
          <bbn-button :title= "icon"
                      :icon="icon"
                      class="btn"
                      @click="copyIcon(icon)"
          >
          </bbn-button>
          <div class="text-class" v-text="icon"></div>
        </li>
      </ul>
    </bbn-scroll>
  </div>
  <div class="bbn-h-5 appui-core-iconology-copy">
    <textarea ref="copyIcon"></textarea>
  </div>
</div>