export default function SuccessOverlay({ onClose }) {
  return (
    <div className="success-overlay">
      <div className="success-card">
        <div className="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2 className="success-title">Laporan Berhasil Dikirim!</h2>
        <p className="success-desc">
          Terima kasih. Data laporan Anda telah tersimpan dan akan segera ditindaklanjuti oleh PIC terkait.
        </p>
        <button className="btn btn-red btn-lg" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
          Buat Laporan Baru
        </button>
      </div>
    </div>
  )
}
