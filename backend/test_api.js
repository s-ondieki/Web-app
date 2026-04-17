// API test script
const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request({ hostname: 'localhost', port: 4000, path, method, headers }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('\n========= GGT API TESTS =========\n');

  // 1. Health
  let r = await request('GET', '/api/health');
  console.log(`[${r.status === 200 ? 'PASS' : 'FAIL'}] GET /api/health → ${JSON.stringify(r.body)}`);

  // 2. Register
  r = await request('POST', '/api/register', { fullName: 'Safari Tester', email: 'safari_test_' + Date.now() + '@test.com', password: 'test1234' });
  console.log(`[${r.status === 201 ? 'PASS' : 'FAIL'}] POST /api/register → ${JSON.stringify(r.body)}`);
  const testEmail = r.body.message ? undefined : null;

  // 3. Register with same email (should get 409)
  const email = 'duplicate_' + Date.now() + '@test.com';
  await request('POST', '/api/register', { fullName: 'Dup User', email, password: 'test1234' });
  r = await request('POST', '/api/register', { fullName: 'Dup User', email, password: 'test1234' });
  console.log(`[${r.status === 409 ? 'PASS' : 'FAIL'}] POST /api/register duplicate → ${JSON.stringify(r.body)}`);

  // 4. Register missing fields
  r = await request('POST', '/api/register', { email: 'nofullname@test.com' });
  console.log(`[${r.status === 400 ? 'PASS' : 'FAIL'}] POST /api/register missing fields → ${JSON.stringify(r.body)}`);

  // 5. Login with wrong password
  r = await request('POST', '/api/login', { email, password: 'wrongpass' });
  console.log(`[${r.status === 401 ? 'PASS' : 'FAIL'}] POST /api/login wrong password → ${JSON.stringify(r.body)}`);

  // 6. Login correctly
  r = await request('POST', '/api/login', { email, password: 'test1234' });
  console.log(`[${r.status === 200 ? 'PASS' : 'FAIL'}] POST /api/login → ${JSON.stringify(r.body)}`);
  const token = r.body.token;

  // 7. Get profile (protected)
  r = await request('GET', '/api/profile', null, token);
  console.log(`[${r.status === 200 ? 'PASS' : 'FAIL'}] GET /api/profile → ${JSON.stringify(r.body)}`);

  // 8. Get profile without token
  r = await request('GET', '/api/profile');
  console.log(`[${r.status === 401 ? 'PASS' : 'FAIL'}] GET /api/profile (no token) → ${JSON.stringify(r.body)}`);

  // 9. Save travel plan (protected)
  r = await request('POST', '/api/plan', {
    full_name: 'Safari Tester', email, phone: '0712345678',
    id_passport: 'KE12345', destination: 'Maasai Mara',
    travel_date: '2026-06-01', return_date: '2026-06-07'
  }, token);
  console.log(`[${r.status === 201 ? 'PASS' : 'FAIL'}] POST /api/plan → ${JSON.stringify(r.body)}`);

  // 10. Get travel plans (protected)
  r = await request('GET', '/api/plan', null, token);
  console.log(`[${r.status === 200 ? 'PASS' : 'FAIL'}] GET /api/plan → plans count: ${r.body.plans ? r.body.plans.length : 'ERROR'}`);

  // 11. Save budget (protected)
  r = await request('POST', '/api/budget', {
    transport_cost: 500, accommodation_cost: 1200,
    food_cost: 300, activities_cost: 400, emergency_money: 200
  }, token);
  console.log(`[${r.status === 201 ? 'PASS' : 'FAIL'}] POST /api/budget → ${JSON.stringify(r.body)}`);

  // 12. Get budget (protected)
  r = await request('GET', '/api/budget', null, token);
  console.log(`[${r.status === 200 ? 'PASS' : 'FAIL'}] GET /api/budget → ${JSON.stringify(r.body)}`);

  // 13. Contact form
  r = await request('POST', '/api/contact', { name: 'Test User', email: 'test@test.com', subject: 'Hello', message: 'API test message' });
  console.log(`[${r.status === 201 ? 'PASS' : 'FAIL'}] POST /api/contact → ${JSON.stringify(r.body)}`);

  // 14. Contact form missing fields
  r = await request('POST', '/api/contact', { name: 'Test User' });
  console.log(`[${r.status === 400 ? 'PASS' : 'FAIL'}] POST /api/contact missing fields → ${JSON.stringify(r.body)}`);

  console.log('\n========= TESTS COMPLETE =========\n');
  process.exit(0);
}

run().catch(err => { console.error('Test error:', err); process.exit(1); });
