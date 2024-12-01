<div class="bbn-overlay bbn-flex-height appui-core-special-chars">
  <div class="bbn-line-breaker bbn-middle bbn-c bbn-padding">
    <bbn-input :placeholder="'Search in ' + totChars.length + ' chars'"
               v-model="searchChar"
               class="search bbn-xl bbn-w-50"
               ref="search"
    ></bbn-input>
    <div class="bbn-iblock bbn-hpadding bbn-l"
         v-text="chars.length + ' chars'"
         style="width: 10em">
    </div>
  </div>
  <div class="bbn-flex-fill">
    <bbn-scroll ref="scroll"
                @reachbottom="addChars"
                @ready="updateChars">
      <ul ref="ul">
        <li v-for="char in currentChars" class="bbn-block">
          <bbn-button :title="char.fullName"
                      :text="char.char"
                      class="btn bbn-xxl"
                      @click="copyChar(char)"
          >
          </bbn-button>
          <div class="text-class"
               v-text="char.name"
               :title="char.fullName"></div>
        </li>
      </ul>
    </bbn-scroll>
  </div>
</div>