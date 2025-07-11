const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:5001');

ws.on('open', () => {
  console.log('✅ Connected to server');
  ws.send(JSON.stringify({ deviceId: 'ESP32_Dev', status: 'ready' }));
});

ws.on('message', (message) => {
  console.log('📨 Received from server:', JSON.stringify(message));
});

ws.on('close', () => {
  console.log('❌ Disconnected from server');
});

ws.on('error', (err) => {
  console.error('⚠️ WebSocket error:', err.message);
});
