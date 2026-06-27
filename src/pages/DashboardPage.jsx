import { useState, useMemo } from 'react'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const COLORS = {
  red: '#C62828', blue: '#0277BD', orange: '#E65100',
  teal: '#00695C', green: '#2E7D32', purple: '#6A1B9A',
}

const FONT = { family: 'Inter', size: 11, weight: '600' }

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: FONT, padding: 16, usePointStyle: true, pointStyleWidth: 8 },
    },
  },
}

function formatDate(d) {
  if (!d) return '-'
  const [y, m, dd] = d.split('-')
  return `${dd}/${m}/${y}`
}

function StatusBadge({ status }) {
  if (status === 'Fix Action') return <span className="badge badge-green">Fix Action</span>
  if (status === 'Temporary Action') return <span className="badge badge-orange">Temporary</span>
  return <span className="badge badge-gray">{status || '-'}</span>
}

function FactorBadge({ factor }) {
  const cls = { Man: 'badge-red', Methode: 'badge-blue', Machine: 'badge-orange', Material: 'badge-blue' }
  return <span className={`badge ${cls[factor] || 'badge-gray'}`}>{factor || '-'}</span>
}

function Thumb({ src, label, onClick }) {
  if (src?.startsWith('data:')) {
    return <img className="thumb" src={src} alt={label} title={label} onClick={onClick} style={{ cursor: 'pointer' }} />
  }
  return (
    <div className="thumb-none" title={`${label} tidak tersedia`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8"/><path d="M10 10a3 3 0 0 0 4 4"/>
      </svg>
    </div>
  )
}

const EMPTY_FILTERS = { search: '', dateFrom: '', dateTo: '', shift: '', status: '', pic: '' }

export default function DashboardPage({ reports, onDelete, onOpenModal, onToast }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const setF = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value }))

  const filtered = useMemo(() => reports.filter(r => {
    const { search, dateFrom, dateTo, shift, status, pic } = filters
    if (search) {
      const q = search.toLowerCase()
      if (![r.name, r.location, r.henkaten, r.noReg, r.factor].some(f => f?.toLowerCase().includes(q))) return false
    }
    if (dateFrom && r.date < dateFrom) return false
    if (dateTo && r.date > dateTo) return false
    if (shift && r.shift !== shift) return false
    if (status && r.status !== status) return false
    if (pic && r.pic !== pic) return false
    return true
  }), [reports, filters])

  const today = new Date().toISOString().split('T')[0]
  const statTotal = reports.length
  const statTemp = reports.filter(r => r.status === 'Temporary Action').length
  const statFix = reports.filter(r => r.status === 'Fix Action').length
  const statToday = reports.filter(r => r.date === today).length

  const count = (arr, key, val) => arr.filter(r => r[key] === val).length

  const chart4mData = {
    labels: ['Man', 'Methode', 'Machine', 'Material'],
    datasets: [{ data: ['Man','Methode','Machine','Material'].map(v => count(filtered,'factor',v)), backgroundColor: [COLORS.red, COLORS.blue, COLORS.orange, COLORS.teal], borderWidth: 3, borderColor: '#fff', hoverOffset: 6 }],
  }
  const chartStatusData = {
    labels: ['Temporary Action', 'Fix Action'],
    datasets: [{ label: 'Jumlah Laporan', data: ['Temporary Action','Fix Action'].map(v => count(filtered,'status',v)), backgroundColor: [COLORS.orange, COLORS.green], borderRadius: 8, borderSkipped: false }],
  }
  const chartPicData = {
    labels: ['Maintenance', 'Engineering', 'Kaizen', 'Production'],
    datasets: [{ label: 'Jumlah Laporan', data: ['Maintenance','Engineering','Kaizen','Production'].map(v => count(filtered,'pic',v)), backgroundColor: [COLORS.red, COLORS.blue, COLORS.purple, COLORS.teal], borderRadius: 6, borderSkipped: false }],
  }

  const handleDelete = (id) => {
    if (!window.confirm('Hapus laporan ini? Tindakan tidak dapat dibatalkan.')) return
    onDelete(id)
  }

  const exportCSV = () => {
    const data = filtered.length ? filtered : reports
    if (!data.length) { onToast('Tidak ada data untuk diekspor.', 'info'); return }
    const headers = ['ID','Dibuat','Nama','No.Reg','Shift','Tanggal','Waktu','Lokasi','Faktor','Henkaten/Problem','Dampak','Countermeasure','PIC','Status','Tgl Selesai','Waktu Selesai']
    const rows = data.map(r => [
      r.id,r.createdAt,r.name,r.noReg,r.shift,r.date,r.time,
      r.location,r.factor,r.henkaten,r.dampak,r.countermeasure,
      r.pic,r.status,r.finishDate,r.finishTime,
    ].map(v => `"${(v||'').replace(/"/g,'""')}"`).join(','))
    const blob = new Blob(['﻿' + [headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `henkaten_export_${today}.csv`; a.click()
    URL.revokeObjectURL(url)
    onToast('Data berhasil diekspor ke CSV.', 'success')
  }

  return (
    <main className="view">
      <div className="page-header page-header-dark">
        <div className="container">
          <div className="dashboard-header-row">
            <div className="page-header-content">
              <div className="page-header-badge">Leader Dashboard</div>
              <h1 className="page-header-title">Rekapitulasi Laporan Produksi</h1>
              <p className="page-header-desc">Monitoring seluruh henkaten &amp; problem dari area Melting, Pouring &amp; Analysis.</p>
            </div>
            <div className="dashboard-header-actions">
              <button className="btn btn-outline-white" onClick={exportCSV}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container dashboard-container">

        {/* Summary Cards */}
        <div className="cards-grid">
          <div className="summary-card">
            <div className="summary-card-icon summary-icon-blue"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
            <div className="summary-card-body"><span className="summary-card-label">Total Laporan</span><span className="summary-card-value">{statTotal}</span></div>
          </div>
          <div className="summary-card">
            <div className="summary-card-icon summary-icon-red"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
            <div className="summary-card-body"><span className="summary-card-label">Temporary Action</span><span className="summary-card-value">{statTemp}</span></div>
          </div>
          <div className="summary-card">
            <div className="summary-card-icon summary-icon-green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
            <div className="summary-card-body"><span className="summary-card-label">Fix Action</span><span className="summary-card-value">{statFix}</span></div>
          </div>
          <div className="summary-card">
            <div className="summary-card-icon summary-icon-orange"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            <div className="summary-card-body"><span className="summary-card-label">Laporan Hari Ini</span><span className="summary-card-value">{statToday}</span></div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-card-header"><h3 className="chart-card-title">Komposisi Faktor 4M</h3><p className="chart-card-desc">Distribusi penyebab masalah berdasarkan faktor</p></div>
            <div className="chart-canvas-wrap">
              <Doughnut data={chart4mData} options={{ ...baseOptions, cutout: '62%', plugins: { ...baseOptions.plugins, tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw} laporan` } } } }} />
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-card-header"><h3 className="chart-card-title">Status Penyelesaian</h3><p className="chart-card-desc">Perbandingan Temporary vs Fix Action</p></div>
            <div className="chart-canvas-wrap">
              <Bar data={chartStatusData} options={{ ...baseOptions, plugins: { ...baseOptions.plugins, legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { ticks: { font: FONT }, grid: { display: false } } } }} />
            </div>
          </div>
          <div className="chart-card chart-card-wide">
            <div className="chart-card-header"><h3 className="chart-card-title">Distribusi per PIC</h3><p className="chart-card-desc">Beban penyelesaian per departemen penanggung jawab</p></div>
            <div className="chart-canvas-wrap chart-canvas-bar">
              <Bar data={chartPicData} options={{ ...baseOptions, indexAxis: 'y', plugins: { ...baseOptions.plugins, legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { stepSize: 1, font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } }, y: { ticks: { font: FONT }, grid: { display: false } } } }} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-panel">
          <div className="filter-panel-header">
            <h3 className="filter-panel-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filter &amp; Pencarian Data
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters(EMPTY_FILTERS)}>Reset Filter</button>
          </div>
          <div className="filter-grid">
            <div className="form-group"><label className="form-label">Cari Nama / Lokasi / Deskripsi</label><input className="form-input" type="text" placeholder="Ketik kata kunci..." value={filters.search} onChange={setF('search')} /></div>
            <div className="form-group"><label className="form-label">Tanggal Dari</label><input className="form-input" type="date" value={filters.dateFrom} onChange={setF('dateFrom')} /></div>
            <div className="form-group"><label className="form-label">Tanggal Sampai</label><input className="form-input" type="date" value={filters.dateTo} onChange={setF('dateTo')} /></div>
            <div className="form-group">
              <label className="form-label">Shift</label>
              <select className="form-select" value={filters.shift} onChange={setF('shift')}><option value="">Semua Shift</option><option value="Red">Red</option><option value="White">White</option></select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={filters.status} onChange={setF('status')}><option value="">Semua Status</option><option value="Temporary Action">Temporary Action</option><option value="Fix Action">Fix Action</option></select>
            </div>
            <div className="form-group">
              <label className="form-label">PIC</label>
              <select className="form-select" value={filters.pic} onChange={setF('pic')}><option value="">Semua PIC</option><option value="Maintenance">Maintenance</option><option value="Engineering">Engineering</option><option value="Kaizen">Kaizen</option><option value="Production">Production</option></select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">Data Laporan</h3>
            <span className="table-count-badge">{filtered.length} Laporan</span>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Tanggal</th><th>Nama / No. Reg</th><th>Shift</th><th>Lokasi</th><th>Faktor</th><th>Henkaten / Problem</th><th>PIC</th><th>Status</th><th>Foto</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="11" className="table-empty"><div className="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><p>Tidak ada data yang cocok dengan filter ini.</p></div></td></tr>
                ) : filtered.map((r, idx) => (
                  <tr key={r.id}>
                    <td>{idx + 1}</td>
                    <td style={{ whiteSpace: 'nowrap' }}><div style={{ fontWeight: 600, fontSize: 13 }}>{formatDate(r.date)}</div><div style={{ fontSize: 11, color: 'var(--gray-600)' }}>{r.time || '-'}</div></td>
                    <td><div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div><div style={{ fontSize: 11, color: 'var(--gray-600)' }}>{r.noReg}</div></td>
                    <td>{r.shift === 'Red' ? <span className="badge badge-red">Red</span> : <span className="badge badge-gray">White</span>}</td>
                    <td><span className="truncate" style={{ maxWidth: 140 }} title={r.location}>{r.location}</span></td>
                    <td><FactorBadge factor={r.factor} /></td>
                    <td><span className="truncate" style={{ maxWidth: 200 }} title={r.henkaten}>{r.henkaten}</span></td>
                    <td><span className="badge badge-gray">{r.pic || '-'}</span></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td><div className="thumb-wrap"><Thumb src={r.fotoBefore} label="Foto Before" onClick={() => onOpenModal(r)} /><Thumb src={r.fotoAfter} label="Foto After" onClick={() => onOpenModal(r)} /></div></td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" title="Lihat Detail" onClick={() => onOpenModal(r)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
                        <button className="btn btn-ghost btn-sm" title="Hapus" onClick={() => handleDelete(r.id)} style={{ color: 'var(--red-600)' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
