<?php
/*
 * Describe what it does!
 *
 **/

/** @var $this \bbn\mvc\controller */
$data = $ctrl
  ->add_data(['aliases' => $ctrl->get_aliases(), 'plugins' => $ctrl->get_routes()])
  ->set_obj([
    'url' => APPUI_CORE_ROOT.'config',
    'fcolor' => '#FFF',
    'bcolor' => '#000',
    'icon' => 'nf nf-fa-cogs',
  ])
  ->combo(_('Configuration'), true);