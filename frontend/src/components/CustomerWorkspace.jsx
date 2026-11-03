import { useEffect, useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Không kết nối được máy chủ.');
  return data;
}

export default function CustomerWorkspace({ fish, user }) {
  const [aquariums, setAquariums] = useState([]);
  const [name, setName] = useState('');
  const [volumeLiters, setVolumeLiters] = useState('');
  const [fishIds, setFishIds] = useState([]);
  const [taskDrafts, setTaskDrafts] = useState({});
  const [logDrafts, setLogDrafts] = useState({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const data = await api('/api/aquariums');
    setAquariums(data.aquariums);
  }

  useEffect(() => { refresh().catch((error) => setNotice(error.message)); }, []);

  async function addAquarium(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await api('/api/aquariums', { method: 'POST', body: JSON.stringify({ name, volumeLiters: Number(volumeLiters), fishIds }) });
      setName(''); setVolumeLiters(''); setFishIds([]); setNotice('Đã lưu bể cá vào tài khoản của bạn.'); await refresh();
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  async function addTask(aquariumId) {
    const draft = taskDrafts[aquariumId] || {};
    try {
      await api(`/api/aquariums/${aquariumId}/tasks`, { method: 'POST', body: JSON.stringify(draft) });
      setTaskDrafts((current) => ({ ...current, [aquariumId]: { title: '', dueDate: today(), cadenceDays: '' } }));
      setNotice('Đã thêm lịch chăm sóc.'); await refresh();
    } catch (error) { setNotice(error.message); }
  }

  async function completeTask(aquariumId, taskId) {
    try { await api(`/api/aquariums/${aquariumId}/tasks/${taskId}/complete`, { method: 'POST', body: '{}' }); setNotice('Đã ghi nhận công việc hoàn thành.'); await refresh(); }
    catch (error) { setNotice(error.message); }
  }

  async function addLog(aquariumId) {
    const draft = logDrafts[aquariumId] || {};
    try {
      await api(`/api/aquariums/${aquariumId}/logs`, { method: 'POST', body: JSON.stringify(draft) });
      setLogDrafts((current) => ({ ...current, [aquariumId]: { title: '', note: '' } })); setNotice('Đã thêm ghi chú vào nhật ký.'); await refresh();
    } catch (error) { setNotice(error.message); }
  }

  async function deleteAquarium(id) {
    if (!window.confirm('Xóa bể này cùng lịch chăm sóc và nhật ký?')) return;
    try { await api(`/api/aquariums/${id}`, { method: 'DELETE' }); await refresh(); setNotice('Đã xóa hồ sơ bể.'); }
    catch (error) { setNotice(error.message); }
  }

  if (user?.role !== 'customer') return null;

  return (
    <section className="section customer-workspace" id="account-tools">
      <div className="eyebrow"><span /> GÓC CỦA BẠN</div>
      <div className="section-heading compact"><h2>Chăm bể theo<br /><em>lịch riêng.</em></h2><p>Lưu thông tin bể, tạo nhắc việc định kỳ và ghi lại những lần chăm sóc. Nội dung này chỉ thuộc tài khoản của bạn.</p></div>
      {notice && <p className="workspace-notice" role="status">{notice}</p>}
      <form className="workspace-create" onSubmit={addAquarium}>
        <h3>Thêm bể cá</h3>
        <div className="workspace-form-row"><label>Tên bể<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Bể phòng khách" maxLength="100" required /></label><label>Dung tích (lít)<input type="number" min="1" max="1000000" value={volumeLiters} onChange={(event) => setVolumeLiters(event.target.value)} required /></label></div>
        <fieldset className="workspace-fish-picker"><legend>Loài cá đang nuôi (không bắt buộc)</legend>{fish.map((item) => <label key={item.id}><input type="checkbox" checked={fishIds.includes(item.id)} onChange={(event) => setFishIds((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} />{item.name}</label>)}</fieldset>
        <button className="admin-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu bể cá'}</button>
      </form>

      <div className="workspace-aquariums">
        {aquariums.length === 0 && <p className="empty-state">Bạn chưa lưu bể nào. Tạo hồ sơ để bắt đầu theo dõi lịch chăm sóc.</p>}
        {aquariums.map((aquarium) => {
          const selectedFish = fish.filter((item) => aquarium.fishIds.includes(item.id));
          const taskDraft = taskDrafts[aquarium.id] || { title: '', dueDate: today(), cadenceDays: '' };
          const logDraft = logDrafts[aquarium.id] || { title: '', note: '' };
          return <article className="workspace-aquarium" key={aquarium.id}>
            <header><div><h3>{aquarium.name}</h3><p>{aquarium.volumeLiters} L · {selectedFish.length ? selectedFish.map((item) => item.name).join(', ') : 'Chưa ghi loài cá'}</p></div><button type="button" className="admin-danger" onClick={() => deleteAquarium(aquarium.id)}>Xóa bể</button></header>
            <div className="workspace-columns">
              <section><h4>Lịch chăm sóc</h4><form className="workspace-inline-form" onSubmit={(event) => { event.preventDefault(); addTask(aquarium.id); }}><input aria-label="Tên công việc chăm sóc" placeholder="Ví dụ: Thay một phần nước" value={taskDraft.title} onChange={(event) => setTaskDrafts((current) => ({ ...current, [aquarium.id]: { ...taskDraft, title: event.target.value } }))} required /><input type="date" aria-label="Ngày đến hạn" value={taskDraft.dueDate} onChange={(event) => setTaskDrafts((current) => ({ ...current, [aquarium.id]: { ...taskDraft, dueDate: event.target.value } }))} required /><input type="number" min="1" max="365" aria-label="Lặp lại mỗi bao nhiêu ngày" placeholder="Lặp ngày" value={taskDraft.cadenceDays} onChange={(event) => setTaskDrafts((current) => ({ ...current, [aquarium.id]: { ...taskDraft, cadenceDays: event.target.value } }))} /><button className="admin-primary">Thêm</button></form>
                <ul className="workspace-list">{aquarium.tasks.filter((task) => !task.completedAt).map((task) => <li key={task.id}><span><strong>{task.title}</strong><small>Hạn {String(task.dueDate).slice(0, 10)}{task.cadenceDays ? ` · lặp ${task.cadenceDays} ngày` : ''}</small></span><button type="button" className="admin-secondary" onClick={() => completeTask(aquarium.id, task.id)}>Hoàn thành</button></li>)}</ul>
              </section>
              <section><h4>Nhật ký chăm sóc</h4><form className="workspace-log-form" onSubmit={(event) => { event.preventDefault(); addLog(aquarium.id); }}><input aria-label="Tiêu đề ghi chú" placeholder="Ví dụ: Kiểm tra pH" value={logDraft.title} onChange={(event) => setLogDrafts((current) => ({ ...current, [aquarium.id]: { ...logDraft, title: event.target.value } }))} required /><textarea aria-label="Nội dung ghi chú" placeholder="Kết quả đo nước, lượng thức ăn, dấu hiệu quan sát…" value={logDraft.note} onChange={(event) => setLogDrafts((current) => ({ ...current, [aquarium.id]: { ...logDraft, note: event.target.value } }))} /><button className="admin-primary">Ghi nhật ký</button></form>
                <ul className="workspace-list workspace-log-list">{aquarium.logs.slice(0, 8).map((log) => <li key={log.id}><span><strong>{log.title}</strong><small>{new Date(log.completedAt).toLocaleString('vi-VN')} · {log.note || 'Đã đánh dấu hoàn thành'}</small></span></li>)}</ul>
              </section>
            </div>
          </article>;
        })}
      </div>
    </section>
  );
}
