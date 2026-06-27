import { useEffect } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function StatusBadge({ status }) {
  if (status === 'Fix Action') return <span className="badge badge-green">Fix Action</span>
  if (status === 'Temporary Action') return <span className="badge badge-orange">Temporary</span>
  return <span className="badge badge-gray">{status || '-'}</span>
}

export default function PhotoModal({ report: r, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">Detail Laporan — {r.name} ({formatDate(r.date)})</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="photo-comparison">
            <div className="photo-panel">
              <div className="photo-panel-label before-label">BEFORE</div>
              {r.fotoBefore?.startsWith('data:')
                ? <img src={r.fotoBefore} alt="Foto Before" className="photo-full" />
                : <div className="photo-no-image">Foto tidak tersedia</div>}
            </div>
            <div className="photo-panel">
              <div className="photo-panel-label after-label">AFTER</div>
              {r.fotoAfter?.startsWith('data:')
                ? <img src={r.fotoAfter} alt="Foto After" className="photo-full" />
                : <div className="photo-no-image">Foto tidak tersedia</div>}
            </div>
          </div>

          <div className="modal-detail">
            <div className="modal-detail-grid">
              <div className="modal-detail-item"><label>ID Laporan</label><span>{r.id}</span></div>
              <div className="modal-detail-item"><label>Tanggal / Waktu</label><span>{formatDate(r.date)} — {r.time || '-'}</span></div>
              <div className="modal-detail-item"><label>Nama Pelapor</label><span>{r.name}</span></div>
              <div className="modal-detail-item"><label>No. Registrasi</label><span>{r.noReg}</span></div>
              <div className="modal-detail-item"><label>Shift</label><span>{r.shift}</span></div>
              <div className="modal-detail-item"><label>Lokasi</label><span>{r.location}</span></div>
              <div className="modal-detail-item"><label>Faktor (4M)</label><span>{r.factor}</span></div>
              <div className="modal-detail-item"><label>PIC</label><span>{r.pic}</span></div>
              <div className="modal-detail-item full"><label>Henkaten / Problem / Temuan</label><span>{r.henkaten}</span></div>
              <div className="modal-detail-item full"><label>Tujuan / Dampak</label><span>{r.dampak}</span></div>
              <div className="modal-detail-item full"><label>Countermeasure / Saran</label><span>{r.countermeasure}</span></div>
              <div className="modal-detail-item"><label>Status Tindakan</label><span><StatusBadge status={r.status} /></span></div>
              <div className="modal-detail-item"><label>Tanggal / Waktu Selesai</label><span>{formatDate(r.finishDate)} — {r.finishTime || '-'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
