<?php
/*
 *  Describe what it does or you're a pussy
 *
 **/

use bbn\x;
use bbn\parsers\apache;
$log_dir   = $ctrl->data_path().'logs/';
$log_file  = '_php_error.log';
$json_file = '_php_error.json';
if (!file_exists($log_dir.$log_file) || !filesize($log_dir.$log_file)) {
  return;
}
rename($log_dir.$log_file, $log_dir.'.'.$log_file);
if (is_file($log_dir.$json_file)) {
  try {
    $res = json_decode(file_get_contents($log_dir.$json_file), true);
  }
  catch (\Exception $e) {
    x::log("IMPOSSIBLE TO GET THE JSON CONTENT FOR ERROR RECYCLING!", "IMPORTANT");
  }
}
else {
  $res = [];
}
try {
  $res = apache::parse_file($log_dir.'.'.$log_file, $res);
}
catch (\Exception $e) {
  x::log("IMPOSSIBLE TO PARSE THE APACHE LOG FILE!", "IMPORTANT");
}
if (!empty($res)) {
  unlink($log_dir.'.'.$log_file);
  if (file_put_contents($log_dir.$json_file, json_encode($res, JSON_PRETTY_PRINT))) {
    echo _("JSON error log file updated").' '.count($res).' '._("total errors");
  }
  else {
    x::log("IMPOSSIBLE TO PARSE THE APACHE LOG FILE!", "IMPORTANT");
  }
}