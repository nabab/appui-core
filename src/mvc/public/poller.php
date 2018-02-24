<?php
/**
 * Server-side file.
 * This file is an infinitive loop. Seriously.
 * It gets the file data.txt's last-changed timestamp, checks if this is larger than the timestamp of the
 * AJAX-submitted timestamp (time of last ajax request), and if so, it sends back a JSON with the data from
 * data.txt (and a timestamp). If not, it waits for one seconds and then start the next while step.
 *
 * Note: This returns a JSON, containing the content of data.txt and the timestamp of the last data.txt change.
 * This timestamp is used by the client's JavaScript for the next request, so THIS server-side script here only
 * serves new content after the last file change. Sounds weird, but try it out, you'll get into it really fast!
 */
// set php runtime to unlimited
set_time_limit(0);
// where does the data come from ? In real world this would be a SQL query or something
$now = microtime(true) * 10000;
$actsource = \bbn\file\dir::create_path(BBN_USER_PATH.'tmp/poller/active');
$datasource = \bbn\file\dir::create_path(BBN_USER_PATH.'tmp/poller/queue');
if ( $datasource && $actsource ){
  if ( $files = \bbn\file\dir::get_files($actsource) ){
    foreach ( $files as $f ){
      unlink($f);
    }
  }
  $active_file = $actsource.'/active_'.$now;
  file_put_contents($active_file, '1');
  // main loop
  while ( file_exists($active_file) ) {
    // PHP caches file data, like requesting the size of a file, by default. clearstatcache() clears that cache
    clearstatcache();
    // get files in the poller dir
    $files = \bbn\file\dir::get_files($datasource);
    if ( count($files) ){
      $res = [];
      foreach ( $files as $f ){
        if ( $ar = json_decode(file_get_contents($f), true) ){
          $res[] = $ar;
        }
        unlink($f);
      }
      // put data.txt's content and timestamp of last data.txt change into array
      $ctrl->obj->data = $res;
      // Leaves the page as it should be called back
      unlink($active_file);
    }
    else {
      // wait for 1 sec (not very sexy as this blocks the PHP/Apache process, but that's how it goes)
      sleep(1);
    }
  }
}