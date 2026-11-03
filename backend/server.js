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

async function saveFish(inputFish, { allowIncomplete = false } = {}) {
  const fish = inputFish && typeof inputFish === 'object' ? { ...inputFish } : inputFish;
  if (!fish || typeof fish !== 'object' || !/^[a-z0-9-]{1,80}$/.test(fish.id || '')) {
    throw new HttpError(400, 'Mã loài cá không hợp lệ.');
  }
  if (!fish.name?.trim() || !fish.scientificName?.trim()) {
    throw new HttpError(400, 'Vui lòng nhập tên thường gọi và tên khoa học.');
  }
  if (!allowIncomplete) {
    const isWebUrl = (value) => {
      try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
    };
    const requiredText = ['description', 'summary', 'tank', 'temperature', 'ph', 'groupSize', 'food', 'compatibility', 'imageCredit'];
    if (requiredText.some((key) => typeof fish[key] !== 'string' || !fish[key].trim())) {
      throw new HttpError(400, 'Hãy điền đủ mô tả, thông số, chăm sóc và ghi công ảnh trước khi lưu.');
    }
    if (!isWebUrl(fish.image) || !isWebUrl(fish.imageSource)) {
      throw new HttpError(400, 'Ảnh và trang nguồn ảnh cần là liên kết HTTP hoặc HTTPS hợp lệ.');
    }
    if (fish.video && (!isWebUrl(fish.video) || !isWebUrl(fish.videoSource) || !fish.videoCredit?.trim())) {
      throw new HttpError(400, 'Nếu thêm video, hãy nhập URL video, trang nguồn và ghi công video hợp lệ.');
    }
    if (!Array.isArray(fish.sources) || !fish.sources.length || fish.sources.some((source) => !source.label?.trim() || !isWebUrl(source.url))) {
      throw new HttpError(400, 'Thêm ít nhất một nguồn tham khảo có tên và URL HTTP/HTTPS hợp lệ.');
    }
    if (!Number.isInteger(Number(fish.minTankLiters)) || Number(fish.minTankLiters) < 1) {
      throw new HttpError(400, 'Dung tích bể dùng để lọc cần là số lít nguyên lớn hơn 0.');
    }
    if (!['peaceful', 'active', 'independent', 'semi-aggressive'].includes(fish.temperament)) {
      throw new HttpError(400, 'Chọn một giá trị tính cách trong danh sách.');
    }
    if (!['community', 'separate', 'coldwater-community', 'large-community'].includes(fish.compatibilityGroup)) {
      throw new HttpError(400, 'Chọn một nhóm tương thích trong danh sách.');
    }
    if (!['livebearer', 'tetra', 'rainbowfish', 'danio', 'rasbora', 'barb', 'gourami', 'cichlid', 'catfish', 'loach', 'shark', 'coldwater', 'tankbuster', 'betta', 'other'].includes(fish.family)) {
      throw new HttpError(400, 'Chọn một nhóm loài trong danh sách.');
    }
    fish.dataStatus = 'reviewed';
    fish.reviewedAt = new Date().toISOString().slice(0, 10);
  } else if (!fish.imageSource || !fish.imageCredit || !Array.isArray(fish.sources) || !fish.sources.length
    || !Number.isInteger(Number(fish.minTankLiters)) || !fish.temperament || !fish.compatibilityGroup || !fish.family) {
    fish.dataStatus = 'needs-review';
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

async function saveShop(inputShop) {
  const shop = inputShop && typeof inputShop === 'object' ? { ...inputShop } : {};
  const required = ['name', 'address', 'hours', 'verification', 'note', 'sourceLabel'];
  if (!/^[a-z0-9-]{1,100}$/.test(shop.id || '') || required.some((key) => typeof shop[key] !== 'string' || !shop[key].trim())) {
    throw new HttpError(400, 'Mã, tên, địa chỉ, giờ, nguồn xác minh và ghi chú cửa hàng là bắt buộc.');
  }
  if (!['hcm', 'hanoi', 'haiphong', 'cantho', 'nhatrang'].includes(shop.city)) {
    throw new HttpError(400, 'Chọn một tỉnh/thành phố trong danh sách.');
  }
  for (const key of ['source']) {
    try {
      if (!['http:', 'https:'].includes(new URL(shop[key]).protocol)) throw new Error();
    } catch {
      throw new HttpError(400, 'Trang nguồn cần là liên kết HTTP hoặc HTTPS hợp lệ.');
    }
  }
  shop.phone = String(shop.phone || '').trim();
  shop.verifiedAt = String(shop.verifiedAt || new Date().toISOString().slice(0, 10));
  shop.isActive = shop.isActive !== false;
  const result = await pool.query(
    `INSERT INTO shops (id, data, is_active, sort_order)
     VALUES ($1, $2::jsonb, $3, (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM shops))
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, is_active = EXCLUDED.is_active, updated_at = NOW()
     RETURNING data, is_active AS "isActive"`,
    [shop.id, JSON.stringify(shop), shop.isActive],
  );
  return { ...result.rows[0].data, isActive: result.rows[0].isActive };
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

  if (request.method === 'GET' && pathname === '/api/shops') {
    const result = await pool.query('SELECT data FROM shops WHERE is_active ORDER BY sort_order, id');
    send(response, 200, result.rows.map((row) => row.data));
    return;
  }

  if (request.method === 'GET' && pathname === '/api/admin/shops') {
    await requireUser(request, 'admin');
    const result = await pool.query('SELECT data, is_active AS "isActive" FROM shops ORDER BY sort_order, id');
    send(response, 200, { shops: result.rows.map((row) => ({ ...row.data, isActive: row.isActive })) });
    return;
  }

  if (request.method === 'PUT' && pathname === '/api/admin/shops') {
    await requireUser(request, 'admin');
    const body = await readBody(request);
    send(response, 200, { shop: await saveShop(body) });
    return;
  }

  const shopStatusMatch = pathname.match(/^\/api\/admin\/shops\/([a-z0-9-]{1,100})\/status$/);
  if (request.method === 'PATCH' && shopStatusMatch) {
    await requireUser(request, 'admin');
    const body = await readBody(request);
    if (typeof body.isActive !== 'boolean') throw new HttpError(400, 'Trạng thái cửa hàng không hợp lệ.');
    const result = await pool.query(
      'UPDATE shops SET is_active = $1, data = jsonb_set(data, \'{isActive}\', to_jsonb($1::boolean), true), updated_at = NOW() WHERE id = $2 RETURNING data, is_active AS "isActive"',
      [body.isActive, shopStatusMatch[1]],
    );
    if (!result.rowCount) throw new HttpError(404, 'Không tìm thấy cửa hàng.');
    send(response, 200, { shop: { ...result.rows[0].data, isActive: result.rows[0].isActive } });
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

  if (request.method === 'GET' && pathname === '/api/aquariums') {
    const user = await requireUser(request, 'customer');
    const result = await pool.query(
      `SELECT a.id, a.name, a.volume_liters AS "volumeLiters", a.fish_ids AS "fishIds",
              a.created_at AS "createdAt",
              COALESCE((SELECT jsonb_agg(jsonb_build_object(
                'id', t.id, 'title', t.title, 'dueDate', t.due_date,
                'cadenceDays', t.cadence_days, 'completedAt', t.completed_at
              ) ORDER BY t.completed_at NULLS FIRST, t.due_date) FROM care_tasks t WHERE t.aquarium_id = a.id), '[]'::jsonb) AS tasks,
              COALESCE((SELECT jsonb_agg(jsonb_build_object(
                'id', l.id, 'title', l.title, 'note', l.note, 'completedAt', l.completed_at
              ) ORDER BY l.completed_at DESC) FROM care_logs l WHERE l.aquarium_id = a.id), '[]'::jsonb) AS logs
         FROM aquariums a WHERE a.user_id = $1 ORDER BY a.created_at DESC`,
      [user.id],
    );
    send(response, 200, { aquariums: result.rows });
    return;
  }

  if (request.method === 'POST' && pathname === '/api/aquariums') {
    const user = await requireUser(request, 'customer');
    const body = await readBody(request);
    const name = String(body.name || '').trim();
    const volumeLiters = Number(body.volumeLiters);
    const fishIds = Array.isArray(body.fishIds) ? [...new Set(body.fishIds)] : [];
    if (!name || name.length > 100 || !Number.isInteger(volumeLiters) || volumeLiters < 1 || volumeLiters > 1000000) {
      throw new HttpError(400, 'Nhập tên bể và dung tích nguyên từ 1 đến 1.000.000 lít.');
    }
    if (fishIds.length > 50 || fishIds.some((id) => typeof id !== 'string')) throw new HttpError(400, 'Danh sách cá trong bể không hợp lệ.');
    if (fishIds.length) {
      const found = await pool.query('SELECT id FROM fish WHERE id = ANY($1::varchar[])', [fishIds]);
      if (found.rowCount !== fishIds.length) throw new HttpError(400, 'Danh sách có loài cá không tồn tại.');
    }
    const result = await pool.query(
      'INSERT INTO aquariums (user_id, name, volume_liters, fish_ids) VALUES ($1, $2, $3, $4::jsonb) RETURNING id, name, volume_liters AS "volumeLiters", fish_ids AS "fishIds", created_at AS "createdAt"',
      [user.id, name, volumeLiters, JSON.stringify(fishIds)],
    );
    send(response, 201, { aquarium: { ...result.rows[0], tasks: [], logs: [] } });
    return;
  }

  const aquariumMatch = pathname.match(/^\/api\/aquariums\/(\d+)$/);
  if (request.method === 'DELETE' && aquariumMatch) {
    const user = await requireUser(request, 'customer');
    const result = await pool.query('DELETE FROM aquariums WHERE id = $1 AND user_id = $2 RETURNING id', [aquariumMatch[1], user.id]);
    if (!result.rowCount) throw new HttpError(404, 'Không tìm thấy bể cá của bạn.');
    send(response, 200, { id: result.rows[0].id });
    return;
  }

  const aquariumTasksMatch = pathname.match(/^\/api\/aquariums\/(\d+)\/(tasks|logs)$/);
  if (request.method === 'POST' && aquariumTasksMatch) {
    const user = await requireUser(request, 'customer');
    const aquariumId = aquariumTasksMatch[1];
    const body = await readBody(request);
    const owner = await pool.query('SELECT id FROM aquariums WHERE id = $1 AND user_id = $2', [aquariumId, user.id]);
    if (!owner.rowCount) throw new HttpError(404, 'Không tìm thấy bể cá của bạn.');
    const title = String(body.title || '').trim();
    if (!title || title.length > 160) throw new HttpError(400, 'Tên công việc cần từ 1 đến 160 ký tự.');
    if (aquariumTasksMatch[2] === 'tasks') {
      const dueDate = String(body.dueDate || '');
      const cadenceDays = body.cadenceDays === '' || body.cadenceDays == null ? null : Number(body.cadenceDays);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || (cadenceDays !== null && (!Number.isInteger(cadenceDays) || cadenceDays < 1 || cadenceDays > 365))) {
        throw new HttpError(400, 'Chọn ngày đến hạn hợp lệ; chu kỳ lặp cần từ 1 đến 365 ngày.');
      }
      const result = await pool.query(
        'INSERT INTO care_tasks (aquarium_id, title, due_date, cadence_days) VALUES ($1, $2, $3, $4) RETURNING id, title, due_date AS "dueDate", cadence_days AS "cadenceDays", completed_at AS "completedAt"',
        [aquariumId, title, dueDate, cadenceDays],
      );
      send(response, 201, { task: result.rows[0] });
    } else {
      const note = String(body.note || '').trim().slice(0, 2000);
      const result = await pool.query(
        'INSERT INTO care_logs (aquarium_id, user_id, title, note) VALUES ($1, $2, $3, $4) RETURNING id, title, note, completed_at AS "completedAt"',
        [aquariumId, user.id, title, note],
      );
      send(response, 201, { log: result.rows[0] });
    }
    return;
  }

  const completeTaskMatch = pathname.match(/^\/api\/aquariums\/(\d+)\/tasks\/(\d+)\/complete$/);
  if (request.method === 'POST' && completeTaskMatch) {
    const user = await requireUser(request, 'customer');
    const aquariumId = completeTaskMatch[1];
    const taskId = completeTaskMatch[2];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const taskResult = await client.query(
        `SELECT t.id, t.title, t.cadence_days AS "cadenceDays" FROM care_tasks t
          JOIN aquariums a ON a.id = t.aquarium_id
         WHERE t.id = $1 AND t.aquarium_id = $2 AND a.user_id = $3 AND t.completed_at IS NULL FOR UPDATE`,
        [taskId, aquariumId, user.id],
      );
      if (!taskResult.rowCount) throw new HttpError(404, 'Không tìm thấy công việc chưa hoàn tất.');
      const task = taskResult.rows[0];
      const log = await client.query(
        'INSERT INTO care_logs (aquarium_id, user_id, task_id, title) VALUES ($1, $2, $3, $4) RETURNING id, title, note, completed_at AS "completedAt"',
        [aquariumId, user.id, taskId, task.title],
      );
      const updated = task.cadenceDays
        ? await client.query('UPDATE care_tasks SET due_date = GREATEST(due_date, CURRENT_DATE) + cadence_days WHERE id = $1 RETURNING id, title, due_date AS "dueDate", cadence_days AS "cadenceDays", completed_at AS "completedAt"', [taskId])
        : await client.query('UPDATE care_tasks SET completed_at = NOW() WHERE id = $1 RETURNING id, title, due_date AS "dueDate", cadence_days AS "cadenceDays", completed_at AS "completedAt"', [taskId]);
      await client.query('COMMIT');
      send(response, 200, { task: updated.rows[0], log: log.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
    return;
  }

  if (request.method === 'POST' && pathname === '/api/reports') {
    const user = await requireUser(request, 'customer');
    const body = await readBody(request);
    const targetType = String(body.targetType || '');
    const targetId = String(body.targetId || '').trim();
    const targetLabel = String(body.targetLabel || '').trim();
    const message = String(body.message || '').trim();
    if (!['fish', 'shop'].includes(targetType) || !targetId || targetId.length > 100 || !targetLabel || targetLabel.length > 200 || message.length < 10 || message.length > 2000) {
      throw new HttpError(400, 'Chọn nội dung cần góp ý và nhập mô tả từ 10 đến 2.000 ký tự.');
    }
    if (targetType === 'fish') {
      const exists = await pool.query('SELECT 1 FROM fish WHERE id = $1', [targetId]);
      if (!exists.rowCount) throw new HttpError(404, 'Không tìm thấy hồ sơ cá này.');
    }
    const result = await pool.query(
      'INSERT INTO content_reports (user_id, target_type, target_id, target_label, message) VALUES ($1, $2, $3, $4, $5) RETURNING id, status, created_at AS "createdAt"',
      [user.id, targetType, targetId, targetLabel, message],
    );
    send(response, 201, { report: result.rows[0] });
    return;
  }

  if (request.method === 'GET' && pathname === '/api/admin/reports') {
    await requireUser(request, 'admin');
    const result = await pool.query(
      `SELECT r.id, r.target_type AS "targetType", r.target_id AS "targetId", r.target_label AS "targetLabel",
              r.message, r.status, r.admin_note AS "adminNote", r.created_at AS "createdAt",
              u.display_name AS "userName", u.email AS "userEmail"
         FROM content_reports r JOIN users u ON u.id = r.user_id ORDER BY r.created_at DESC LIMIT 500`,
    );
    send(response, 200, { reports: result.rows });
    return;
  }

  const reportMatch = pathname.match(/^\/api\/admin\/reports\/(\d+)$/);
  if (request.method === 'PATCH' && reportMatch) {
    await requireUser(request, 'admin');
    const body = await readBody(request);
    const status = String(body.status || '');
    const adminNote = String(body.adminNote || '').trim().slice(0, 2000);
    if (!['open', 'reviewing', 'resolved', 'dismissed'].includes(status)) throw new HttpError(400, 'Trạng thái báo cáo không hợp lệ.');
    const result = await pool.query(
      'UPDATE content_reports SET status = $1, admin_note = $2, updated_at = NOW() WHERE id = $3 RETURNING id, status, admin_note AS "adminNote"',
      [status, adminNote, reportMatch[1]],
    );
    if (!result.rowCount) throw new HttpError(404, 'Không tìm thấy báo cáo.');
    send(response, 200, { report: result.rows[0] });
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
    for (const item of body.fish) imported.push(await saveFish(item, { allowIncomplete: true }));
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
  const qualityMigration = await readFile(new URL('./db/migrations/005_add_fish_quality_fields.sql', import.meta.url), 'utf8');
  await pool.query(qualityMigration);
  const catalogMigration = await readFile(new URL('./db/migrations/006_complete_initial_fish_catalog.sql', import.meta.url), 'utf8');
  await pool.query(catalogMigration);
  const workspaceMigration = await readFile(new URL('./db/migrations/007_customer_workspace.sql', import.meta.url), 'utf8');
  await pool.query(workspaceMigration);
  const familyMigration = await readFile(new URL('./db/migrations/008_catalog_family_groups.sql', import.meta.url), 'utf8');
  await pool.query(familyMigration);
  const shopsMigration = await readFile(new URL('./db/migrations/010_shop_directory.sql', import.meta.url), 'utf8');
  await pool.query(shopsMigration);
  const legacySpeciesFamilies = {
    'molly': 'livebearer', 'swordtail': 'livebearer', 'zebra-danio': 'danio', 'white-cloud-minnow': 'danio',
    'harlequin-rasbora': 'rasbora', 'cherry-barb': 'barb', 'tiger-barb': 'barb', 'pearl-gourami': 'gourami',
    'dwarf-gourami': 'gourami', 'discus': 'cichlid', 'oscar': 'cichlid', 'koi': 'coldwater', 'corydoras': 'catfish',
    'bristlenose-pleco': 'catfish', 'common-pleco': 'catfish', 'kuhli-loach': 'loach', 'siamese-algae-eater': 'other',
    'rainbow-shark': 'shark', 'flowerhorn': 'cichlid', 'silver-arowana': 'tankbuster', 'glowlight-tetra': 'tetra',
    'black-skirt-tetra': 'tetra', 'electric-blue-ram': 'cichlid', 'redtail-shark': 'shark', 'common-carp-koi': 'coldwater',
  };
  for (const [id, family] of Object.entries(legacySpeciesFamilies)) {
    await pool.query(
      `UPDATE fish SET data = jsonb_set(data, '{family}', to_jsonb($2::text), true)
        WHERE id = $1 AND NOT (data ? 'family')`,
      [id, family],
    );
  }

  const catalogSchemaMigration = await readFile(new URL('./db/migrations/009_expand_freshwater_catalog.sql', import.meta.url), 'utf8');
  await pool.query(catalogSchemaMigration);
  const seedFish = JSON.parse(await readFile(new URL('./db/seeds/fish.json', import.meta.url), 'utf8'));
  const catalogUpdate = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', ['009_expand_freshwater_catalog']);
  if (!catalogUpdate.rowCount) {
    // This is a one-time catalog upgrade, not a recurring seed. It never overwrites
    // an existing admin profile and won't re-add fish an admin removes later.
    const newProfiles = seedFish.filter((item) => item.dataStatus === 'needs-review');
    for (const [index, item] of newProfiles.entries()) {
      await pool.query(
        'INSERT INTO fish (id, data, sort_order) VALUES ($1, $2::jsonb, (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM fish)) ON CONFLICT (id) DO NOTHING',
        [item.id, JSON.stringify(item)],
      );
    }
    await pool.query('INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING', ['009_expand_freshwater_catalog']);
  }

  const shopSeedUpdate = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', ['010_shop_directory']);
  if (!shopSeedUpdate.rowCount) {
    const seedShops = JSON.parse(await readFile(new URL('./db/seeds/shops.json', import.meta.url), 'utf8'));
    for (const shop of seedShops) {
      await pool.query(
        'INSERT INTO shops (id, data, is_active, sort_order) VALUES ($1, $2::jsonb, $3, $4) ON CONFLICT (id) DO NOTHING',
        [shop.id, JSON.stringify(shop), shop.isActive !== false, seedShops.indexOf(shop)],
      );
    }
    await pool.query('INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING', ['010_shop_directory']);
  }

  const fishRepairMigration = await readFile(new URL('./db/migrations/011_freshwater_fish_and_images.sql', import.meta.url), 'utf8');
  await pool.query(fishRepairMigration);
  const fishRepairUpdate = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', ['011_freshwater_fish_and_images']);
  if (!fishRepairUpdate.rowCount) {
    // Add new profiles once; existing/admin-edited fish are kept. Image repairs
    // below intentionally replace only the two image fields and their credits.
    const expandedSeed = JSON.parse(await readFile(new URL('./db/seeds/fish.json', import.meta.url), 'utf8'));
    for (const item of expandedSeed.filter((profile) => profile.dataStatus === 'needs-review')) {
      await pool.query(
        'INSERT INTO fish (id, data, sort_order) VALUES ($1, $2::jsonb, (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM fish)) ON CONFLICT (id) DO NOTHING',
        [item.id, JSON.stringify(item)],
      );
    }
    const imageFixes = JSON.parse(await readFile(new URL('./db/seeds/fish-image-fixes.json', import.meta.url), 'utf8'));
    for (const fix of imageFixes) {
      await pool.query(
        `UPDATE fish
            SET data = jsonb_set(jsonb_set(jsonb_set(data, '{image}', to_jsonb($2::text), true),
                '{imageSource}', to_jsonb($3::text), true), '{imageCredit}', to_jsonb($4::text), true),
                updated_at = NOW()
          WHERE id = $1`,
        [fix.id, fix.image, fix.imageSource, fix.imageCredit],
      );
    }
    await pool.query('INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING', ['011_freshwater_fish_and_images']);
  }

  const moreImageRepairMigration = await readFile(new URL('./db/migrations/012_repair_more_fish_images.sql', import.meta.url), 'utf8');
  await pool.query(moreImageRepairMigration);
  const moreImageRepairUpdate = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', ['012_repair_more_fish_images']);
  if (!moreImageRepairUpdate.rowCount) {
    const imageFixes = JSON.parse(await readFile(new URL('./db/seeds/fish-image-fixes.json', import.meta.url), 'utf8'));
    for (const fix of imageFixes) {
      await pool.query(
        `UPDATE fish
            SET data = jsonb_set(jsonb_set(jsonb_set(data, '{image}', to_jsonb($2::text), true),
                '{imageSource}', to_jsonb($3::text), true), '{imageCredit}', to_jsonb($4::text), true),
                updated_at = NOW()
          WHERE id = $1`,
        [fix.id, fix.image, fix.imageSource, fix.imageCredit],
      );
    }
    await pool.query('INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING', ['012_repair_more_fish_images']);
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
