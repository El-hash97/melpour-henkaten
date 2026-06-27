/* ============================================================
   DASHBOARD MODULE
   Handles Leader dashboard: charts, filters, table, modal
   ============================================================ */

const Dashboard = (() => {
  const STORAGE_KEY = 'henkaten_reports';

  let _charts = {};
  let _filtered = [];

  /* ---- Data ---- */
  function getReports() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (_) {
      return [];
    }
  }

  function deleteReport(id) {
    if (!confirm('Hapus laporan ini? Tindakan tidak dapat dibatalkan.')) return;
    const reports = getReports().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    refresh();
    App.toast('Laporan berhasil dihapus.', 'info');
  }

  /* ---- Init ---- */
  function init() {
    initCharts();
    refresh();
  }

  function refresh() {
    applyFilters();
    updateSummaryCards(getReports());
  }

  /* ---- Summary Cards ---- */
  function updateSummaryCards(all) {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('stat-total').textContent = all.length;
    document.getElementById('stat-temporary').textContent = all.filter(r => r.status === 'Temporary Action').length;
    document.getElementById('stat-fix').textContent = all.filter(r => r.status === 'Fix Action').length;
    document.getElementById('stat-today').textContent = all.filter(r => r.date === today).length;
  }

  /* ---- Charts ---- */
  const CHART_COLORS = {
    red:    '#C62828',
    redLight: '#EF9A9A',
    gray:   '#546E7A',
    grayLight: '#B0BEC5',
    green:  '#2E7D32',
    greenLight: '#A5D6A7',
    blue:   '#0277BD',
    blueLight: '#81D4FA',
    orange: '#E65100',
    orangeLight: '#FFCC80',
    purple: '#6A1B9A',
    teal:   '#00695C',
  };

  function initCharts() {
    // Destroy old charts
    Object.values(_charts).forEach(c => c?.destroy());
    _charts = {};

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: 'Inter', size: 11, weight: '600' },
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 8,
          },
        },
      },
    };

    // Chart 4M: Donut
    const ctx4m = document.getElementById('chart-4m');
    if (ctx4m) {
      _charts['4m'] = new Chart(ctx4m, {
        type: 'doughnut',
        data: {
          labels: ['Man', 'Methode', 'Machine', 'Material'],
          datasets: [{
            data: [0, 0, 0, 0],
            backgroundColor: [CHART_COLORS.red, CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.teal],
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverOffset: 6,
          }],
        },
        options: {
          ...defaultOptions,
          cutout: '62%',
          plugins: {
            ...defaultOptions.plugins,
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${ctx.raw} laporan`,
              },
            },
          },
        },
      });
    }

    // Chart Status: Bar
    const ctxStatus = document.getElementById('chart-status');
    if (ctxStatus) {
      _charts['status'] = new Chart(ctxStatus, {
        type: 'bar',
        data: {
          labels: ['Temporary Action', 'Fix Action'],
          datasets: [{
            label: 'Jumlah Laporan',
            data: [0, 0],
            backgroundColor: [CHART_COLORS.orange, CHART_COLORS.green],
            borderRadius: 8,
            borderSkipped: false,
          }],
        },
        options: {
          ...defaultOptions,
          plugins: {
            ...defaultOptions.plugins,
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1, font: { family: 'Inter', size: 11 } },
              grid: { color: 'rgba(0,0,0,0.05)' },
            },
            x: {
              ticks: { font: { family: 'Inter', size: 11, weight: '600' } },
              grid: { display: false },
            },
          },
        },
      });
    }

    // Chart PIC: Horizontal Bar
    const ctxPic = document.getElementById('chart-pic');
    if (ctxPic) {
      _charts['pic'] = new Chart(ctxPic, {
        type: 'bar',
        data: {
          labels: ['Maintenance', 'Engineering', 'Kaizen', 'Production'],
          datasets: [{
            label: 'Jumlah Laporan',
            data: [0, 0, 0, 0],
            backgroundColor: [CHART_COLORS.red, CHART_COLORS.blue, CHART_COLORS.purple, CHART_COLORS.teal],
            borderRadius: 6,
            borderSkipped: false,
          }],
        },
        options: {
          ...defaultOptions,
          indexAxis: 'y',
          plugins: {
            ...defaultOptions.plugins,
            legend: { display: false },
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: { stepSize: 1, font: { family: 'Inter', size: 11 } },
              grid: { color: 'rgba(0,0,0,0.05)' },
            },
            y: {
              ticks: { font: { family: 'Inter', size: 11, weight: '600' } },
              grid: { display: false },
            },
          },
        },
      });
    }

    updateCharts(getReports());
  }

  function updateCharts(data) {
    if (!data.length) {
      // Reset to zeros
      if (_charts['4m']) _charts['4m'].data.datasets[0].data = [0, 0, 0, 0];
      if (_charts['status']) _charts['status'].data.datasets[0].data = [0, 0];
      if (_charts['pic']) _charts['pic'].data.datasets[0].data = [0, 0, 0, 0];
      Object.values(_charts).forEach(c => c?.update());
      return;
    }

    // 4M
    if (_charts['4m']) {
      _charts['4m'].data.datasets[0].data = [
        data.filter(r => r.factor === 'Man').length,
        data.filter(r => r.factor === 'Methode').length,
        data.filter(r => r.factor === 'Machine').length,
        data.filter(r => r.factor === 'Material').length,
      ];
      _charts['4m'].update();
    }

    // Status
    if (_charts['status']) {
      _charts['status'].data.datasets[0].data = [
        data.filter(r => r.status === 'Temporary Action').length,
        data.filter(r => r.status === 'Fix Action').length,
      ];
      _charts['status'].update();
    }

    // PIC
    if (_charts['pic']) {
      _charts['pic'].data.datasets[0].data = [
        data.filter(r => r.pic === 'Maintenance').length,
        data.filter(r => r.pic === 'Engineering').length,
        data.filter(r => r.pic === 'Kaizen').length,
        data.filter(r => r.pic === 'Production').length,
      ];
      _charts['pic'].update();
    }
  }

  /* ---- Filters ---- */
  function applyFilters() {
    const all = getReports();
    const search = document.getElementById('filter-search')?.value.toLowerCase() || '';
    const dateFrom = document.getElementById('filter-date-from')?.value || '';
    const dateTo = document.getElementById('filter-date-to')?.value || '';
    const shift = document.getElementById('filter-shift')?.value || '';
    const status = document.getElementById('filter-status')?.value || '';
    const pic = document.getElementById('filter-pic')?.value || '';

    _filtered = all.filter(r => {
      if (search && ![r.name, r.location, r.henkaten, r.noReg, r.factor].some(f => f?.toLowerCase().includes(search))) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      if (shift && r.shift !== shift) return false;
      if (status && r.status !== status) return false;
      if (pic && r.pic !== pic) return false;
      return true;
    });

    renderTable(_filtered);
    updateCharts(_filtered);

    const countEl = document.getElementById('table-count');
    if (countEl) countEl.textContent = `${_filtered.length} Laporan`;
  }

  function resetFilters() {
    ['filter-search', 'filter-date-from', 'filter-date-to'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    ['filter-shift', 'filter-status', 'filter-pic'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    applyFilters();
  }

  /* ---- Table ---- */
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  function getStatusBadge(status) {
    if (status === 'Fix Action') return `<span class="badge badge-green">Fix Action</span>`;
    if (status === 'Temporary Action') return `<span class="badge badge-orange">Temporary</span>`;
    return `<span class="badge badge-gray">${status || '-'}</span>`;
  }

  function getFactorBadge(factor) {
    const map = { Man: 'badge-red', Methode: 'badge-blue', Machine: 'badge-orange', Material: 'badge-blue' };
    return `<span class="badge ${map[factor] || 'badge-gray'}">${factor || '-'}</span>`;
  }

  function getPicBadge(pic) {
    return `<span class="badge badge-gray">${pic || '-'}</span>`;
  }

  function getThumb(base64, label, reportId) {
    if (base64 && base64.startsWith('data:')) {
      return `<img class="thumb" src="${base64}" alt="${label}" title="${label}" onclick="Dashboard.openPhotoModal('${reportId}')" />`;
    }
    return `<div class="thumb-none" title="${label} tidak tersedia"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8"/><path d="M10 10a3 3 0 0 0 4 4"/></svg></div>`;
  }

  function renderTable(data) {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;

    if (!data.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" class="table-empty">
            <div class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>Tidak ada data yang cocok dengan filter ini.</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = data.map((r, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td style="white-space:nowrap">
          <div style="font-weight:600;font-size:13px">${formatDate(r.date)}</div>
          <div style="font-size:11px;color:var(--gray-600)">${r.time || '-'}</div>
        </td>
        <td>
          <div style="font-weight:600;font-size:13px">${escHtml(r.name)}</div>
          <div style="font-size:11px;color:var(--gray-600)">${escHtml(r.noReg)}</div>
        </td>
        <td>${r.shift === 'Red' ? '<span class="badge badge-red">Red</span>' : '<span class="badge badge-gray">White</span>'}</td>
        <td><span class="truncate" style="max-width:140px" title="${escHtml(r.location)}">${escHtml(r.location)}</span></td>
        <td>${getFactorBadge(r.factor)}</td>
        <td><span class="truncate" style="max-width:200px" title="${escHtml(r.henkaten)}">${escHtml(r.henkaten)}</span></td>
        <td>${getPicBadge(r.pic)}</td>
        <td>${getStatusBadge(r.status)}</td>
        <td>
          <div class="thumb-wrap">
            ${getThumb(r.fotoBefore, 'Foto Before', r.id)}
            ${getThumb(r.fotoAfter, 'Foto After', r.id)}
          </div>
        </td>
        <td>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm" title="Lihat Detail" onclick="Dashboard.openPhotoModal('${r.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm" title="Hapus" onclick="Dashboard.deleteReport('${r.id}')" style="color:var(--red-600)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  /* ---- Escape HTML ---- */
  function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ---- Photo Modal ---- */
  function openPhotoModal(reportId) {
    const reports = getReports();
    const r = reports.find(x => x.id === reportId);
    if (!r) return;

    // Set title
    document.getElementById('modal-report-title').textContent = `Detail Laporan — ${r.name} (${formatDate(r.date)})`;

    // Photos
    const photoBefore = document.getElementById('modal-photo-before');
    const photoAfter = document.getElementById('modal-photo-after');
    const noBefore = document.getElementById('no-before');
    const noAfter = document.getElementById('no-after');

    if (r.fotoBefore && r.fotoBefore.startsWith('data:')) {
      photoBefore.src = r.fotoBefore;
      photoBefore.classList.remove('hidden');
      noBefore.classList.add('hidden');
    } else {
      photoBefore.classList.add('hidden');
      noBefore.classList.remove('hidden');
    }

    if (r.fotoAfter && r.fotoAfter.startsWith('data:')) {
      photoAfter.src = r.fotoAfter;
      photoAfter.classList.remove('hidden');
      noAfter.classList.add('hidden');
    } else {
      photoAfter.classList.add('hidden');
      noAfter.classList.remove('hidden');
    }

    // Detail content
    document.getElementById('modal-detail-content').innerHTML = `
      <div class="modal-detail-grid">
        <div class="modal-detail-item">
          <label>ID Laporan</label>
          <span>${escHtml(r.id)}</span>
        </div>
        <div class="modal-detail-item">
          <label>Tanggal / Waktu</label>
          <span>${formatDate(r.date)} — ${r.time || '-'}</span>
        </div>
        <div class="modal-detail-item">
          <label>Nama Pelapor</label>
          <span>${escHtml(r.name)}</span>
        </div>
        <div class="modal-detail-item">
          <label>No. Registrasi</label>
          <span>${escHtml(r.noReg)}</span>
        </div>
        <div class="modal-detail-item">
          <label>Shift</label>
          <span>${escHtml(r.shift)}</span>
        </div>
        <div class="modal-detail-item">
          <label>Lokasi</label>
          <span>${escHtml(r.location)}</span>
        </div>
        <div class="modal-detail-item">
          <label>Faktor (4M)</label>
          <span>${escHtml(r.factor)}</span>
        </div>
        <div class="modal-detail-item">
          <label>PIC</label>
          <span>${escHtml(r.pic)}</span>
        </div>
        <div class="modal-detail-item full">
          <label>Henkaten / Problem / Temuan</label>
          <span>${escHtml(r.henkaten)}</span>
        </div>
        <div class="modal-detail-item full">
          <label>Tujuan / Dampak</label>
          <span>${escHtml(r.dampak)}</span>
        </div>
        <div class="modal-detail-item full">
          <label>Countermeasure / Saran</label>
          <span>${escHtml(r.countermeasure)}</span>
        </div>
        <div class="modal-detail-item">
          <label>Status Tindakan</label>
          <span>${getStatusBadge(r.status)}</span>
        </div>
        <div class="modal-detail-item">
          <label>Tanggal / Waktu Selesai</label>
          <span>${formatDate(r.finishDate)} — ${r.finishTime || '-'}</span>
        </div>
      </div>
    `;

    document.getElementById('photo-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closePhotoModal(e) {
    if (e && e.target !== document.getElementById('photo-modal')) return;
    document.getElementById('photo-modal').classList.add('hidden');
    document.body.style.overflow = '';
  }

  /* ---- Export CSV ---- */
  function exportCSV() {
    const data = _filtered.length ? _filtered : getReports();
    if (!data.length) { App.toast('Tidak ada data untuk diekspor.', 'info'); return; }

    const headers = ['ID', 'Dibuat', 'Nama', 'No.Reg', 'Shift', 'Tanggal', 'Waktu', 'Lokasi', 'Faktor', 'Henkaten/Problem', 'Dampak', 'Countermeasure', 'PIC', 'Status', 'Tgl Selesai', 'Waktu Selesai'];
    const rows = data.map(r => [
      r.id, r.createdAt, r.name, r.noReg, r.shift, r.date, r.time,
      r.location, r.factor, r.henkaten, r.dampak, r.countermeasure,
      r.pic, r.status, r.finishDate, r.finishTime,
    ].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `henkaten_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    App.toast('Data berhasil diekspor ke CSV.', 'success');
  }

  return { init, refresh, applyFilters, resetFilters, openPhotoModal, closePhotoModal, deleteReport, exportCSV };
})();
