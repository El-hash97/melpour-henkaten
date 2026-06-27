const AUTH_KEY = 'henkaten_auth'
const CREDENTIALS = { admin: 'leader123', leader: 'leader123' }

export function authInit() {
  try {
    const stored = localStorage.getItem(AUTH_KEY)
    return stored ? JSON.parse(stored) : { isLoggedIn: false, username: '' }
  } catch {
    return { isLoggedIn: false, username: '' }
  }
}

export function authLogin(username, password) {
  const u = username.trim().toLowerCase()
  const p = password.trim()
  if (CREDENTIALS[u] && CREDENTIALS[u] === p) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ isLoggedIn: true, username: u }))
    return { success: true }
  }
  return { success: false, message: 'Username atau password salah. Silakan coba lagi.' }
}

export function authLogout() {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ isLoggedIn: false, username: '' }))
}
