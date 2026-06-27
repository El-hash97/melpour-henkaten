/* ============================================================
   AUTH MODULE
   Handles login / logout for Leader access
   Credentials: admin / leader123
   ============================================================ */

const Auth = (() => {
  const STORAGE_KEY = 'henkaten_auth';
  const CREDENTIALS = {
    admin: 'leader123',
    leader: 'leader123',
  };

  /* ---- State ---- */
  let _state = {
    isLoggedIn: false,
    username: '',
  };

  /* ---- Load from storage ---- */
  function init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        _state = JSON.parse(stored);
      } catch (_) {
        _state = { isLoggedIn: false, username: '' };
      }
    }
    _syncUI();
    return _state.isLoggedIn;
  }

  /* ---- Save state ---- */
  function _save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  }

  /* ---- Sync navbar UI ---- */
  function _syncUI() {
    const loggedIn = _state.isLoggedIn;
    const els = {
      btnLogin: document.getElementById('btn-nav-login'),
      btnDashboard: document.getElementById('btn-nav-dashboard'),
      btnLogout: document.getElementById('btn-nav-logout'),
      mobileLogin: document.getElementById('btn-mobile-login'),
      mobileDashboard: document.getElementById('btn-mobile-dashboard'),
      mobileLogout: document.getElementById('btn-mobile-logout'),
    };

    if (loggedIn) {
      els.btnLogin?.classList.add('hidden');
      els.btnDashboard?.classList.remove('hidden');
      els.btnLogout?.classList.remove('hidden');
      els.mobileLogin?.classList.add('hidden');
      els.mobileDashboard?.classList.remove('hidden');
      els.mobileLogout?.classList.remove('hidden');
    } else {
      els.btnLogin?.classList.remove('hidden');
      els.btnDashboard?.classList.add('hidden');
      els.btnLogout?.classList.add('hidden');
      els.mobileLogin?.classList.remove('hidden');
      els.mobileDashboard?.classList.add('hidden');
      els.mobileLogout?.classList.add('hidden');
    }
  }

  /* ---- Login ---- */
  function login(username, password) {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (CREDENTIALS[trimmedUser] && CREDENTIALS[trimmedUser] === trimmedPass) {
      _state = { isLoggedIn: true, username: trimmedUser };
      _save();
      _syncUI();
      return { success: true };
    }

    return { success: false, message: 'Username atau password salah. Silakan coba lagi.' };
  }

  /* ---- Logout ---- */
  function logout() {
    _state = { isLoggedIn: false, username: '' };
    _save();
    _syncUI();
    App.showView('login');
    App.toast('Berhasil keluar dari Dashboard.', 'info');
  }

  /* ---- Check auth (guard) ---- */
  function isLoggedIn() {
    return _state.isLoggedIn;
  }

  function getUsername() {
    return _state.username;
  }

  /* ---- Toggle password visibility ---- */
  function togglePassword() {
    const input = document.getElementById('login-password');
    const icon = document.getElementById('eye-icon');
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`;
    } else {
      input.type = 'password';
      icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
    }
  }

  /* ---- Bind login form ---- */
  function bindForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      const errEl = document.getElementById('err-login');
      const btn = document.getElementById('btn-login');

      errEl.textContent = '';

      if (!username || !password) {
        errEl.textContent = 'Username dan password wajib diisi.';
        return;
      }

      // Loading state
      btn.disabled = true;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> Memverifikasi...`;

      setTimeout(() => {
        const result = login(username, password);
        btn.disabled = false;
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Masuk ke Dashboard`;

        if (result.success) {
          App.showView('dashboard');
          Dashboard.init();
          App.toast(`Selamat datang, ${getUsername()}!`, 'success');
        } else {
          errEl.textContent = result.message;
          const passInput = document.getElementById('login-password');
          passInput.value = '';
          passInput.focus();
        }
      }, 600);
    });
  }

  return { init, login, logout, isLoggedIn, getUsername, togglePassword, bindForm };
})();
