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
if (is_file($log_dir.$json_file)) {
  try {
    $res = json_decode(file_get_contents($log_dir.$json_file), true);
  }
  catch (\Exception $e) {
    x::dump(_("IMPOSSIBLE TO GET THE JSON CONTENT FOR ERROR RECYCLING!"));
    x::log(_("IMPOSSIBLE TO GET THE JSON CONTENT FOR ERROR RECYCLING!"), "IMPORTANT");
  }
}
else {
  $res = [];
}
try {
  $res = apache::parse_file($log_dir.$log_file, $res);
}
catch (\Exception $e) {
  x::dump(_("IMPOSSIBLE TO PARSE THE APACHE LOG FILE!"));
  x::log("IMPOSSIBLE TO PARSE THE APACHE LOG FILE!", "IMPORTANT");
}
if (!empty($res)) {
  if (file_put_contents($log_dir.$json_file, json_encode($res, JSON_PRETTY_PRINT))) {
    if (apache::cut_log_file($log_dir.$log_file, 500000)) {
      x::dump(_("Log file partially truncated"));
    }
    if ($num = apache::get_last_errors()) {
      x::dump(_("JSON error log file updated with")." $num "._("new errors for a total of").' '.count($res));
    }
    // Otherwise no output
  }
  else {
    x::dump(_("IMPOSSIBLE TO PARSE THE APACHE LOG FILE!"));
    x::log(_("IMPOSSIBLE TO PARSE THE APACHE LOG FILE!"), "IMPORTANT");
  }
}