const KEY = 'admin_pw'

export function getAdminPassword(): string | null {
  try { return sessionStorage.getItem(KEY) } catch { return null }
}

export function setAdminPassword(pw: string): void {
  sessionStorage.setItem(KEY, pw)
}

export function clearAdminPassword(): void {
  sessionStorage.removeItem(KEY)
}

function authHeader(): HeadersInit {
  const pw = getAdminPassword() ?? ''
  return { Authorization: 'Basic ' + btoa(`admin:${pw}`) }
}

export function adminFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: { ...authHeader(), ...(init?.headers ?? {}) },
  })
}
