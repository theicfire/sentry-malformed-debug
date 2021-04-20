const dgram = require('dgram');
const WebSocket = require('ws');
const { fork } = require('child_process');
const { SDLUtils } = require('bindings')('addon');

const utils = new SDLUtils();

const DestHost = 'localhost';

// Configure UDP

const UDPPort = 8080;
const udpSocket = dgram.createSocket('udp4');

function sendUDP(type, value) {
  udpSocket.send(Buffer.from(JSON.stringify({ type, value })), UDPPort, DestHost);
}

// Configure TCP

const TCPPort = 8081;

const tcpSocket = new WebSocket(`ws://${DestHost}:${TCPPort}`);

tcpSocket.on('error', (err) => {
  console.log('TCP Connection issue: Make sure the remote side is running...');
});

/**
 * User presses ctrl+c:
 * Key press event is sent to remote
 * xdo simulates keypress which updates remote clipboard
 * Remote uses SDL to get clipboard text
 * Sends it back here in message of type: 'SET_CLIPBOARD'
 * Client updates its own clipboard.
 */
tcpSocket.on('message', (msg) => {
  const parsedMsg = JSON.parse(msg);
  switch (parsedMsg.type) {
    case 'SET_CLIPBOARD':
      utils.setClipboardText(parsedMsg.value);
      break;
  }
});

function sendTCP(type, value) {
  tcpSocket.send(JSON.stringify({ type, value }));
}

// Fork SDL window creation and input loop

const forked = fork('src/js/child.js');

forked.on('message', (msg) => {
  if (msg.mode == 'UDP') {
    sendUDP(msg.type, msg.value);
  } else {
    sendTCP(msg.type, msg.value);
  }
});
