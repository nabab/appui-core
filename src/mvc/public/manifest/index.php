<?php
$json = [
  "name" => BBN_SITE_TITLE,
  "short_name" => BBN_APP_NAME,
  "icons" => [
      [
          "src" => BBN_STATIC_PATH."/img/favicon/android-chrome-36x36.png",
          "sizes" => "36x36",
          "type" => "image/png"
      ],
      [
          "src" => BBN_STATIC_PATH."/img/favicon/android-chrome-48x48.png",
          "sizes" => "48x48",
          "type" => "image/png"
      ],
      [
          "src" => BBN_STATIC_PATH."/img/favicon/android-chrome-72x72.png",
          "sizes" => "72x72",
          "type" => "image/png"
      ],
      [
          "src" => BBN_STATIC_PATH."/img/favicon/android-chrome-96x96.png",
          "sizes" => "96x96",
          "type" => "image/png"
      ],
      [
          "src" => BBN_STATIC_PATH."/img/favicon/android-chrome-144x144.png",
          "sizes" => "144x144",
          "type" => "image/png"
      ],
      [
          "src" => BBN_STATIC_PATH."/img/favicon/android-chrome-192x192.png",
          "sizes" => "192x192",
          "type" => "image/png"
      ],
      [
          "src" => BBN_STATIC_PATH."/img/favicon/android-chrome-256x256.png",
          "sizes" => "256x256",
          "type" => "image/png"
      ]
  ],
  "start_url" => "/",
  "theme_color" => "#888888",
  "background_color" => "#ffffff",
  "display" => "standalone"
];
echo json_encode($json, JSON_PRETTY_PRINT);