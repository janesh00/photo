const net = require('net');

const host = 'db.pqqofrarezxprohiezum.supabase.co';
const port = 5432;

console.log(`🔍 Testing network connection to Supabase PostgreSQL (${host}:${port})...`);

const start = Date.now();
const socket = net.createConnection({ host, port, timeout: 5000 }, () => {
  const time = Date.now() - start;
  console.log(`✅ SUCCESS! Connected to Supabase DB server at ${host}:${port} in ${time}ms.`);
  socket.end();
});

socket.on('timeout', () => {
  console.error(`❌ TIMEOUT: Could not reach ${host}:${port} within 5 seconds.`);
  socket.destroy();
  process.exit(1);
});

socket.on('error', (err) => {
  console.error(`❌ ERROR connecting to ${host}:${port}:`, err.message);
  process.exit(1);
});
