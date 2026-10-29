export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="brand footer-brand" href="#home"><span className="brand-mark">≈</span><span>AquaAtlas<span className="brand-dot">.</span></span></a>
      <p>Một góc nhỏ cho những người yêu thế giới dưới nước.</p>
      <nav className="footer-links" aria-label="Liên kết cuối trang">
        <a href="#species">Khám phá cá</a><a href="#care">Chăm sóc</a><a href="#shops">Cửa hàng</a><a href="#health">Sức khỏe cá</a>
      </nav>
      <span className="copyright">© 2026 AquaAtlas Vietnam · Làm bằng tình yêu với cá.</span>
    </footer>
  );
}
