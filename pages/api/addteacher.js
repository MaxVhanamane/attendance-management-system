import connectDb from '../../middleware/mongoose'
import User from '../../models/users'
import bcrypt from 'bcryptjs'
import { extractToken, verifyJwtToken, verifyCsrfToken } from '../../middleware/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  try {
    await connectDb()

    const { name, email, password, phone, role, address } = req.body || {}

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' })
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long' })
    }

    // Check if any users exist in the system
    const userCount = await User.countDocuments({})

    // If users already exist, require admin authentication and CSRF token
    if (userCount > 0) {
      const token = extractToken(req)
      if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication required' })
      }
      const decoded = verifyJwtToken(token)
      if (!decoded || (decoded.role || '').toLowerCase() !== 'admin') {
        return res.status(403).json({ success: false, error: 'Forbidden: Only administrators can add users' })
      }
      let cookieToken = req.cookies?.csrf_token
      if (!cookieToken && req.headers?.cookie) {
        const match = req.headers.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)
        if (match) cookieToken = decodeURIComponent(match[1])
      }
      const headerToken = req.headers['x-csrf-token']
      if (!verifyCsrfToken(cookieToken, headerToken)) {
        return res.status(403).json({ success: false, error: 'Forbidden: Invalid or missing CSRF token' })
      }
    }

    const normalizedEmail = email.toLowerCase().trim()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' })
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12)

    // Normalize role to lowercase
    const normalizedRole = role && (role.toLowerCase() === 'admin') ? 'admin' : 'teacher'

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      address: (address || '').trim(),
      phone: (phone || '').toString().trim(),
    })

    await user.save()
    return res.status(201).json({ success: true, message: 'User created successfully' })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to create user' })
  }
}
