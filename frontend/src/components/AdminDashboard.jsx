import { useState } from 'react';

const emptyFish = {
  id: '', name: '', scientificName: '', description: '', group: 'tropical', level: 'easy',
  category: 'NƯỚC NGỌT · NHIỆT ĐỚI', difficulty: 'Dễ bắt đầu', summary: '', tank: '',
  temperature: '', ph: '', groupSize: '', food: '', compatibility: '', image: '', video: '',
  videoType: 'video/mp4', videoCredit: '', videoSource: '', imageCredit: '', imageSource: '',
  sources: [], sourceLabel: '', sourceUrl: '',
};

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

function createSlug(value) {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminDashboard({ fish, onSaveFish, onDeleteFish, onExit, onLogout, user }) {
  const [form, setForm] = useState(null);
  const [notice, setNotice] = useState('');

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
              {editableFields.map(([key, label]) => <label key={key}>{label}<input value={form[key] ?? ''} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required={['name', 'scientificName', 'tank', 'temperature', 'ph'].includes(key)} /></label>)}
              <label>Nhóm<select value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value })}><option value="tropical">Nhiệt đới</option><option value="coldwater">Nước mát</option></select></label>
              <label>Độ khó<select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value, difficulty: event.target.value === 'easy' ? 'Dễ bắt đầu' : 'Cần chú ý' })}><option value="easy">Dễ bắt đầu</option><option value="medium">Cần chú ý</option></select></label>
            </div>
            <div className="admin-editor-actions"><button type="submit" className="admin-primary">Lưu hồ sơ</button><button type="button" className="admin-secondary" onClick={() => setForm(null)}>Hủy</button></div>
          </form>
        )}
        <div className="admin-fish-list">
          {fish.map((item) => (
            <article className="admin-fish-row" key={item.id}>
              <img src={item.image} alt="" /><div className="admin-fish-info"><h2>{item.name}</h2><p><em>{item.scientificName}</em> · {item.group === 'coldwater' ? 'Nước mát' : 'Nhiệt đới'}</p></div>
              <div className="admin-row-actions"><button className="admin-secondary" onClick={() => { setNotice(''); setForm({ ...emptyFish, ...item, sourceLabel: item.sources?.[0]?.label || '', sourceUrl: item.sources?.[0]?.url || '' }); }}>Sửa</button><button className="admin-danger" onClick={async () => { if (!window.confirm(`Xóa hồ sơ ${item.name}?`)) return; try { await onDeleteFish(item.id); setNotice(`Đã xóa “${item.name}” khỏi PostgreSQL.`); } catch (error) { setNotice(error.message || 'Không xóa được hồ sơ.'); } }}>Xóa</button></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
