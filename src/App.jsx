import { useState, useEffect, useCallback } from 'react'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import SuccessOverlay from './components/SuccessOverlay'
import PhotoModal from './components/PhotoModal'
import FormPage from './pages/FormPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import { getReports, saveReports, seedDemoData } from './lib/storage'
import { authInit, authLogout } from './lib/auth'

export default function App() {
  const [view, setView] = useState('form')
  const [auth, setAuth] = useState({ isLoggedIn: false, username: '' })
  const [reports, setReports] = useState([])
  const [toasts, setToasts] = useState([])
  const [successVisible, setSuccessVisible] = useState(false)
  const [modalReport, setModalReport] = useState(null)

  useEffect(() => {
    const stored = authInit()
    setAuth(stored)
    seedDemoData()
    setReports(getReports())
    const hash = window.location.hash.replace('#', '')
    if (hash === 'dashboard' && stored.isLoggedIn) setView('dashboard')
    else if (hash === 'login') setView('login')
  }, [])

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const navigate = useCallback((nextView) => {
    setAuth(current => {
      if (nextView === 'dashboard' && !current.isLoggedIn) {
        setView('login')
        showToast('Silakan login terlebih dahulu untuk mengakses Dashboard.', 'warning')
        return current
      }
      setView(nextView)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return current
    })
  }, [showToast])

  const login = useCallback((username) => {
    const u = username.trim().toLowerCase()
    setAuth({ isLoggedIn: true, username: u })
    setView('dashboard')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    showToast(`Selamat datang, ${u}!`, 'success')
  }, [showToast])

  const logout = useCallback(() => {
    authLogout()
    setAuth({ isLoggedIn: false, username: '' })
    setView('login')
    showToast('Berhasil keluar dari Dashboard.', 'info')
  }, [showToast])

  const submitReport = useCallback((data) => {
    setReports(prev => {
      const updated = [data, ...prev]
      saveReports(updated)
      return updated
    })
    setSuccessVisible(true)
  }, [])

  const deleteReport = useCallback((id) => {
    setReports(prev => {
      const updated = prev.filter(r => r.id !== id)
      saveReports(updated)
      return updated
    })
    showToast('Laporan berhasil dihapus.', 'info')
  }, [showToast])

  return (
    <>
      <Navbar auth={auth} onNavigate={navigate} onLogout={logout} />

      {view === 'form' && <FormPage onSubmit={submitReport} onToast={showToast} />}
      {view === 'login' && <LoginPage onLogin={login} onToast={showToast} />}
      {view === 'dashboard' && (
        <DashboardPage
          reports={reports}
          onDelete={deleteReport}
          onOpenModal={setModalReport}
          onToast={showToast}
        />
      )}

      {successVisible && <SuccessOverlay onClose={() => { setSuccessVisible(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />}
      {modalReport && <PhotoModal report={modalReport} onClose={() => setModalReport(null)} />}

      <div className="toast-container">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onRemove={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </>
  )
}
