import IconButton from '@mui/material/IconButton';
import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';

export default function ThemeToggle({ mode = 'light', onToggle }) {
  const dark = mode === 'dark';

  return (
    <IconButton
      className="theme-toggle"
      onClick={onToggle}
      aria-label={dark ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
      title={dark ? 'Nền sáng' : 'Nền tối'}
      size="small"
    >
      {dark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
    </IconButton>
  );
}
