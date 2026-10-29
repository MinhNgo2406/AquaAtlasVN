import { useEffect, useState } from 'react';

export default function SiteFooter() {
  const [apiStatus, setApiStatus] = useState('Đang kiểm tra…');

  useEffect(() => {
    fetch('/api/health')
      .then((response) => {
        if (!response.ok) throw new Error('API không phản hồi');
        return response.json();
      })
      .then((data) => setApiStatus(data.status === 'ok' ? 'Đã kết nối' : 'Chưa sẵn sàng'))
      .catch(() => setApiStatus('Chưa kết nối'));
  }, []);

  return (
    <footer className="site-footer">
      <a className="brand footer-brand" href="#home"><span className="brand-mark">≈</span><span>AquaAtlas<span className="brand-dot">.</span></span></a>
      <p>Một góc nhỏ cho những người yêu thế giới dưới nước.</p>
      <nav className="footer-links" aria-label="Liên kết cuối trang">
        <a href="#species">Khám phá cá</a><a href="#care">Chăm sóc</a><a href="#shops">Cửa hàng</a><a href="#health">Sức khỏe cá</a><a href="?auth=1">Đăng nhập</a><a href="?admin=1">Quản trị</a>
      </nav>
      <span className="copyright">© 2026 AquaAtlas Vietnam · Làm bằng tình yêu với cá.</span>
      <small className="api-status" aria-live="polite">Backend: {apiStatus}</small>
    </footer>
  );
}
