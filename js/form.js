/* ============================================================
   FORM MODULE
   Handles public report submission form (Pelapor)
   ============================================================ */

const FormHandler = (() => {
  const STORAGE_KEY = 'henkaten_reports';

  /* ---- Helpers ---- */
  function generateId() {
    return 'RPT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  function getReports() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (_) {
      return [];
    }
  }

  function saveReports(reports) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }

  /* ---- Image Compression (canvas) ---- */
  function compressImage(file, maxW, maxH, quality) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          if (width > maxW || height > maxH) {
            const ratio = Math.min(maxW / width, maxH / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality || 0.75));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---- Setup file upload previews ---- */
  function setupUploads() {
    setupSingleUpload('field-foto-before', 'preview-before', 'placeholder-before', 'upload-before');
    setupSingleUpload('field-foto-after', 'preview-after', 'placeholder-after', 'upload-after');
  }

  function setupSingleUpload(inputId, previewId, placeholderId, zoneId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const placeholder = document.getElementById(placeholderId);
    const zone = document.getElementById(zoneId);
    if (!input) return;

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Size guard: 5MB
      if (file.size > 5 * 1024 * 1024) {
        App.toast('Ukuran file terlalu besar (maks. 5MB).', 'error');
        input.value = '';
        return;
      }

      const compressed = await compressImage(file, 1200, 1200, 0.78);
      preview.src = compressed;
      preview.classList.remove('hidden');
      placeholder.classList.add('hidden');
      zone.style.border = '2px solid var(--red-400)';
    });

    // Drag & Drop
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.style.borderColor = 'var(--red-500)'; });
    zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.style.borderColor = '';
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.match('image.*')) return;
      // Trigger via data transfer
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change'));
    });
  }

  /* ---- Validation ---- */
  const REQUIRED_FIELDS = [
    'name', 'no-reg', 'shift', 'location',
    'date', 'time',
    'factor', 'henkaten', 'dampak',
    'foto-before',
    'countermeasure', 'pic',
    'finish-date', 'finish-time',
  ];

  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  }

  function setError(fieldSuffix, message) {
    const errEl = document.getElementById('err-' + fieldSuffix);
    const inputEl = document.getElementById('field-' + fieldSuffix);
    if (errEl) errEl.textContent = message;
    if (inputEl) inputEl.classList.add('is-invalid');
  }

  function validateForm(data) {
    let valid = true;

    if (!data.name.trim()) { setError('name', 'Nama lengkap wajib diisi.'); valid = false; }
    if (!data.noReg.trim()) { setError('no-reg', 'No. Registrasi wajib diisi.'); valid = false; }
    if (!data.shift) { setError('shift', 'Shift wajib dipilih.'); valid = false; }
    if (!data.location.trim()) { setError('location', 'Lokasi wajib diisi.'); valid = false; }
    if (!data.date) { setError('date', 'Tanggal wajib diisi.'); valid = false; }
    if (!data.time) { setError('time', 'Waktu wajib diisi.'); valid = false; }
    if (!data.factor) { setError('factor', 'Faktor 4M wajib dipilih.'); valid = false; }
    if (!data.henkaten.trim()) { setError('henkaten', 'Deskripsi henkaten/problem wajib diisi.'); valid = false; }
    if (!data.dampak.trim()) { setError('dampak', 'Tujuan/dampak wajib diisi.'); valid = false; }
    if (!data.fotoBefore) { setError('foto-before', 'Foto Before wajib diunggah.'); valid = false; }
    if (!data.countermeasure.trim()) { setError('countermeasure', 'Countermeasure/saran wajib diisi.'); valid = false; }
    if (!data.pic) { setError('pic', 'PIC wajib dipilih.'); valid = false; }
    if (!data.status) { setError('status', 'Status tindakan wajib dipilih.'); valid = false; }
    if (!data.finishDate) { setError('finish-date', 'Tanggal penyelesaian wajib diisi.'); valid = false; }
    if (!data.finishTime) { setError('finish-time', 'Waktu penyelesaian wajib diisi.'); valid = false; }

    return valid;
  }

  /* ---- Collect form data ---- */
  async function collectData() {
    const g = (id) => (document.getElementById(id)?.value || '');

    const fotoBefore = document.getElementById('preview-before')?.src || '';
    const fotoAfter = document.getElementById('preview-after')?.src || '';

    return {
      id: generateId(),
      createdAt: new Date().toISOString(),
      name: g('field-name'),
      noReg: g('field-no-reg'),
      shift: g('field-shift'),
      date: g('field-date'),
      time: g('field-time'),
      location: g('field-location'),
      factor: g('field-factor'),
      henkaten: g('field-henkaten'),
      dampak: g('field-dampak'),
      fotoBefore: fotoBefore.startsWith('data:') ? fotoBefore : '',
      fotoAfter: fotoAfter.startsWith('data:') ? fotoAfter : '',
      countermeasure: g('field-countermeasure'),
      pic: g('field-pic'),
      status: document.querySelector('input[name="status"]:checked')?.value || '',
      finishDate: g('field-finish-date'),
      finishTime: g('field-finish-time'),
    };
  }

  /* ---- Submit handler ---- */
  function bindForm() {
    const form = document.getElementById('report-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const data = await collectData();
      const isValid = validateForm(data);

      if (!isValid) {
        // Scroll to first error
        const firstErr = document.querySelector('.is-invalid');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        App.toast('Harap lengkapi semua kolom yang wajib diisi.', 'error');
        return;
      }

      const btn = document.getElementById('btn-submit');
      btn.disabled = true;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> Menyimpan...`;

      setTimeout(() => {
        try {
          const reports = getReports();
          reports.unshift(data); // newest first
          saveReports(reports);

          btn.disabled = false;
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg> Kirim Laporan`;

          // Show success overlay
          document.getElementById('success-overlay').classList.remove('hidden');
        } catch (err) {
          console.error(err);
          btn.disabled = false;
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg> Kirim Laporan`;
          App.toast('Gagal menyimpan laporan. Coba lagi.', 'error');
        }
      }, 800);
    });
  }

  /* ---- Reset Form ---- */
  function resetForm() {
    const form = document.getElementById('report-form');
    if (form) form.reset();
    clearErrors();

    // Reset photo previews
    ['before', 'after'].forEach((side) => {
      const preview = document.getElementById(`preview-${side}`);
      const placeholder = document.getElementById(`placeholder-${side}`);
      const zone = document.getElementById(`upload-${side}`);
      if (preview) { preview.src = ''; preview.classList.add('hidden'); }
      if (placeholder) placeholder.classList.remove('hidden');
      if (zone) zone.style.border = '';
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---- After success ---- */
  function afterSuccess() {
    document.getElementById('success-overlay').classList.add('hidden');
    resetForm();
  }

  /* ---- Init ---- */
  function init() {
    bindForm();
    setupUploads();
    // Set default date/time to today
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().slice(0, 5);
    const dateEl = document.getElementById('field-date');
    const timeEl = document.getElementById('field-time');
    if (dateEl && !dateEl.value) dateEl.value = dateStr;
    if (timeEl && !timeEl.value) timeEl.value = timeStr;
  }

  return { init, resetForm, afterSuccess, getReports };
})();
