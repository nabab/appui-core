<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 04/04/2017
 * Time: 05:02
 */
/** @var \bbn\mvc\controller $ctrl */
$ctrl->add_data(['css' => $ctrl->get_less()]);
$ctrl->combo(BBN_SITE_TITLE, true);
