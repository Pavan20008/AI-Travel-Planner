const { execSync, spawn } = require('child_process');
const path = require('path');
const root = path.resolve(__dirname);
const frontendDir = path.join(root, 'frontend');
const backendDir = path.join(root, 'backend');

function runBuild(dir) {
  console.log(`Building in ${dir}`);
  const out = execSync('npm run build', { cwd: dir, encoding: 'utf8' });
  console.log(out);
}

async function fetchJson(url, options = {}) {
  const fetch = global.fetch || require('node-fetch');
  const res = await fetch(url, options);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

async function main() {
  try {
    runBuild(frontendDir);
    console.log('Frontend build succeeded');
  } catch (err) {
    console.error('Frontend build failed');
    console.error(err.stdout || err.message || err);
    process.exit(1);
  }

  const server = spawn(process.execPath, ['server.js'], { cwd: backendDir, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', (data) => process.stdout.write(data.toString()));
  server.stderr.on('data', (data) => process.stderr.write(data.toString()));

  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    const health = await fetchJson('http://localhost:5000/api/health');
    console.log('health', health.status, health.body);
    const trips = await fetchJson('http://localhost:5000/api/trips');
    console.log('trips unauthorized', trips.status, trips.body);
  } catch (err) {
    console.error('HTTP test failed', err.message || err);
    server.kill();
    process.exit(1);
  }

  server.kill();
  console.log('Backend health check succeeded');
}

main().catch((err) => {
  console.error('Unexpected error', err);
  process.exit(1);
});