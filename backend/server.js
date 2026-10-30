import { createServer } from 'node:http';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import pg from 'pg';

const { Pool } = pg;
const scrypt = promisify(scryptCallback);
const port = Number(process.env.PORT || 3000);
const sessionDays = 7;
const sessionCookie = 'aqua_session';
const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim().toLocaleLowerCase('vi');
const adminEmail = `${adminUsername}@aquaatlas.local`;
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'aqua_atlas',
  user: process.env.DB_USER || 'aqua_atlas',
  password: process.env.DB_PASSWORD || 'aqua-atlas-local-dev',
  connectionTimeoutMillis: 5000,
});

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function send(response, status, data, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  response.end(JSON.stringify(data));
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw new HttpError(413, 'Dữ liệu gửi lên quá lớn.');
  }
  try {
    return body ? JSON.parse(body) : {};
  } catch {
    throw new HttpError(400, 'Dữ liệu JSON không hợp lệ.');
  }
}

function getCookie(request, name) {
  const cookies = request.headers.cookie?.split(';') || [];
  const cookie = cookies.map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return cookie?.slice(name.length + 1);
}

function sessionCookieHeader(token, maxAge) {
  const secure = process.env.COOKIE_SECURE === 'true' ? '; Secure' : '';
  return `${sessionCookie}=${token}; Path=/api; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function derivePasswordKey(password, salt) {
  return scrypt(password, salt, 64);
}

async function hashPassword(password, salt = randomBytes(16)) {
  const key = await derivePasswordKey(password, salt);
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [saltText, keyText] = storedHash.split(':');
  if (!saltText || !keyText) return false;
  const expected = Buffer.from(keyText, 'hex');
  const actual = await derivePasswordKey(password, Buffer.from(saltText, 'hex'));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function publicUser(row) {
  return { name: row.display_name, email: row.email, role: row.role };
}

async function createSession(userId) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
    [hashToken(token), userId, expiresAt],
  );
  return token;
}

async function getUser(request) {
  const token = getCookie(request, sessionCookie);
  if (!token) return null;
  const result = await pool.query(
    `SELECT users.id, users.email, users.display_name, users.role
       FROM auth_sessions
       JOIN users ON users.id = auth_sessions.user_id
      WHERE auth_sessions.token_hash = $1 AND auth_sessions.expires_at > NOW()`,
    [hashToken(token)],
  );
  return result.rows[0] || null;
}

async function requireUser(request, role) {
  const user = await getUser(request);
  if (!user) throw new HttpError(401, 'Vui lòng đăng nhập để tiếp tục.');
  if (role && user.role !== role) throw new HttpError(403, 'Tài khoản này không có quyền thực hiện thao tác.');
  return user;
}

async function saveFish(fish) {
  if (!fish || typeof fish !== 'object' || !/^[a-z0-9-]{1,80}$/.test(fish.id || '')) {
    throw new HttpError(400, 'Mã loài cá không hợp lệ.');
  }
  if (!fish.name?.trim() || !fish.scientificName?.trim()) {
    throw new HttpError(400, 'Vui lòng nhập tên thường gọi và tên khoa học.');
  }
  const result = await pool.query(
    `INSERT INTO fish (id, data, sort_order)
     VALUES ($1, $2::jsonb, (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM fish))
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
     RETURNING data`,
    [fish.id, JSON.stringify(fish)],
  );
  return result.rows[0].data;
}

async function route(request, response) {
  const url = new URL(request.url, 'http://localhost');
  const { pathname } = url;

  if (request.method === 'GET' && pathname === '/api/health') {
    await pool.query('SELECT 1');
    send(response, 200, { status: 'ok', service: 'aqua-atlas-backend', database: 'connected' });
    return;
  }

  if (request.method === 'GET' && pathname === '/api/fish') {
    const result = await pool.query('SELECT data FROM fish ORDER BY sort_order, id');
    send(response, 200, result.rows.map((row) => row.data));
    return;
  }

  if (request.method === 'POST' && pathname === '/api/auth/register') {
    const body = await readBody(request);
    const email = String(body.email || '').trim().toLocaleLowerCase('vi');
    const name = String(body.name || '').trim();
    const password = String(body.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Vui lòng nhập email hợp lệ.');
    if (email === adminEmail) throw new HttpError(409, 'Email này không thể dùng để đăng ký khách.');
    if (!name || name.length > 100) throw new HttpError(400, 'Tên cần có từ 1 đến 100 ký tự.');
    if (password.length < 8 || password.length > 128) throw new HttpError(400, 'Mật khẩu cần có từ 8 đến 128 ký tự.');

    try {
      const result = await pool.query(
        `INSERT INTO users (email, display_name, password_hash, role)
         VALUES ($1, $2, $3, 'customer')
         RETURNING id, email, display_name, role`,
        [email, name, await hashPassword(password)],
      );
      const token = await createSession(result.rows[0].id);
      send(response, 201, { user: publicUser(result.rows[0]) }, { 'Set-Cookie': sessionCookieHeader(token, sessionDays * 24 * 60 * 60) });
    } catch (error) {
      if (error.code === '23505') throw new HttpError(409, 'Email này đã được dùng để tạo tài khoản.');
      throw error;
    }
    return;
  }

  if (request.method === 'POST' && pathname === '/api/auth/login') {
    const body = await readBody(request);
    const login = String(body.email || '').trim().toLocaleLowerCase('vi');
    const password = String(body.password || '');
    const email = login === adminUsername ? adminEmail : login;
    const result = await pool.query(
      'SELECT id, email, display_name, role, password_hash FROM users WHERE email = $1',
      [email],
    );
    const account = result.rows[0];
    if (!account || !await verifyPassword(password, account.password_hash)) {
      throw new HttpError(401, 'Email hoặc mật khẩu chưa đúng.');
    }
    const token = await createSession(account.id);
    send(response, 200, { user: publicUser(account) }, { 'Set-Cookie': sessionCookieHeader(token, sessionDays * 24 * 60 * 60) });
    return;
  }

  if (request.method === 'GET' && pathname === '/api/auth/me') {
    const user = await getUser(request);
    if (!user) throw new HttpError(401, 'Chưa đăng nhập.');
    send(response, 200, { user: publicUser(user) });
    return;
  }

  if (request.method === 'POST' && pathname === '/api/auth/logout') {
    const token = getCookie(request, sessionCookie);
    if (token) await pool.query('DELETE FROM auth_sessions WHERE token_hash = $1', [hashToken(token)]);
    send(response, 200, { status: 'ok' }, { 'Set-Cookie': sessionCookieHeader('', 0) });
    return;
  }

  if (request.method === 'GET' && pathname === '/api/favorites') {
    const user = await requireUser(request, 'customer');
    const result = await pool.query('SELECT fish_id FROM favorites WHERE user_id = $1 ORDER BY created_at', [user.id]);
    send(response, 200, { fishIds: result.rows.map((row) => row.fish_id) });
    return;
  }

  if (request.method === 'PUT' && pathname === '/api/favorites') {
    const user = await requireUser(request, 'customer');
    const body = await readBody(request);
    if (!Array.isArray(body.fishIds) || body.fishIds.length > 200 || body.fishIds.some((id) => typeof id !== 'string')) {
      throw new HttpError(400, 'Danh sách cá yêu thích không hợp lệ.');
    }
    const fishIds = [...new Set(body.fishIds)];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (fishIds.length) {
        const found = await client.query('SELECT id FROM fish WHERE id = ANY($1::varchar[])', [fishIds]);
        if (found.rowCount !== fishIds.length) throw new HttpError(400, 'Danh sách có loài cá không tồn tại.');
      }
      await client.query('DELETE FROM favorites WHERE user_id = $1', [user.id]);
      if (fishIds.length) {
        await client.query(
          'INSERT INTO favorites (user_id, fish_id) SELECT $1, unnest($2::varchar[])',
          [user.id, fishIds],
        );
      }
      await client.query('COMMIT');
      send(response, 200, { fishIds });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return;
  }

  if (request.method === 'PUT' && pathname === '/api/admin/fish') {
    await requireUser(request, 'admin');
    const body = await readBody(request);
    send(response, 200, { fish: await saveFish(body) });
    return;
  }

  if (request.method === 'PUT' && pathname === '/api/admin/fish/import') {
    await requireUser(request, 'admin');
    const body = await readBody(request);
    if (!Array.isArray(body.fish) || body.fish.length > 500) throw new HttpError(400, 'Danh sách hồ sơ cần nhập không hợp lệ.');
    const imported = [];
    for (const item of body.fish) imported.push(await saveFish(item));
    send(response, 200, { imported: imported.length });
    return;
  }

  const deleteMatch = pathname.match(/^\/api\/admin\/fish\/([a-z0-9-]{1,80})$/);
  if (request.method === 'DELETE' && deleteMatch) {
    await requireUser(request, 'admin');
    const result = await pool.query('DELETE FROM fish WHERE id = $1 RETURNING id', [deleteMatch[1]]);
    if (!result.rowCount) throw new HttpError(404, 'Không tìm thấy loài cá.');
    send(response, 200, { id: result.rows[0].id });
    return;
  }

  throw new HttpError(404, 'Không tìm thấy API này.');
}

const server = createServer(async (request, response) => {
  try {
    await route(request, response);
  } catch (error) {
    if (error instanceof HttpError) {
      send(response, error.status, { error: error.message });
      return;
    }
    console.error('Lỗi API:', error);
    send(response, 500, { error: 'Máy chủ gặp lỗi. Vui lòng thử lại sau.' });
  }
});

async function start() {
  await pool.query('SELECT 1');
  const migration = await readFile(new URL('./db/migrations/002_create_app_data.sql', import.meta.url), 'utf8');
  await pool.query(migration);
  const fishMigration = await readFile(new URL('./db/migrations/003_add_freshwater_species.sql', import.meta.url), 'utf8');
  await pool.query(fishMigration);
  const attributionMigration = await readFile(new URL('./db/migrations/004_correct_image_attributions.sql', import.meta.url), 'utf8');
  await pool.query(attributionMigration);

  const seedResult = await pool.query('SELECT COUNT(*)::int AS count FROM fish');
  if (seedResult.rows[0].count === 0) {
    const seedFish = JSON.parse(await readFile(new URL('./db/seeds/fish.json', import.meta.url), 'utf8'));
    for (const [index, item] of seedFish.entries()) {
      await pool.query('INSERT INTO fish (id, data, sort_order) VALUES ($1, $2::jsonb, $3)', [item.id, JSON.stringify(item), index]);
    }
  }

  const adminPassword = process.env.ADMIN_PASSWORD || 'aqua-demo';
  const adminHash = await hashPassword(adminPassword);
  await pool.query(
    `INSERT INTO users (email, display_name, password_hash, role)
     VALUES ($1, 'Quản trị viên', $2, 'admin')
     ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name, password_hash = EXCLUDED.password_hash, role = 'admin'`,
    [adminEmail, adminHash],
  );

  setInterval(() => pool.query('DELETE FROM auth_sessions WHERE expires_at <= NOW()').catch(console.error), 60 * 60 * 1000).unref();
  server.listen(port, '0.0.0.0', () => {
    console.log(`AquaAtlas API đang chạy tại cổng ${port}; PostgreSQL đã kết nối.`);
    if (!process.env.ADMIN_PASSWORD) console.warn('Đang dùng mật khẩu admin demo. Hãy đặt ADMIN_PASSWORD trước khi triển khai công khai.');
  });
}

start().catch((error) => {
  console.error('Không thể khởi động backend:', error);
  process.exit(1);
});
