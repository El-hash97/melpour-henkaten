const STORAGE_KEY = 'henkaten_reports'

export function generateId() {
  return 'RPT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase()
}

export function getReports() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

export function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
}

export function seedDemoData() {
  if (getReports().length > 0) return

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const demo = [
    {
      id: 'RPT-DEMO-001',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      name: 'Budi Santoso', noReg: 'EMP-1042', shift: 'Red',
      date: yesterday, time: '08:30', location: 'Melting Furnace #2', factor: 'Machine',
      henkaten: 'Terjadi getaran abnormal pada motor pengaduk furnace #2 saat proses melting berlangsung.',
      dampak: 'Potensi downtime produksi jika dibiarkan. Kualitas molten metal bisa terdampak.',
      fotoBefore: '', fotoAfter: '',
      countermeasure: 'Motor dimatikan sementara, bearing aus ditemukan dan sudah diganti.',
      pic: 'Maintenance', status: 'Fix Action', finishDate: today, finishTime: '11:00',
    },
    {
      id: 'RPT-DEMO-002',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      name: 'Sari Dewi', noReg: 'EMP-2087', shift: 'White',
      date: yesterday, time: '14:20', location: 'Pouring Station Area B', factor: 'Man',
      henkaten: 'Operator tidak menggunakan APD lengkap (face shield) saat proses pouring berlangsung.',
      dampak: 'Risiko kecelakaan kerja akibat percikan logam cair.',
      fotoBefore: '', fotoAfter: '',
      countermeasure: 'Operator diberikan teguran dan re-briefing prosedur keselamatan.',
      pic: 'Production', status: 'Temporary Action', finishDate: today, finishTime: '16:00',
    },
    {
      id: 'RPT-DEMO-003',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      name: 'Ahmad Fauzi', noReg: 'EMP-0315', shift: 'Red',
      date: today, time: '07:45', location: 'Analysis Lab', factor: 'Material',
      henkaten: 'Komposisi kimia sampel Heat #231 menunjukkan kadar Si melebihi batas atas spec.',
      dampak: 'Risiko cacat produk berupa kekerasan tidak sesuai spec.',
      fotoBefore: '', fotoAfter: '',
      countermeasure: 'Material di-hold sementara. Koordinasi dengan Engineering untuk disposition.',
      pic: 'Engineering', status: 'Temporary Action', finishDate: today, finishTime: '12:00',
    },
    {
      id: 'RPT-DEMO-004',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      name: 'Rini Handayani', noReg: 'EMP-1756', shift: 'White',
      date: today, time: '10:15', location: 'Melting Area – Panel Kontrol', factor: 'Methode',
      henkaten: 'SOP pemanasan furnace belum diperbarui pasca upgrade sistem kontrol suhu.',
      dampak: 'Prosedur tidak sinkron dapat menyebabkan overheat atau underheat.',
      fotoBefore: '', fotoAfter: '',
      countermeasure: 'Diajukan ke tim Kaizen untuk update SOP dan distribusi versi terbaru.',
      pic: 'Kaizen', status: 'Temporary Action', finishDate: today, finishTime: '15:30',
    },
  ]

  saveReports(demo)
}
