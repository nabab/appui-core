<?php
/*
 *  Describe what it does or you're a pussy
 *
 **/

use bbn\X;
use bbn\Parsers\Apache;
$log_dir   = $ctrl->dataPath().'logs/';
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
    X::dump(_("IMPOSSIBLE TO GET THE JSON CONTENT FOR ERROR RECYCLING!"));
    X::log(_("IMPOSSIBLE TO GET THE JSON CONTENT FOR ERROR RECYCLING!"), "IMPORTANT");
  }
}
else {
  $res = [];
}
try {
  $res = Apache::parseFile($log_dir.$log_file, $res);
}
catch (\Exception $e) {
  X::dump(_("IMPOSSIBLE TO PARSE THE APACHE LOG FILE!"));
  X::log("IMPOSSIBLE TO PARSE THE APACHE LOG FILE!", "IMPORTANT");
}
if (!empty($res)) {
  if (file_put_contents($log_dir.$json_file, Json_encode($res, JSON_PRETTY_PRINT))) {
    if (apache::cutLogFile($log_dir.$log_file, 500000)) {
      X::dump(_("Log file partially truncated"));
    }
    if ($num = Apache::getLastErrors()) {
      X::dump(_("JSON error log file updated with")." $num "._("new errors for a total of").' '.count($res));
    }
    // Otherwise no output
  }
  else {
    X::dump(_("IMPOSSIBLE TO PARSE THE APACHE LOG FILE!"));
    X::log(_("IMPOSSIBLE TO PARSE THE APACHE LOG FILE!"), "IMPORTANT");
  }
}