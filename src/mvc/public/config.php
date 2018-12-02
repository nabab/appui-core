<?php
/*
 * Describe what it does!
 *
 **/

/** @var $this \bbn\mvc\controller */
$ctrl->set_obj([
  'url' => APPUI_CORE_ROOT.'config',
  'fcolor' => '#FFF',
  'bcolor' => '#000',
  'icon' => 'fas fa-cogs',
  'notext' => true
])->combo(_('Configuration'));