<?php
/*
 * Describe what it does!
 *
 **/

/** @var $ctrl \bbn\mvc\controller */
echo $ctrl->get_view().$ctrl->get_js().PHP_EOL.'<style>'.$ctrl->get_less().'</style>';