const { spawn } = require('child_process');
const fs = require('fs');

const server = spawn('npx', ['-y', 'notebooklm-mcp']);
let buffer = '';

server.stdout.on('data', data => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop();
  for (const line of lines) {
    if (line.trim()) {
      try {
        const obj = JSON.parse(line);
        if (obj.id === 2) {
          console.log(JSON.stringify(obj, null, 2));
          server.kill();
        }
      } catch (e) {}
    }
  }
});

const req = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test-client", version: "1.0.0" } }
};
server.stdin.write(JSON.stringify(req) + '\n');
setTimeout(() => { server.stdin.write(JSON.stringify({jsonrpc:"2.0", method:"notifications/initialized"}) + '\n'); }, 1000);

const callReq = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: { name: "setup_auth", arguments: {} }
};
setTimeout(() => { server.stdin.write(JSON.stringify(callReq) + '\n'); }, 2000);
