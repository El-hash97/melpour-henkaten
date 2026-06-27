import { useState, useRef } from 'react'
import { generateId } from '../lib/storage'
import { compressImage } from '../lib/imageUtils'

function UploadZone({ label, hint, required, value, onChange, error, onToast }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = async (file) => {
    if (!file || !file.type.match('image.*')) return
    if (file.size > 5 * 1024 * 1024) {
      onToast('Ukuran file terlalu besar (maks. 5MB).', 'error')
      return
    }
    const compressed = await compressImage(file)
    onChange(compressed)
  }

  return (
    <div>
      <div
        className="upload-zone"
        style={value ? { border: '2px solid var(--red-400)' } : dragging ? { borderColor: 'var(--red-500)' } : {}}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      >
        <input
          ref={inputRef}
          className="upload-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={required}
          onChange={(e) => handleFile(e.target.files[0])}
          onClick={(e) => e.stopPropagation()}
        />
        {value ? (
          <img className="upload-preview" src={value} alt={`Preview ${label}`} />
        ) : (
          <div className="upload-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Klik untuk unggah</span>
            <small>{hint}</small>
          </div>
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

const getNow = () => ({
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
})

const EMPTY_FORM = {
  name: '', noReg: '', shift: '', location: '',
  factor: '', henkaten: '', dampak: '',
  countermeasure: '', pic: '', status: '',
  finishDate: '', finishTime: '',
}

export default function FormPage({ onSubmit, onToast }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...getNow() })
  const [photos, setPhotos] = useState({ before: '', after: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())           e.name = 'Nama lengkap wajib diisi.'
    if (!form.noReg.trim())          e.noReg = 'No. Registrasi wajib diisi.'
    if (!form.shift)                 e.shift = 'Shift wajib dipilih.'
    if (!form.location.trim())       e.location = 'Lokasi wajib diisi.'
    if (!form.date)                  e.date = 'Tanggal wajib diisi.'
    if (!form.time)                  e.time = 'Waktu wajib diisi.'
    if (!form.factor)                e.factor = 'Faktor 4M wajib dipilih.'
    if (!form.henkaten.trim())       e.henkaten = 'Deskripsi henkaten/problem wajib diisi.'
    if (!form.dampak.trim())         e.dampak = 'Tujuan/dampak wajib diisi.'
    if (!photos.before)              e.fotoBefore = 'Foto Before wajib diunggah.'
    if (!form.countermeasure.trim()) e.countermeasure = 'Countermeasure/saran wajib diisi.'
    if (!form.pic)                   e.pic = 'PIC wajib dipilih.'
    if (!form.status)                e.status = 'Status tindakan wajib dipilih.'
    if (!form.finishDate)            e.finishDate = 'Tanggal penyelesaian wajib diisi.'
    if (!form.finishTime)            e.finishTime = 'Waktu penyelesaian wajib diisi.'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) {
      onToast('Harap lengkapi semua kolom yang wajib diisi.', 'error')
      return
    }
    setLoading(true)
    setTimeout(() => {
      onSubmit({
        id: generateId(),
        createdAt: new Date().toISOString(),
        ...form,
        fotoBefore: photos.before.startsWith('data:') ? photos.before : '',
        fotoAfter: photos.after.startsWith('data:') ? photos.after : '',
      })
      setLoading(false)
      setForm({ ...EMPTY_FORM, ...getNow() })
      setPhotos({ before: '', after: '' })
      setErrors({})
    }, 800)
  }

  const handleReset = () => {
    setForm({ ...EMPTY_FORM, ...getNow() })
    setPhotos({ before: '', after: '' })
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const inp = (key) => ({
    className: `form-input${errors[key] ? ' is-invalid' : ''}`,
    value: form[key],
    onChange: set(key),
  })
  const sel = (key) => ({
    className: `form-select${errors[key] ? ' is-invalid' : ''}`,
    value: form[key],
    onChange: set(key),
  })

  return (
    <main className="view">
      <div className="page-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-badge">Form Pelaporan</div>
            <h1 className="page-header-title">Laporan Henkaten &amp; Problem Produksi</h1>
            <p className="page-header-desc">
              Isi formulir di bawah ini dengan lengkap dan benar. Semua kolom yang ditandai <span className="req-mark">*</span> bersifat wajib diisi.
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <form className="report-form" noValidate onSubmit={handleSubmit}>

          {/* Section 01 */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">01</div>
              <div><h2 className="form-section-title">Identitas Pelapor</h2><p className="form-section-desc">Data diri operator yang melakukan pelaporan</p></div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Nama Lengkap <span className="req-mark">*</span></label>
                <input {...inp('name')} type="text" placeholder="Masukkan nama lengkap" />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">No. Registrasi / ID Karyawan <span className="req-mark">*</span></label>
                <input {...inp('noReg')} type="text" placeholder="Contoh: EMP-12345" />
                {errors.noReg && <span className="form-error">{errors.noReg}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Shift <span className="req-mark">*</span></label>
                <select {...sel('shift')}>
                  <option value="">-- Pilih Shift --</option>
                  <option value="Red">Red</option>
                  <option value="White">White</option>
                </select>
                {errors.shift && <span className="form-error">{errors.shift}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Lokasi Spesifik <span className="req-mark">*</span></label>
                <input {...inp('location')} type="text" placeholder="Contoh: Melting Furnace #3" />
                {errors.location && <span className="form-error">{errors.location}</span>}
              </div>
            </div>
          </div>

          {/* Section 02 */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">02</div>
              <div><h2 className="form-section-title">Waktu Kejadian</h2><p className="form-section-desc">Tanggal dan jam saat masalah atau henkaten ditemukan</p></div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Tanggal <span className="req-mark">*</span></label>
                <input {...inp('date')} type="date" />
                {errors.date && <span className="form-error">{errors.date}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Waktu (HH:MM) <span className="req-mark">*</span></label>
                <input {...inp('time')} type="time" />
                {errors.time && <span className="form-error">{errors.time}</span>}
              </div>
            </div>
          </div>

          {/* Section 03 */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">03</div>
              <div><h2 className="form-section-title">Detail Temuan / Problem</h2><p className="form-section-desc">Deskripsi lengkap mengenai henkaten atau masalah yang ditemukan</p></div>
            </div>
            <div className="form-grid form-grid-1">
              <div className="form-group">
                <label className="form-label">Faktor (4M) <span className="req-mark">*</span></label>
                <select {...sel('factor')}>
                  <option value="">-- Pilih Faktor Penyebab --</option>
                  <option value="Man">Man (Manusia)</option>
                  <option value="Methode">Methode (Metode/Prosedur)</option>
                  <option value="Machine">Machine (Mesin/Peralatan)</option>
                  <option value="Material">Material (Bahan Baku)</option>
                </select>
                {errors.factor && <span className="form-error">{errors.factor}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Henkaten / Problem / Temuan <span className="req-mark">*</span></label>
                <textarea className={`form-textarea${errors.henkaten ? ' is-invalid' : ''}`} rows="4" placeholder="Deskripsikan secara detail masalah atau perubahan yang ditemukan..." value={form.henkaten} onChange={set('henkaten')} />
                {errors.henkaten && <span className="form-error">{errors.henkaten}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Tujuan / Dampak <span className="req-mark">*</span></label>
                <textarea className={`form-textarea${errors.dampak ? ' is-invalid' : ''}`} rows="3" placeholder="Jelaskan konsekuensi dari masalah ini (contoh: downtime, cacat produk, potensi bahaya)..." value={form.dampak} onChange={set('dampak')} />
                {errors.dampak && <span className="form-error">{errors.dampak}</span>}
              </div>
            </div>
          </div>

          {/* Section 04 */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">04</div>
              <div><h2 className="form-section-title">Dokumentasi Foto</h2><p className="form-section-desc">Unggah foto kondisi sebelum dan sesudah perbaikan</p></div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Foto Before <span className="req-mark">*</span> <span className="form-label-hint">(JPG/PNG, maks. 5MB)</span></label>
                <UploadZone label="Foto Before" hint="Foto kondisi saat masalah terjadi" required value={photos.before} onChange={(v) => setPhotos(p => ({ ...p, before: v }))} error={errors.fotoBefore} onToast={onToast} />
              </div>
              <div className="form-group">
                <label className="form-label">Foto After <span className="form-label-hint">(Opsional — JPG/PNG, maks. 5MB)</span></label>
                <UploadZone label="Foto After" hint="Foto setelah countermeasure (jika ada)" value={photos.after} onChange={(v) => setPhotos(p => ({ ...p, after: v }))} onToast={onToast} />
              </div>
            </div>
          </div>

          {/* Section 05 */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">05</div>
              <div><h2 className="form-section-title">Tindakan Perbaikan</h2><p className="form-section-desc">Countermeasure yang dilakukan serta penanggung jawab perbaikan</p></div>
            </div>
            <div className="form-grid form-grid-1">
              <div className="form-group">
                <label className="form-label">Countermeasure / Saran <span className="req-mark">*</span></label>
                <textarea className={`form-textarea${errors.countermeasure ? ' is-invalid' : ''}`} rows="3" placeholder="Tindakan perbaikan yang telah atau akan dilakukan..." value={form.countermeasure} onChange={set('countermeasure')} />
                {errors.countermeasure && <span className="form-error">{errors.countermeasure}</span>}
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">PIC (Penanggung Jawab) <span className="req-mark">*</span></label>
                <select {...sel('pic')}>
                  <option value="">-- Pilih Departemen PIC --</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Kaizen">Kaizen</option>
                  <option value="Production">Production</option>
                </select>
                {errors.pic && <span className="form-error">{errors.pic}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Status Tindakan <span className="req-mark">*</span></label>
                <div className="radio-group">
                  {[['Temporary Action', 'status-temporary', 'Tindakan sementara, belum final'], ['Fix Action', 'status-fix', 'Tindakan permanen, sudah selesai']].map(([val, id, desc]) => (
                    <label className="radio-option" htmlFor={id} key={val}>
                      <input type="radio" id={id} name="status" value={val} checked={form.status === val} onChange={set('status')} />
                      <span className="radio-custom"/>
                      <div><span className="radio-label">{val}</span><span className="radio-desc">{desc}</span></div>
                    </label>
                  ))}
                </div>
                {errors.status && <span className="form-error">{errors.status}</span>}
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Tanggal Penyelesaian <span className="req-mark">*</span></label>
                <input {...inp('finishDate')} type="date" />
                {errors.finishDate && <span className="form-error">{errors.finishDate}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Waktu Penyelesaian <span className="req-mark">*</span></label>
                <input {...inp('finishTime')} type="time" />
                {errors.finishTime && <span className="form-error">{errors.finishTime}</span>}
              </div>
            </div>
          </div>

          <div className="form-submit-area">
            <button type="button" className="btn btn-ghost" onClick={handleReset}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
              Reset Form
            </button>
            <button type="submit" className="btn btn-red btn-lg" disabled={loading}>
              {loading ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> Menyimpan...</>
              ) : (
                <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg> Kirim Laporan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
