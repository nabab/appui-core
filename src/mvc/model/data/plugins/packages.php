<?php

use bbn\X;
/** @var bbn\Mvc\Model $model */


return $model->getSetFromCache(function() {
  X::log("inside cache making");
  $json = X::curl('https://packagist.org/packages/list.json?vendor=bbn', null, ['useragent' => 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0']);
  $res = [];
  if ($json) {
    $obj = json_decode($json);
    foreach ($obj->packageNames as $repo) {
      if (X::indexOf($repo, 'bbn/appui-') === 0) {
        $tmp = [
          'text'    => substr($repo, 4),
          'value'   => $repo,
          'version' => 'dev-master'
        ];
        try {
          $json = X::curl('https://repo.packagist.org/p2/'.$repo.'.json', null, ['useragent' => 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0']);
        }
        catch (\Exception $e) {
        }
        if ($json) {
          $tmp['packagist'] = json_decode($json, true);
        }

        $res[] = $tmp;
      }
    }
  }

  return ['plugins_packages' => $res];
}, [], '', 3);
