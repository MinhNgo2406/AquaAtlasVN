const baseUrl = (process.env.BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
const checks = [];

async function request(path, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`);
  if (response.status !== expectedStatus) {
    throw new Error(`${path}: expected HTTP ${expectedStatus}, received ${response.status}`);
  }
  return response;
}

async function check(label, callback) {
  await callback();
  checks.push(label);
}

try {
  await check('Trang chủ được phục vụ', async () => {
    const response = await request('/');
    const html = await response.text();
    if (!html.includes('<div id="root"></div>')) throw new Error('Không tìm thấy React root trong HTML.');
  });

  await check('API và PostgreSQL hoạt động', async () => {
    const health = await (await request('/api/health')).json();
    if (health.status !== 'ok' || health.database !== 'connected') throw new Error('Health check không báo database connected.');
  });

  await check('Danh mục cá có dữ liệu cơ bản hợp lệ', async () => {
    const fish = await (await request('/api/fish')).json();
    if (!Array.isArray(fish) || fish.length < 6) throw new Error('Danh mục cá trống hoặc thiếu hồ sơ.');
    const ids = fish.map((item) => item.id);
    if (new Set(ids).size !== ids.length) throw new Error('Có ID cá bị trùng.');
    if (fish.some((item) => !item.name || !item.scientificName || !item.image)) throw new Error('Có hồ sơ cá thiếu tên, tên khoa học hoặc ảnh.');
  });

  await check('Danh bạ cửa hàng có trường hiển thị cần thiết', async () => {
    const shops = await (await request('/api/shops')).json();
    if (!Array.isArray(shops) || shops.length < 3) throw new Error('Danh bạ cửa hàng trống hoặc thiếu dữ liệu.');
    if (shops.some((shop) => !shop.id || !shop.name || !shop.address || !shop.source)) throw new Error('Có cửa hàng thiếu tên, địa chỉ hoặc nguồn.');
  });

  await check('API cá nhân và quản trị từ chối khách chưa đăng nhập', async () => {
    for (const path of ['/api/auth/me', '/api/favorites', '/api/aquariums', '/api/admin/reports']) {
      await request(path, 401);
    }
  });

  console.log(`ĐẠT ${checks.length} kiểm tra khói tại ${baseUrl}:`);
  for (const label of checks) console.log(`- ${label}`);
} catch (error) {
  console.error(`KHÔNG ĐẠT tại ${baseUrl}: ${error.message}`);
  process.exitCode = 1;
}
