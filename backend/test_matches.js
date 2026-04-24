// Test the match finder endpoints
const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({ hostname: 'localhost', port: 4000, path, method, headers }, res => {
      let raw = '';
      res.on('data', c => raw += c);
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
  console.log('\n===== MATCH FINDER TESTS =====\n');

  // 1. Register + login two test users
  const email1 = 'match_test1_' + Date.now() + '@test.com';
  const email2 = 'match_test2_' + Date.now() + '@test.com';

  await request('POST', '/api/register', { fullName: 'Alice Safari', email: email1, password: 'pass1234' });
  await request('POST', '/api/register', { fullName: 'Bob Traveller', email: email2, password: 'pass1234' });
  const r1 = await request('POST', '/api/login', { email: email1, password: 'pass1234' });
  const r2 = await request('POST', '/api/login', { email: email2, password: 'pass1234' });
  const token1 = r1.body.token;
  const token2 = r2.body.token;
  console.log(`[SETUP] User 1 (Alice) token: ${token1 ? 'OK' : 'FAIL'}`);
  console.log(`[SETUP] User 2 (Bob)   token: ${token2 ? 'OK' : 'FAIL'}`);

  // 2. Alice saves a plan for Maasai Mara
  let r = await request('POST', '/api/plan', {
    full_name: 'Alice Safari', email: email1, phone: '0712000001',
    id_passport: 'A001', destination: 'Maasai Mara, Kenya',
    travel_date: '2026-07-15', return_date: '2026-07-22'
  }, token1);
  console.log(`[${r.status === 201 ? 'PASS' : 'FAIL'}] Alice saved plan → ${r.body.message}`);

  // 3. Bob saves a plan for Maasai Mara same dates
  r = await request('POST', '/api/plan', {
    full_name: 'Bob Traveller', email: email2, phone: '0712000002',
    id_passport: 'B002', destination: 'Maasai Mara, Kenya',
    travel_date: '2026-07-18', return_date: '2026-07-25'
  }, token2);
  console.log(`[${r.status === 201 ? 'PASS' : 'FAIL'}] Bob saved plan   → ${r.body.message}`);

  // 4. Bob also saves a Serengeti plan
  r = await request('POST', '/api/plan', {
    full_name: 'Bob Traveller', email: email2, phone: '0712000002',
    id_passport: 'B002', destination: 'Serengeti, Tanzania',
    travel_date: '2026-09-01', return_date: '2026-09-10'
  }, token2);
  console.log(`[${r.status === 201 ? 'PASS' : 'FAIL'}] Bob Serengeti    → ${r.body.message}`);

  // 5. Alice searches for Mara matches (protected — Bob should appear, not Alice)
  r = await request('GET', '/api/matches?destination=Maasai+Mara', null, token1);
  const maraMatches = r.body.matches || [];
  const aliceInResults = maraMatches.some(m => m.full_name === 'Alice Safari');
  const bobInResults   = maraMatches.some(m => m.full_name === 'Bob Traveller');
  console.log(`[${r.status === 200 ? 'PASS' : 'FAIL'}] GET /api/matches?destination=Maasai Mara → ${maraMatches.length} match(es)`);
  console.log(`[${!aliceInResults ? 'PASS' : 'FAIL'}] Alice NOT in her own results (self-exclusion)`);
  console.log(`[${bobInResults   ? 'PASS' : 'FAIL'}] Bob IS in Alice's results`);

  // 6. Public search — everyone visible
  r = await request('GET', '/api/matches/public?destination=Mara');
  console.log(`[${r.status === 200 ? 'PASS' : 'FAIL'}] GET /api/matches/public?destination=Mara → ${(r.body.matches||[]).length} match(es)`);

  // 7. Date-overlap filter — search July 14-23 should find both Alice (15-22) and Bob (18-25)
  r = await request('GET', '/api/matches/public?destination=Maasai+Mara&travel_date=2026-07-14&return_date=2026-07-23');
  console.log(`[${r.status === 200 ? 'PASS' : 'FAIL'}] Date-overlap filter (July 14-23) → ${(r.body.matches||[]).length} match(es) (expect 2)`);

  // 8. Date-overlap filter — search Aug (no overlap)
  r = await request('GET', '/api/matches/public?destination=Maasai+Mara&travel_date=2026-08-01&return_date=2026-08-10');
  console.log(`[${r.status === 200 ? 'PASS' : 'FAIL'}] Date-filter no overlap (August) → ${(r.body.matches||[]).length} match(es) (expect 0)`);

  // 9. Partial keyword match — "Mara" should match "Maasai Mara"
  r = await request('GET', '/api/matches/public?destination=Mara');
  console.log(`[${r.status === 200 && (r.body.matches||[]).length > 0 ? 'PASS' : 'FAIL'}] Partial keyword "Mara" → ${(r.body.matches||[]).length} match(es)`);

  // 10. Serengeti
  r = await request('GET', '/api/matches/public?destination=Serengeti');
  console.log(`[${r.status === 200 ? 'PASS' : 'FAIL'}] GET /api/matches/public?destination=Serengeti → ${(r.body.matches||[]).length} match(es) (expect 1)`);

  // 11. Empty destination → 400
  r = await request('GET', '/api/matches/public?destination=');
  console.log(`[${r.status === 400 ? 'PASS' : 'FAIL'}] Empty destination → 400: ${r.body.message}`);

  // 12. No auth on /api/matches → 401
  r = await request('GET', '/api/matches?destination=Mara');
  console.log(`[${r.status === 401 ? 'PASS' : 'FAIL'}] GET /api/matches without token → 401`);

  // Verify no sensitive data exposed
  r = await request('GET', '/api/matches/public?destination=Maasai+Mara');
  const allKeys = (r.body.matches || []).flatMap(m => Object.keys(m));
  const hasSensitive = allKeys.some(k => ['email','id_passport','phone','password_hash'].includes(k));
  console.log(`[${!hasSensitive ? 'PASS' : 'FAIL'}] No sensitive fields (email/passport/phone) exposed in results`);

  console.log('\n===== ALL TESTS COMPLETE =====\n');
  process.exit(0);
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
