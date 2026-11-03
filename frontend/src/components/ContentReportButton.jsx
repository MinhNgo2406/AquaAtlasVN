import { useState } from 'react';
import { apiRequest } from '../api.js';

export default function ContentReportButton({ user, targetType, targetId, targetLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitReport(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice('');

    try {
      await apiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ targetType, targetId, targetLabel, message }),
      }, 'Chưa gửi được góp ý.');

      setNotice('Đã gửi góp ý cho quản trị viên.');
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (user?.role !== 'customer') return null;

  return (
    <div className="content-report">
      <button
        type="button"
        className="report-link"
        onClick={() => {
          setIsOpen((current) => !current);
          setNotice('');
        }}
      >
        {isOpen ? 'Đóng góp ý' : 'Báo thông tin cần sửa'}
      </button>

      {notice && <small role="status">{notice}</small>}

      {isOpen && (
        <form onSubmit={submitReport}>
          <label>
            Mô tả điều cần kiểm tra
            <textarea
              minLength="10"
              maxLength="2000"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ví dụ: số điện thoại cửa hàng đã thay đổi…"
              required
            />
          </label>
          <button className="admin-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi…' : 'Gửi cho admin'}
          </button>
        </form>
      )}
    </div>
  );
}
