function getCookie(name) {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'))
  // Decode the cookie value in case it contains URL-encoded characters (e.g., %20 -> space)
  return match ? decodeURIComponent(match[1]) : ''
}

// Fetches a fresh CSRF token from the server
async function fetchCsrfToken() {
  try {
    const res = await fetch('/api/csrf', { method: 'GET', credentials: 'same-origin' })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }
    const data = await res.json()
    if (!data.success || !data.csrfToken) {
      throw new Error(data.error || 'Server did not return a valid CSRF token')
    }
    return data.csrfToken
  } catch (err) {
    throw new Error(`Security validation failed: ${err.message}`)
  }
}


// Authenticated fetch helper for client-side API requests.
// Automatically includes credentials for HttpOnly cookie authentication,
// ensures a valid CSRF token is attached for mutations, and self-heals on token expiration.
export async function fetchWithAuth(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const method = (options.method || 'GET').toUpperCase()
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)

  // add a csrf token if the request is for mutating the data
  if (isMutation && typeof window !== 'undefined') {
    let csrfToken = getCookie('csrf_token')
    if (!csrfToken) {
      try {
        csrfToken = await fetchCsrfToken()
      } catch (err) {
        // Return a standard 403 Response so callers doing "const res = await fetchWithAuth(); const data = await res.json()" receive an actionable error response without unhandled promise crashes
        return new Response(
          JSON.stringify({
            success: false,
            error: err.message,
          }),
          {
            status: 403,
            statusText: 'Forbidden',
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }
    headers['x-csrf-token'] = csrfToken
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  })

  // Self-healing: if mutation failed with 403 due to an invalid/expired CSRF token, auto-refresh and retry once
  if (isMutation && response.status === 403 && typeof window !== 'undefined' && !options._isRetry) {
    const clone = response.clone()
    try {
      const body = await clone.json()
      if (body.error && body.error.toLowerCase().includes('csrf')) {
        try {
          const freshToken = await fetchCsrfToken()
          headers['x-csrf-token'] = freshToken

          return fetch(url, {
            ...options,
            _isRetry: true,
            headers,
            credentials: 'same-origin',
          })
        } catch (retryErr) {
          return response
        }
      }
    } catch (e) {
      // Body not JSON; return original response
    }
  }

  return response
}

export default fetchWithAuth
