<?php

/** @var bbn\Mvc\Controller $ctrl */
$data = $ctrl
  ->addData(['aliases' => $ctrl->getAliases(), 'plugins' => $ctrl->getRoutes()])
  ->setObj([
    'url' => APPUI_CORE_ROOT.'config',
    'fcolor' => '#FFF',
    'bcolor' => '#000',
    'icon' => 'nf nf-fa-cogs',
  ])
  ->combo(_('Configuration'), true);