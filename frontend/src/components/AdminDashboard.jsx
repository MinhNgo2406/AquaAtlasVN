import { useEffect, useState } from 'react';

const emptyFish = {
  id: '', name: '', scientificName: '', description: '', group: 'tropical', level: 'easy',
  category: 'NƯỚC NGỌT · NHIỆT ĐỚI', difficulty: 'Dễ bắt đầu', summary: '', tank: '',
  minTankLiters: '', temperament: 'peaceful', compatibilityGroup: 'community',
  family: 'other',
  temperature: '', ph: '', groupSize: '', food: '', compatibility: '', image: '', video: '',
  videoType: 'video/mp4', videoCredit: '', videoSource: '', imageCredit: '', imageSource: '',
  sources: [], sourceLabel: '', sourceUrl: '',
};

const emptyShop = {
  id: '', name: '', city: 'hcm', address: '', phone: '', hours: '', verifiedAt: new Date().toISOString().slice(0, 10),
  verification: 'Website cửa hàng', note: '', source: '', sourceLabel: '', isActive: true,
};

const shopFields = [
  ['name', 'Tên cửa hàng'], ['address', 'Địa chỉ'], ['phone', 'Số điện thoại'],
  ['hours', 'Giờ mở cửa'], ['verifiedAt', 'Ngày đối chiếu nguồn'], ['verification', 'Loại nguồn xác minh'],
  ['sourceLabel', 'Tên trang nguồn'], ['source', 'Liên kết trang nguồn'], ['note', 'Ghi chú cho khách'],
];

const editableFields = [
  ['name', 'Tên thường gọi'], ['scientificName', 'Tên khoa học'], ['description', 'Mô tả ngắn'],
  ['category', 'Nhãn nhóm hiển thị'],
  ['summary', 'Kích thước / đặc điểm'], ['tank', 'Kích thước bể'], ['temperature', 'Nhiệt độ'],
  ['ph', 'Độ pH'], ['groupSize', 'Nuôi theo nhóm'], ['food', 'Thức ăn'],
  ['compatibility', 'Khả năng sống chung'], ['image', 'Đường dẫn ảnh'],
  ['video', 'Đường dẫn video (MP4/WebM)'], ['videoType', 'Định dạng video'],
  ['videoCredit', 'Tác giả / giấy phép video'], ['videoSource', 'Trang nguồn video'],
  ['imageCredit', 'Tác giả / giấy phép ảnh'], ['imageSource', 'Trang nguồn ảnh'],
  ['sourceLabel', 'Tên nguồn tham khảo'], ['sourceUrl', 'Liên kết nguồn tham khảo'],
];

const urlFields = new Set(['image', 'video', 'imageSource', 'videoSource', 'sourceUrl']);

function createSlug(value) {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminDashboard({ fish, shops, onSaveFish, onDeleteFish, onSaveShop, onSetShopActive, onExit, onLogout, user }) {
  const [form, setForm] = useState(null);
  const [shopForm, setShopForm] = useState(null);
  const [notice, setNotice] = useState('');
  const [reports, setReports] = useState([]);
  const [adminShops, setAdminShops] = useState(shops);

  async function loadReports() {
    const response = await fetch('/api/admin/reports', { credentials: 'same-origin' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Không tải được góp ý.');
    setReports(data.reports || []);
  }

  useEffect(() => { loadReports().catch((error) => setNotice(error.message)); }, []);

  useEffect(() => {
    fetch('/api/admin/shops', { credentials: 'same-origin' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Không tải được danh sách cửa hàng.');
        setAdminShops(data.shops || []);
      })
      .catch((error) => setNotice(error.message));
  }, []);

  async function updateReport(report, status, adminNote) {
    const response = await fetch(`/api/admin/reports/${report.id}`, { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, adminNote }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Không cập nhật được góp ý.');
    setReports((current) => current.map((item) => item.id === report.id ? { ...item, ...data.report } : item));
    setNotice(`Đã cập nhật góp ý về “${report.targetLabel}”.`);
  }

  async function handleSave(event) {
    event.preventDefault();
    const id = form.id || createSlug(form.name);
    const { sourceLabel, sourceUrl, ...fishFields } = form;
    const nextFish = {
      ...fishFields,
      id,
      category: form.category || (form.group === 'coldwater' ? 'NƯỚC NGỌT · NƯỚC MÁT' : 'NƯỚC NGỌT · NHIỆT ĐỚI'),
      sources: sourceUrl ? [{ label: sourceLabel || 'Nguồn tham khảo', url: sourceUrl }] : (form.sources || []),
    };
    try {
      await onSaveFish(nextFish);
      setNotice(`Đã lưu hồ sơ “${form.name}” vào PostgreSQL.`);
      setForm(null);
    } catch (error) {
      setNotice(error.message || 'Không lưu được hồ sơ. Hãy thử lại.');
    }
  }

  async function handleSaveShop(event) {
    event.preventDefault();
    const shop = { ...shopForm, id: shopForm.id || createSlug(shopForm.name) };
    try {
      const savedShop = await onSaveShop(shop);
      setAdminShops((current) => current.some((item) => item.id === savedShop.id)
        ? current.map((item) => item.id === savedShop.id ? savedShop : item)
        : [...current, savedShop]);
      setNotice(`Đã lưu “${savedShop.name}” vào PostgreSQL.`);
      setShopForm(null);
    } catch (error) {
      setNotice(error.message || 'Không lưu được cửa hàng. Hãy kiểm tra các trường và thử lại.');
    }
  }

  async function toggleShop(shop) {
    try {
      await onSetShopActive(shop.id, !shop.isActive);
      setAdminShops((current) => current.map((item) => item.id === shop.id ? { ...item, isActive: !shop.isActive } : item));
      setNotice(shop.isActive ? `Đã ẩn “${shop.name}” khỏi trang khách.` : `Đã hiển thị lại “${shop.name}”.`);
    } catch (error) {
      setNotice(error.message || 'Không cập nhật được trạng thái cửa hàng.');
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); onExit(); }}><span className="brand-mark">≈</span><span>AquaAtlas<span className="brand-dot">.</span></span></a>
        <div><span className="admin-user-name">Xin chào, {user?.name}</span><button className="admin-secondary" onClick={onLogout}>Đăng xuất</button><button className="admin-secondary" onClick={onExit}>Xem website ↗</button></div>
      </header>
      <section className="admin-content">
        <div className="admin-heading"><div><div className="eyebrow"><span /> DASHBOARD ADMIN</div><h1>Quản lý cá cảnh</h1><p>Thêm hoặc cập nhật hồ sơ. Thay đổi được lưu trong PostgreSQL và dùng chung cho khách truy cập.</p></div><button className="admin-primary" onClick={() => { setNotice(''); setForm({ ...emptyFish }); }}>+ Thêm loài cá</button></div>
        <div className="admin-warning"><strong>Lưu ý:</strong> dữ liệu được gửi tới backend. Hãy dùng ảnh/video có nguồn và quyền sử dụng phù hợp.</div>
        {notice && <p className="admin-success" role="status">{notice}</p>}
        {form && (
          <form className="admin-editor" onSubmit={handleSave}>
            <div className="admin-editor-title"><h2>{form.id ? 'Chỉnh sửa hồ sơ' : 'Thêm loài cá'}</h2><button type="button" className="admin-secondary" onClick={() => setForm(null)}>Đóng</button></div>
            <div className="admin-form-grid">
              {editableFields.map(([key, label]) => <label key={key}>{label}<input type={urlFields.has(key) ? 'url' : 'text'} value={form[key] ?? ''} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required={['name', 'scientificName', 'tank', 'temperature', 'ph', 'image', 'imageCredit', 'imageSource', 'sourceLabel', 'sourceUrl'].includes(key)} /></label>)}
              <label>Dung tích tối thiểu để lọc (L)<input type="number" min="1" max="100000" value={form.minTankLiters ?? ''} onChange={(event) => setForm({ ...form, minTankLiters: Number(event.target.value) })} required /></label>
              <label>Nhóm loài<select value={form.family || 'other'} onChange={(event) => setForm({ ...form, family: event.target.value })}><option value="livebearer">Cá đẻ con</option><option value="tetra">Tetra</option><option value="rainbowfish">Cá cầu vồng</option><option value="danio">Danio</option><option value="rasbora">Rasbora</option><option value="barb">Barb</option><option value="gourami">Cá sặc</option><option value="cichlid">Cichlid</option><option value="catfish">Cá da trơn</option><option value="loach">Cá chạch</option><option value="shark">Cá mập nước ngọt</option><option value="coldwater">Cá nước mát</option><option value="tankbuster">Cá kích thước lớn</option><option value="betta">Betta</option><option value="other">Khác</option></select></label>
              <label>Tính cách<select value={form.temperament} onChange={(event) => setForm({ ...form, temperament: event.target.value })}><option value="peaceful">Hiền</option><option value="active">Bơi khỏe, hoạt động nhiều</option><option value="independent">Độc lập</option><option value="semi-aggressive">Cần chọn bạn bể kỹ</option></select></label>
              <label>Phân loại bể nuôi chung<select value={form.compatibilityGroup} onChange={(event) => setForm({ ...form, compatibilityGroup: event.target.value })}><option value="community">Bể cộng đồng hiền</option><option value="separate">Nên nuôi riêng</option><option value="coldwater-community">Bể cộng đồng nước mát</option><option value="large-community">Bể cộng đồng cá lớn</option></select></label>
              <label>Nhóm<select value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value })}><option value="tropical">Nhiệt đới</option><option value="coldwater">Nước mát</option></select></label>
              <label>Độ khó<select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value, difficulty: event.target.value === 'easy' ? 'Dễ bắt đầu' : 'Cần chú ý' })}><option value="easy">Dễ bắt đầu</option><option value="medium">Cần chú ý</option></select></label>
            </div>
            <div className="admin-editor-actions"><button type="submit" className="admin-primary">Lưu hồ sơ</button><button type="button" className="admin-secondary" onClick={() => setForm(null)}>Hủy</button></div>
          </form>
        )}
        <div className="admin-fish-list">
          {fish.map((item) => (
            <article className="admin-fish-row" key={item.id}>
              <img src={item.image} alt="" onError={(event) => { event.currentTarget.src = '/images/fish-placeholder.svg'; }} /><div className="admin-fish-info"><h2>{item.name}</h2><p><em>{item.scientificName}</em> · {item.group === 'coldwater' ? 'Nước mát' : 'Nhiệt đới'}</p></div>
              <div className="admin-row-actions"><button className="admin-secondary" onClick={() => { setNotice(''); setForm({ ...emptyFish, ...item, sourceLabel: item.sources?.[0]?.label || '', sourceUrl: item.sources?.[0]?.url || '' }); }}>Sửa</button><button className="admin-danger" onClick={async () => { if (!window.confirm(`Xóa hồ sơ ${item.name}?`)) return; try { await onDeleteFish(item.id); setNotice(`Đã xóa “${item.name}” khỏi PostgreSQL.`); } catch (error) { setNotice(error.message || 'Không xóa được hồ sơ.'); } }}>Xóa</button></div>
            </article>
          ))}
        </div>
        <section className="admin-shop-manager">
          <div className="admin-heading"><div><div className="eyebrow"><span /> DANH BẠ CỬA HÀNG</div><h2>Quản lý cửa hàng</h2><p>Thêm, cập nhật thông tin hoặc ẩn cửa hàng khỏi danh sách công khai.</p></div><button className="admin-primary" onClick={() => { setNotice(''); setShopForm({ ...emptyShop }); }}>+ Thêm cửa hàng</button></div>
          {shopForm && <form className="admin-editor" onSubmit={handleSaveShop}>
            <div className="admin-editor-title"><h2>{shopForm.id ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng'}</h2><button type="button" className="admin-secondary" onClick={() => setShopForm(null)}>Đóng</button></div>
            <div className="admin-form-grid">
              {shopFields.map(([key, label]) => <label key={key}>{label}<input type={key === 'source' ? 'url' : key === 'verifiedAt' ? 'date' : 'text'} value={shopForm[key] ?? ''} onChange={(event) => setShopForm({ ...shopForm, [key]: event.target.value })} required={['name', 'address', 'hours', 'verification', 'note', 'source', 'sourceLabel'].includes(key)} /></label>)}
              <label>Tỉnh / thành<select value={shopForm.city} onChange={(event) => setShopForm({ ...shopForm, city: event.target.value })}><option value="hcm">TP. Hồ Chí Minh</option><option value="hanoi">Hà Nội</option><option value="haiphong">Hải Phòng</option><option value="cantho">Cần Thơ</option><option value="nhatrang">Nha Trang</option></select></label>
              <label className="admin-shop-active"><input type="checkbox" checked={shopForm.isActive !== false} onChange={(event) => setShopForm({ ...shopForm, isActive: event.target.checked })} /> Hiển thị trên website</label>
            </div>
            <div className="admin-editor-actions"><button type="submit" className="admin-primary">Lưu cửa hàng</button><button type="button" className="admin-secondary" onClick={() => setShopForm(null)}>Hủy</button></div>
          </form>}
          <div className="admin-fish-list">
            {adminShops.map((shop) => <article className="admin-fish-row admin-shop-row" key={shop.id}>
              <div className="admin-fish-info"><h2>{shop.name} {!shop.isActive && <span className="admin-shop-hidden">Đang ẩn</span>}</h2><p>{shop.address} · {shop.city} · {shop.phone || 'Chưa có số điện thoại'}</p></div>
              <div className="admin-row-actions"><button className="admin-secondary" onClick={() => { setNotice(''); setShopForm({ ...emptyShop, ...shop }); }}>Sửa</button><button className="admin-secondary" onClick={() => toggleShop(shop)}>{shop.isActive ? 'Ẩn' : 'Hiển thị'}</button></div>
            </article>)}
          </div>
        </section>
        <section className="admin-report-queue">
          <div className="eyebrow"><span /> GÓP Ý TỪ KHÁCH</div><h2>Duyệt thông tin cần sửa</h2>
          {!reports.length && <p className="empty-state">Chưa có báo cáo nào. Góp ý mới từ khách sẽ xuất hiện ở đây.</p>}
          {reports.map((report) => <article className="admin-report-card" key={report.id}>
            <header><strong>{report.targetType === 'fish' ? 'Hồ sơ cá' : 'Cửa hàng'}: {report.targetLabel}</strong><span>{new Date(report.createdAt).toLocaleString('vi-VN')} · {report.userName} ({report.userEmail})</span></header>
            <p>{report.message}</p>
            <div className="admin-report-controls"><select aria-label={`Trạng thái báo cáo ${report.id}`} value={report.status} onChange={(event) => updateReport(report, event.target.value, report.adminNote).catch((error) => setNotice(error.message))}><option value="open">Mới</option><option value="reviewing">Đang xem</option><option value="resolved">Đã xử lý</option><option value="dismissed">Không áp dụng</option></select><input aria-label="Ghi chú nội bộ cho báo cáo" value={report.adminNote || ''} onChange={(event) => setReports((current) => current.map((item) => item.id === report.id ? { ...item, adminNote: event.target.value } : item))} placeholder="Ghi chú nội bộ" /><button className="admin-secondary" onClick={() => updateReport(report, report.status, report.adminNote).catch((error) => setNotice(error.message))}>Lưu ghi chú</button></div>
          </article>)}
        </section>
      </section>
    </main>
  );
}
