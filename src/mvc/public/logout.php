<?php
if ( isset($ctrl->inc->user) && $ctrl->inc->user->check_session() ){
	if ( $history = $ctrl->inc->session->fetch('history') ){
    $redir = count($history) ? end($history) : '.';
  }
	$ctrl->inc->user->logout();
}
$ctrl->add_script('document.location.href="'.(isset($redir) ? $redir : '.').'";');