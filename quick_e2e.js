const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    console.log('Registering user...');
    const r1 = await post('/register', { username: 'e2etest', password: 'Pass123!' });
    console.log('Register response:', r1);

    console.log('Logging in user...');
    const r2 = await post('/login', { username: 'e2etest', password: 'Pass123!' });
    console.log('Login response:', r2);
  } catch (err) {
  console.error('Request error', err && err.stack ? err.stack : err);
  }
})();
