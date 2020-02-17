<bbn-table :source="gridSource"
           :editable="false"
           class="bbn-w-100"
           :scrollable="false">
  <bbns-column :width="50"
               :component="$options.components['gridCheck']"
               :tcomponent="$options.components['gridCheckAll']">
  </bbns-column>
  <bbns-column title="Plugin"
               field="name">
  </bbns-column>
  <bbns-column title="URL"
               :component="$options.components['gridUrl']">
  </bbns-column>
</bbn-table>