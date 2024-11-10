<?php

use bbn\X;
/** @var bbn\Mvc\Model $model */


return $model->getSetFromCache(function() {
  X::log("inside cache making");
  $json = X::curl('https://api.github.com/users/nabab/repos', null, ['useragent' => 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0']);
  $res = [];
  if ($json) {
    $repos = json_decode($json);
    foreach ($repos as $repo) {
      if (X::indexOf($repo->name, 'appui-') === 0) {
        $res[] = [
          'text'        => $repo->name,
          'value'       => 'bbn/'.$repo->name,
          'url'         => $repo->html_url,
          'description' => $repo->description
        ];
      }
    }
  }

  return ['plugins_repositories' => $res];
}, [], '', 3600);
