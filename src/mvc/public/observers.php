<?php
if ( isset($ctrl->post['limit']) ){

}
else{
  $ctrl->setIcon('nf nf-fa-eye')->combo(_('Observers'));
}
