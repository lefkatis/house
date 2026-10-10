const { spawn } = require('child_process');
const server = spawn('npx', ['-y', 'notebooklm-mcp']);
server.stderr.on('data', d => console.error('STDERR:', d.toString()));
server.stdout.on('data', d => console.log('STDOUT:', d.toString()));
const req = { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test-client", version: "1.0.0" } } };
server.stdin.write(JSON.stringify(req) + '\n');
setTimeout(() => { server.stdin.write(JSON.stringify({jsonrpc:"2.0", method:"notifications/initialized"}) + '\n'); }, 1000);
setTimeout(() => { server.stdin.write(JSON.stringify({jsonrpc:"2.0", id: 2, method:"tools/call", params: { name: "setup_auth", arguments: {} }}) + '\n'); }, 2000);
setTimeout(() => { server.kill(); }, 10000);
