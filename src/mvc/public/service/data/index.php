<?php

/** @var bbn\Mvc\Controller $ctrl */
$ctrl->setMode('public');
$ctrl->setObj([
  'hello' => 'world',
  'plugins' => [],
  'user' => $ctrl->inc->user->getId()
]);