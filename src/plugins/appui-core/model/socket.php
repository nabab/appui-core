<?php

use bbn\X;
use bbn\Cache;
use bbn\Net\Websocket;

/** @var bbn\Mvc\Model $model */

X::log('passing through the socket core file', 'socket-core');
return [
  'ping' => static function (mixed $data, int $fd, Websocket $ws): void {
    $ws->send($fd, 'pong', ['time' => time()]);
  },
  'message' => static function (mixed $data, int $fd, Websocket $ws): void {
    $ws->send($fd, 'message', $data);
  },
  'clients' => static function (mixed $data, int $fd, Websocket $ws) use ($model): void {
    if (!is_array($data) || !is_array($data['clients'] ?? null)) {
      throw new InvalidArgumentException('Expected data.clients to be an object.');
    }

    $idUser = $ws->getUserId($fd);
    // This acknowledges metadata only. It does NOT execute your old poll endpoint.
    $redis = Cache::getEngine()->getObj();
    $views = [];
    foreach ($data['clients'] as $windowId => $win) {
      foreach ($win['views'] as $view) {
        if (!$redis->sIsMember('appui:clients:url:' . $view['url'], $idUser)) {
          $redis->sAdd('appui:clients:url:' . $view['url'], $idUser);
        }
        
        $views[$view['url']] = $view;
        $views[$view['url']]['window'] = $windowId;
      }
    }

    $redis->set("appui:users:views:$idUser", json_encode($views));
  },
  'chatsend' => static function (mixed $data, int $fd, Websocket $ws): void {
    if (!is_array($data) || !is_string($data['text'] ?? null)) {
      throw new InvalidArgumentException('Expected data.text.');
    }
    $text = trim($data['text']);
    if ($text === '' || strlen($text) > 2000) {
      throw new InvalidArgumentException('Chat text must be between 1 and 2000 bytes.');
    }
    // Example in-memory public chat. Persist/authorize real messages in your application.
    $ws->emit('chat.message', [
      'id' => bin2hex(random_bytes(16)),
      'user_id' => $ws->getUserId($fd),
      'text' => $text,
      'time' => time(),
    ]);
  },
];
