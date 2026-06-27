export default function Navbar({ auth, onNavigate, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <img src="/logo.png" alt="Logo" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="navbar-title">
            <span className="navbar-title-main">Henkaten &amp; Problem</span>
            <span className="navbar-title-sub">Melting · Pouring · Analysis</span>
          </div>
        </div>

        <div className="navbar-actions">
          {!auth.isLoggedIn ? (
            <button className="btn-icon btn-icon-red" title="Leader Login" onClick={() => onNavigate('login')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </button>
          ) : (
            <>
              <button className="btn-icon" title="Dashboard" onClick={() => onNavigate('dashboard')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </button>
              <button className="btn-icon" title="Logout" onClick={onLogout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
