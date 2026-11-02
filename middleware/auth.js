import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// Extract JWT token strictly from cookies
export function extractToken(req) {
  if (req.cookies?.token) {
    return req.cookies.token
  }
  const rawCookie = req.headers?.cookie || ''
  if (rawCookie) {
    const match = rawCookie.match(/(?:^|;\s*)token=([^;]*)/)
    if (match) return decodeURIComponent(match[1])
  }
  return null
}

export function verifyJwtToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Generate stateless HMAC-signed CSRF token
export function generateCsrfToken() {
  const secret = process.env.CSRF_SECRET
  const nonce = crypto.randomBytes(24).toString('hex')
  const timestamp = Date.now().toString()
  const payload = `${nonce}.${timestamp}`
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return `${payload}.${signature}`
}

// Verify stateless HMAC-signed CSRF token
export function verifyCsrfToken(cookieToken, headerToken) {
  if (!cookieToken || !headerToken) return false
  if (cookieToken !== headerToken) return false

  const parts = cookieToken.split('.')
  if (parts.length !== 3) return false

  const [nonce, timestampStr, signature] = parts
  const timestamp = parseInt(timestampStr, 10)
  if (isNaN(timestamp)) return false

  // Max age: 7 days
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000
  if (Date.now() - timestamp > maxAgeMs) return false

  const secret = process.env.CSRF_SECRET
  const payload = `${nonce}.${timestampStr}`
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  const expectedBuf = Buffer.from(expectedSignature, 'utf8')
  const actualBuf = Buffer.from(signature, 'utf8')
  if (expectedBuf.length !== actualBuf.length) return false

  return crypto.timingSafeEqual(expectedBuf, actualBuf)
}

export function isRoleAuthorized(userRole, options = {}) {
  const normalizedUserRole = (userRole || '').toLowerCase()

  if (Array.isArray(options.allowedRoles) && options.allowedRoles.length > 0) {
    const allowed = options.allowedRoles.map((r) => r.toLowerCase())
    return allowed.includes(normalizedUserRole)
  }

  if (options.requiredRole) {
    const required = options.requiredRole.toLowerCase()
    if (required === 'admin') {
      return normalizedUserRole === 'admin'
    }
    if (required === 'teacher') {
      return normalizedUserRole === 'teacher' || normalizedUserRole === 'admin'
    }
    return normalizedUserRole === required
  }

  return normalizedUserRole === 'admin' || normalizedUserRole === 'teacher'
}

export function withAuth(handler, options = {}) {
  return async (req, res) => {
    const token = extractToken(req)

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Please log in to access this resource.',
      })
    }

    const decoded = verifyJwtToken(token)
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired session. Please log in again.',
      })
    }

    // CSRF verification for state-modifying methods (POST, PUT, DELETE, PATCH)
    const method = (req.method || '').toUpperCase()
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)

    if (isMutation && options.csrf !== false) {
      let cookieToken = req.cookies?.csrf_token
      if (!cookieToken && req.headers?.cookie) {
        const match = req.headers.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)
        if (match) cookieToken = decodeURIComponent(match[1])
      }
      const headerToken = req.headers['x-csrf-token']

      if (!verifyCsrfToken(cookieToken, headerToken)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: Invalid or missing CSRF token.',
        })
      }
    }

    // Role verification
    if (!isRoleAuthorized(decoded.role, options)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to perform this action.',
      })
    }

    req.user = decoded
    return handler(req, res)
  }
}

// Server-side rendering authentication helper for getServerSideProps.
// Returns a Next.js redirect object on failure, or null on success.
export function verifySSRAuth(context, options = {}) {
  const cookies = context.req.cookies || {}
  const rawCookie = context.req?.headers?.cookie || ''

  let token = cookies.token
  if (!token && rawCookie) {
    const match = rawCookie.match(/(?:^|;\s*)token=([^;]*)/)
    if (match) token = decodeURIComponent(match[1])
  }

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  const decoded = verifyJwtToken(token)
  if (!decoded) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  if (!isRoleAuthorized(decoded.role, options)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return null
}

export function createAuthCookie(token) {
  const isProd = process.env.NODE_ENV === 'production'
  const maxAge = 7 * 24 * 60 * 60 // 7 days in seconds
  return `token=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax; ${isProd ? 'Secure;' : ''} HttpOnly`
}

export function clearAuthCookie() {
  const isProd = process.env.NODE_ENV === 'production'
  return `token=; Path=/; Max-Age=0; SameSite=Lax; ${isProd ? 'Secure;' : ''} HttpOnly`
}

export function createCsrfCookie(csrfToken) {
  const isProd = process.env.NODE_ENV === 'production'
  const maxAge = 7 * 24 * 60 * 60 // 7 days in seconds
  return `csrf_token=${csrfToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax; ${isProd ? 'Secure;' : ''}`
}

export function clearCsrfCookie() {
  const isProd = process.env.NODE_ENV === 'production'
  return `csrf_token=; Path=/; Max-Age=0; SameSite=Lax; ${isProd ? 'Secure;' : ''}`
}
