import { useState } from 'react';

const ACCOUNTS_KEY = 'aqua-atlas-demo-accounts';
const DEMO_ADMIN = { username: 'admin', password: 'aqua-demo', name: 'Quản trị viên', role: 'admin' };

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
        const accounts = readAccounts();
        if (accounts.some((account) => account.email === email)) {
          setMessage('Email này đã có tài khoản trên trình duyệt.');
          return;
        }
        const salt = crypto.getRandomValues(new Uint8Array(16)).join('-');
        const account = {
          email,
          name: form.name.trim(),
          salt,
          passwordHash: await hashPassword(form.password, salt),
          role: 'customer',
        };
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
        onSuccess({ name: account.name, email: account.email, role: account.role });
        return;
      }

      const username = form.email.trim().toLocaleLowerCase('vi');
      if (username === DEMO_ADMIN.username && form.password === DEMO_ADMIN.password) {
        onSuccess({ name: DEMO_ADMIN.name, email: DEMO_ADMIN.username, role: DEMO_ADMIN.role });
        return;
      }

      const account = readAccounts().find((item) => item.email === username);
      if (!account || await hashPassword(form.password, account.salt) !== account.passwordHash) {
        setMessage('Email hoặc mật khẩu chưa đúng.');
        return;
      }
      onSuccess({ name: account.name, email: account.email, role: 'customer' });
    } catch {
      setMessage('Trình duyệt không hỗ trợ thao tác tài khoản này. Hãy mở website qua localhost hoặc HTTPS.');
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
          <strong>Admin demo:</strong> tên đăng nhập <code>admin</code>, mật khẩu <code>aqua-demo</code>.
        </div>
        <small className="admin-security-note">Bản demo chỉ lưu tài khoản trong trình duyệt hiện tại, không đồng bộ giữa thiết bị. Không dùng mật khẩu thật; đăng nhập frontend không bảo vệ được website công khai. Muốn vận hành thật cần backend và xác thực máy chủ.</small>
      </section>
    </main>
  );
}
