import { useState } from 'react';

export default function ContentReportButton({ user, targetType, targetId, targetLabel }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault(); setBusy(true); setNotice('');
    try {
      const response = await fetch('/api/reports', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetType, targetId, targetLabel, message }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Chưa gửi được góp ý.');
      setNotice('Đã gửi góp ý cho quản trị viên.'); setMessage(''); setOpen(false);
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  if (user?.role !== 'customer') return null;
  return <div className="content-report"><button type="button" className="report-link" onClick={() => { setOpen((value) => !value); setNotice(''); }}>{open ? 'Đóng góp ý' : 'Báo thông tin cần sửa'}</button>{notice && <small role="status">{notice}</small>}{open && <form onSubmit={submit}><label>Mô tả điều cần kiểm tra<textarea minLength="10" maxLength="2000" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ví dụ: số điện thoại cửa hàng đã thay đổi…" required /></label><button className="admin-primary" disabled={busy}>{busy ? 'Đang gửi…' : 'Gửi cho admin'}</button></form>}</div>;
}
