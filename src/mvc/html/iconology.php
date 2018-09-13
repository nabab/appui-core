<div class="bbn-h-100 bbn-flex-height appui-core-iconology">
  <div class="bbn-line-breaker bbn-middle bbn-c bbn-h-10">
    <bbn-input :placeholder="'Search in ' + source.total + ' icons'"
               v-model="searchIcon"
               class="search"
               ref="search"
    ></bbn-input>
  </div>
  <div class="bbn-flex-fill">
    <bbn-scroll>
      <ul>
        <li v-for="icon in icons" class="k-block">
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
