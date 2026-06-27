/* ============================================================
   APP MODULE
   Main application controller: routing, toast, mobile menu
   ============================================================ */

const App = (() => {
  const VIEWS = ['form', 'login', 'dashboard'];
  let _currentView = 'form';

  /* ---- Toast ---- */
  function toast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      error:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C62828" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      info:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0277BD" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
      warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E65100" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    };

    const titles = { success: 'Berhasil', error: 'Terjadi Kesalahan', info: 'Informasi', warning: 'Perhatian' };

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${titles[type] || 'Notifikasi'}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    container.appendChild(el);

    // Auto-remove
    const timer = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      setTimeout(() => el.remove(), 350);
    }, duration);

    el.addEventListener('click', () => {
      clearTimeout(timer);
      el.remove();
    });
  }

  /* ---- View Routing ---- */
  function showView(viewName) {
    // Guard: dashboard requires login
    if (viewName === 'dashboard' && !Auth.isLoggedIn()) {
      showView('login');
      toast('Silakan login terlebih dahulu untuk mengakses Dashboard.', 'warning');
      return;
    }

    VIEWS.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        if (v === viewName) {
          el.classList.remove('hidden');
          el.classList.add('active');
        } else {
          el.classList.add('hidden');
          el.classList.remove('active');
        }
      }
    });

    // Highlight active nav button
    document.querySelectorAll('.navbar-actions .btn, .navbar-mobile .btn').forEach(b => b.classList.remove('btn-active'));

    _currentView = viewName;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update page title
    const titles = {
      form: 'Form Laporan | Sistem Pelaporan Henkaten',
      login: 'Login Leader | Sistem Pelaporan Henkaten',
      dashboard: 'Dashboard Leader | Sistem Pelaporan Henkaten',
    };
    document.title = titles[viewName] || document.title;
  }

  /* ---- Mobile Menu ---- */
  function toggleMobileMenu() {
    const menu = document.getElementById('navbar-mobile');
    menu?.classList.toggle('hidden');
  }

  function closeMobileMenu() {
    const menu = document.getElementById('navbar-mobile');
    menu?.classList.add('hidden');
  }

  /* ---- Keyboard shortcuts ---- */
  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close modal
        const modal = document.getElementById('photo-modal');
        if (!modal.classList.contains('hidden')) {
          Dashboard.closePhotoModal();
          return;
        }
        // Close success overlay
        const overlay = document.getElementById('success-overlay');
        if (!overlay.classList.contains('hidden')) {
          FormHandler.afterSuccess();
        }
      }
    });
  }

  /* ---- Seed demo data (for first-time experience) ---- */
  function seedDemoDataIfEmpty() {
    const existing = JSON.parse(localStorage.getItem('henkaten_reports') || '[]');
    if (existing.length > 0) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const demoReports = [
      {
        id: 'RPT-DEMO-001',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        name: 'Budi Santoso',
        noReg: 'EMP-1042',
        shift: 'Red',
        date: yesterday,
        time: '08:30',
        location: 'Melting Furnace #2',
        factor: 'Machine',
        henkaten: 'Terjadi getaran abnormal pada motor pengaduk furnace #2 saat proses melting berlangsung. Suara tidak biasa terdengar sejak pukul 08.15.',
        dampak: 'Potensi downtime produksi jika dibiarkan. Kualitas molten metal bisa terdampak akibat pengadukan tidak merata.',
        fotoBefore: '',
        fotoAfter: '',
        countermeasure: 'Motor dimatikan sementara, inspeksi bearing dilakukan oleh tim maintenance. Bearing aus ditemukan dan sudah diganti.',
        pic: 'Maintenance',
        status: 'Fix Action',
        finishDate: today,
        finishTime: '11:00',
      },
      {
        id: 'RPT-DEMO-002',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        name: 'Sari Dewi',
        noReg: 'EMP-2087',
        shift: 'White',
        date: yesterday,
        time: '14:20',
        location: 'Pouring Station Area B',
        factor: 'Man',
        henkaten: 'Operator tidak menggunakan APD lengkap (face shield) saat proses pouring berlangsung. Ditemukan saat audit lapangan shift siang.',
        dampak: 'Risiko kecelakaan kerja akibat percikan logam cair. Potensi cedera mata/wajah operator.',
        fotoBefore: '',
        fotoAfter: '',
        countermeasure: 'Operator diberikan teguran dan re-briefing prosedur keselamatan. APD tambahan disediakan di station. Monitoring ketat selama 1 minggu.',
        pic: 'Production',
        status: 'Temporary Action',
        finishDate: today,
        finishTime: '16:00',
      },
      {
        id: 'RPT-DEMO-003',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        name: 'Ahmad Fauzi',
        noReg: 'EMP-0315',
        shift: 'Red',
        date: today,
        time: '07:45',
        location: 'Analysis Lab',
        factor: 'Material',
        henkaten: 'Komposisi kimia sampel Heat #231 menunjukkan kadar Si melebihi batas atas spec (2.85% vs max 2.80%). Potensi reject material.',
        dampak: 'Risiko cacat produk berupa kekerasan tidak sesuai spec. Perlu hold dan re-analisis sebelum material diproses lebih lanjut.',
        fotoBefore: '',
        fotoAfter: '',
        countermeasure: 'Material di-hold sementara. Koordinasi dengan Engineering untuk keputusan disposition. Investigasi raw material batch masuk.',
        pic: 'Engineering',
        status: 'Temporary Action',
        finishDate: today,
        finishTime: '12:00',
      },
      {
        id: 'RPT-DEMO-004',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        name: 'Rini Handayani',
        noReg: 'EMP-1756',
        shift: 'White',
        date: today,
        time: '10:15',
        location: 'Melting Area – Panel Kontrol',
        factor: 'Methode',
        henkaten: 'SOP pemanasan furnace belum diperbarui pasca upgrade sistem kontrol suhu bulan lalu. Operator masih menggunakan SOP lama versi rev.3.',
        dampak: 'Prosedur yang tidak sinkron dapat menyebabkan overheat atau underheat yang mempengaruhi kualitas molten metal.',
        fotoBefore: '',
        fotoAfter: '',
        countermeasure: 'Diajukan ke tim Kaizen untuk update SOP dan distribusi versi terbaru ke semua operator. Sementara pakai parameter manual dari Engineering.',
        pic: 'Kaizen',
        status: 'Temporary Action',
        finishDate: today,
        finishTime: '15:30',
      },
    ];

    localStorage.setItem('henkaten_reports', JSON.stringify(demoReports));
  }

  /* ---- Init ---- */
  function init() {
    // Initialize auth first
    const wasLoggedIn = Auth.init();
    Auth.bindForm();

    // Initialize form
    FormHandler.init();

    // Bind keyboard
    bindKeyboard();

    // Seed demo data
    seedDemoDataIfEmpty();

    // Determine initial view
    const hash = window.location.hash.replace('#', '');
    if (hash === 'dashboard' && wasLoggedIn) {
      showView('dashboard');
      Dashboard.init();
    } else if (hash === 'login') {
      showView('login');
    } else {
      showView('form');
    }

    // Add spin animation for loading states
    const style = document.createElement('style');
    style.textContent = `@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`;
    document.head.appendChild(style);
  }

  return { init, showView, toast, toggleMobileMenu, closeMobileMenu };
})();

/* ---- Bootstrap ---- */
document.addEventListener('DOMContentLoaded', () => App.init());
