const LIVE_API_URL = 'https://submit-mate-bd-backend.onrender.com/api'
const LIVE_STORAGE_URL = 'https://submit-mate-bd-backend.onrender.com/storage'

const LOCAL_API_URL = 'http://127.0.0.1:8000/api'
const LOCAL_STORAGE_URL = 'http://127.0.0.1:8000/storage'

function cleanUrl(url: string) {
  return url.replace(/\/$/, '')
}

function isLocalUrl(url?: string) {
  if (!url) return false

  return url.includes('127.0.0.1') || url.includes('localhost')
}

function isLocalBrowser() {
  if (typeof window === 'undefined') return false

  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  )
}

export function getApiBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim()

  if (envUrl && !isLocalUrl(envUrl)) {
    return cleanUrl(envUrl)
  }

  if (isLocalBrowser()) {
    return envUrl ? cleanUrl(envUrl) : LOCAL_API_URL
  }

  return LIVE_API_URL
}

export function getStorageBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_STORAGE_URL?.trim()

  if (envUrl && !isLocalUrl(envUrl)) {
    return cleanUrl(envUrl)
  }

  if (isLocalBrowser()) {
    return envUrl ? cleanUrl(envUrl) : LOCAL_STORAGE_URL
  }

  return LIVE_STORAGE_URL
}

export function getToken() {
  if (typeof window === 'undefined') return ''

  return (
    localStorage.getItem('smb_token') ||
    localStorage.getItem('submitmate_token') ||
    ''
  )
}

export function getUser() {
  if (typeof window === 'undefined') return null

  const rawUser =
    localStorage.getItem('smb_user') ||
    localStorage.getItem('submitmate_user')

  if (!rawUser) return null

  try {
    return JSON.parse(rawUser)
  } catch {
    return null
  }
}

export function saveAuth(token: string, user: any) {
  if (typeof window === 'undefined') return

  localStorage.setItem('smb_token', token)
  localStorage.setItem('smb_user', JSON.stringify(user))

  localStorage.setItem('submitmate_token', token)
  localStorage.setItem('submitmate_user', JSON.stringify(user))
}

export function setAuth(token: string, user: any) {
  saveAuth(token, user)
}

export function clearAuth() {
  if (typeof window === 'undefined') return

  localStorage.removeItem('smb_token')
  localStorage.removeItem('smb_user')
  localStorage.removeItem('submitmate_token')
  localStorage.removeItem('submitmate_user')
}

export async function logout() {
  clearAuth()

  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
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

  if (key && Array.isArray(response?.[key])) return response[key]

  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.items)) return response.items
  if (Array.isArray(response?.services)) return response.services
  if (Array.isArray(response?.packages)) return response.packages
  if (Array.isArray(response?.orders)) return response.orders
  if (Array.isArray(response?.payments)) return response.payments
  if (Array.isArray(response?.files)) return response.files

  if (response?.data && Array.isArray(response.data.data)) {
    return response.data.data
  }

  return []
}

export async function api(path: string, options: RequestInit = {}) {
  const baseUrl = getApiBaseUrl()
  const token = getToken()

  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const isFormData = options.body instanceof FormData

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${baseUrl}${cleanPath}`, {
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

export async function downloadProtectedFile(
  path: string,
  fallbackName = 'download'
) {
  const baseUrl = getApiBaseUrl()
  const token = getToken()
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  const response = await fetch(`${baseUrl}${cleanPath}`, {
    headers: {
      Accept: 'application/octet-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    throw new Error('File download failed.')
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