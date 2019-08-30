<?php
if ( isset($ctrl->post['limit']) ){

}
else{
  $ctrl->set_icon('nf nf-fa-eye')->combo(_('Observers'));
}
