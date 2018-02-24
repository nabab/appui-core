<div class="bbn-margin">
  <div class="bbn-line-breaker bbn-c">
    <input type="text" class="k-textbox recherche_icons" style="width: 50%" placeholder="<?=_("Search in")?>
    <?=$total?> <?=_("icons")?>">
  </div>
  <h3 style="padding-top:10px"><?=_("Font-Awesome")?></h3>
  <ul>
    <?php
    if (!empty($faicons)) {
      foreach ($faicons as $faicon) {?>
        <li class="k-block"
            style="width: 120px; height:100px; display: inline-block; text-align:center; vertical-align:middle; padding-top:20px;">
          <div class="k-button" style="width:60px; height:60px">
            <i class="fa fa-<?=$faicon ?>" style="font-size:36px; vertical-align:middle; line-height:54px"></i>
          </div>
          <div style="font-size:75%"><?=$faicon ?></div>
        </li>
        <?php
      }
    }
    ?>
  </ul>

 <!-- <h3 style="padding-top:10px"><?=_("Devicon")?></h3>
  <ul>
    <?php
    if (!empty($devicon)) {
      foreach ($devicon as $devico) {?>
      <li class="k-block" style="width: 120px; height:100px; display: inline-block; text-align:center; vertical-align:middle; padding-top:20px;">
        <div class="k-button" style="width:60px; height:60px">
          <i class="devicon-<?=$devico?>" style="font-size:16px; vertical-align:middle"></i>
        </div>
        <div style="font-size:75%"><?=$devico?></div>
      </li>
    <?php
      }
    }
    ?>
  </ul>
  <h3 style="padding-top:10px"><?=_("Font-Mfizz")?></h3>
  <ul>-->
    <?php
    if ( !empty($mficons) ){
      foreach ( $mficons as $mficon ){ ?>
        <h4><?=$mficon['txt']?></h4>
        <?php foreach ($mficon['icons'] as $icon) { ?>
          <li class="k-block"
              style="width: 120px; height:100px; display: inline-block; text-align:center; vertical-align:middle; padding-top:20px;">
            <div class="k-button" style="width:60px; height:60px">
              <i class="icon-<?= $icon ?>" style="font-size:36px; vertical-align:middle; line-height:54px"></i>
            </div>
            <div style="font-size:75%"><?= $icon ?></div>
          </li>
          <?php
        }
      }
    }
    ?>
  </ul>
</div>
<script id="icon_copy_tpl" type="text/x-kendo-template">
  <div class="bbn-100 bbn-c">
    <span style="display:block; margin-bottom: 10px; margin-top: 10px;"><strong><?=_("Copy to clipboard: Ctrl+C")?></strong></span>
    <input class="icon_name" style="width: 80%; text-align: center;" readonly>
  </div>
</script>
