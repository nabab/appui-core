<?php
if ( isset($ctrl->inc->user) && $ctrl->inc->user->checkSession() ){
	if ( $history = $ctrl->inc->session->fetch('history') ){
    $redir = count($history) ? end($history) : '.';
  }
	$ctrl->inc->user->logout();
}
$ctrl->addScript('document.location.href="'.(isset($redir) ? $redir : '.').'";');