const LIVE_API_URL = 'https://submit-mate-bd-backend.onrender.com/api'

export function getApiBaseUrl() {
  return API_URL
}

export function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('smb_token') || ''
}

export function setAuth(token: string, user: any) {
  if (typeof window === 'undefined') return

  localStorage.setItem('smb_token', token)
  localStorage.setItem('smb_user', JSON.stringify(user))
}

export function getUser() {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem('smb_user')

  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearAuth() {
  if (typeof window === 'undefined') return

  localStorage.removeItem('smb_token')
  localStorage.removeItem('smb_user')
}

function normalizeError(data: any) {
  if (typeof data === 'string') {
    return new Error(data || 'Request failed')
  }

  if (data?.errors) {
    const firstKey = Object.keys(data.errors)[0]
    const firstMessage = data.errors[firstKey]?.[0]

    if (firstMessage) {
      return new Error(firstMessage)
    }
  }

  return new Error(data?.message || data?.error || 'Request failed')
}

export function normalizeList(response: any, key?: string) {
  if (Array.isArray(response)) return response

  if (key && Array.isArray(response?.[key])) {
    return response[key]
  }

  if (Array.isArray(response?.data)) {
    return response.data
  }

  if (Array.isArray(response?.items)) {
    return response.items
  }

  if (response?.data && Array.isArray(response.data.data)) {
    return response.data.data
  }

  return []
}

export async function api(path: string, options: RequestInit = {}) {
  const token = getToken()

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''

  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    throw normalizeError(data)
  }

  return data
}

export async function logout() {
  try {
    await api('/logout', {
      method: 'POST',
    })
  } catch {
    // ignore logout api error
  }

  clearAuth()

  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

export async function downloadProtectedFile(
  path: string,
  fallbackName = 'download'
) {
  const token = getToken()

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: 'application/octet-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || ''

    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    throw normalizeError(data)
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = fallbackName

  document.body.appendChild(a)
  a.click()
  a.remove()

  window.URL.revokeObjectURL(url)
}