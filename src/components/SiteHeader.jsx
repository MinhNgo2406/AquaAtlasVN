import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/icons-material/Menu';
import Close from '@mui/icons-material/Close';

const links = [
  ['Trang chủ', '#home'],
  ['Khám phá cá', '#species'],
  ['Chăm sóc', '#care'],
  ['Sức khỏe', '#health'],
  ['Tìm cửa hàng', '#shops'],
];

export default function SiteHeader({ compact = false, onHome }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <AppBar className="site-header" position="relative" elevation={0} component="header">
      <div className="header-inner">
        <a
          className="brand"
          href={compact ? '/' : '#home'}
          aria-label="AquaAtlas Vietnam, về đầu trang"
          onClick={compact ? (event) => { event.preventDefault(); onHome(); } : undefined}
        >
          <span className="brand-mark">≈</span>
          <span>AquaAtlas<span className="brand-dot">.</span></span>
        </a>

        {!compact && (
          <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Điều hướng chính">
            {links.map(([label, href], index) => (
              <a className={index === 0 ? 'active' : ''} href={href} key={href} onClick={closeMenu}>
                {label}
              </a>
            ))}
          </nav>
        )}

        {compact ? (
          <Button className="detail-back" onClick={onHome}>← Về danh mục cá</Button>
        ) : (
          <>
            <Button className="nav-cta" component="a" href="#species" endIcon={<span>↗</span>}>
              Bắt đầu khám phá
            </Button>
            <IconButton
              className="menu-toggle"
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <Close /> : <Menu />}
            </IconButton>
          </>
        )}
      </div>
    </AppBar>
  );
}
