import { useState } from 'react';

const ACCOUNTS_KEY = 'aqua-atlas-demo-accounts';

async function hashPassword(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function readAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));
    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
}

async function migrateLegacyAccount(email, password) {
  const account = readAccounts().find((item) => item.email === email);
  if (!account || await hashPassword(password, account.salt) !== account.passwordHash) return null;

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ name: account.name, email: account.email, password }),
  });
  const data = await response.json();
  return response.ok ? data.user : null;
}

export default function AuthPage({ onSuccess, onExit }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      if (mode === 'register') {
        if (form.password.length < 8) {
          setMessage('Mật khẩu cần có ít nhất 8 ký tự.');
          return;
        }
        if (form.password !== form.confirmPassword) {
          setMessage('Hai mật khẩu chưa khớp.');
          return;
        }
        const email = form.email.trim().toLocaleLowerCase('vi');
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ name: form.name.trim(), email, password: form.password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Không tạo được tài khoản.');
        onSuccess(data.user);
        return;
      }

      const username = form.email.trim().toLocaleLowerCase('vi');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: username, password: form.password }),
      });
      const data = await response.json();
      if (response.ok) {
        onSuccess(data.user);
        return;
      }

      const migratedUser = await migrateLegacyAccount(username, form.password);
      if (migratedUser) {
        onSuccess(migratedUser);
        return;
      }
      setMessage(data.error || 'Email hoặc mật khẩu chưa đúng.');
    } catch (error) {
      setMessage(error instanceof TypeError
        ? 'Chưa kết nối được máy chủ. Hãy kiểm tra Docker và thử lại.'
        : error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-page admin-login-page">
      <section className="admin-login auth-card">
        <a className="admin-back-link" href="/" onClick={(event) => { event.preventDefault(); onExit(); }}>← Về website</a>
        <div className="eyebrow"><span /> AQUAATLAS VIETNAM</div>
        <h1>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản khách'}</h1>
        <p>Dùng chung màn hình đăng nhập cho khách và nhân viên quản trị.</p>
        <div className="auth-tabs" role="tablist" aria-label="Chọn đăng nhập hoặc tạo tài khoản">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setMessage(''); }}>Đăng nhập</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'selected' : ''} onClick={() => { setMode('register'); setMessage(''); }}>Tạo tài khoản khách</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && <label>Họ tên<input autoComplete="name" value={form.name} onChange={(event) => update('name', event.target.value)} required /></label>}
          <label>{mode === 'login' ? 'Email hoặc tên đăng nhập admin' : 'Email'}<input type={mode === 'login' ? 'text' : 'email'} autoComplete="username" value={form.email} onChange={(event) => update('email', event.target.value)} required /></label>
          <label>Mật khẩu<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={(event) => update('password', event.target.value)} required /></label>
          {mode === 'register' && <label>Nhập lại mật khẩu<input type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} required /></label>}
          {message && <p className="admin-error" role="alert">{message}</p>}
          <button className="admin-primary" type="submit" disabled={busy}>{busy ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản và vào trang chủ'}</button>
        </form>
        <div className="auth-demo-note">
          Tài khoản admin được cấu hình bằng <code>ADMIN_USERNAME</code> và <code>ADMIN_PASSWORD</code> trong Docker Compose.
        </div>
        <small className="admin-security-note">Tài khoản được lưu trong PostgreSQL; phiên đăng nhập dùng cookie HttpOnly. Mật khẩu admin mặc định chỉ dành cho chạy thử local. Hãy đặt ADMIN_PASSWORD riêng trước khi đưa website lên mạng.</small>
      </section>
    </main>
  );
}
