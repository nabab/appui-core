<!-- HTML Document -->
<div class="bbn-padding">
  <div class="bbn-w-100 bbn-c" v-if="!source.has_key">
    <h2>
      <?= _("There is no certificate present in your config directory!") ?>
    </h2>
    <div class="bbn-padding">
      <?= ("You need to have a certificate registered in order to communicate with other servers") ?><br><br>
      <bbn-button @click="register"
                  text="<?= _("Generate a certificate") ?>"/>
    </div>
  </div>
  <div class="bbn-w-100 bbn-c" v-else>
    <h2>
      <?= _("Welcome in the communication tools!") ?>
    </h2>
    <div class="bbn-padding">
		  <bbn-button @click="handshake">Say hello to App-UI</bbn-button>
		  <bbn-button @click="app_info">Get info from App-UI</bbn-button>
    </div>
  </div>
</div>