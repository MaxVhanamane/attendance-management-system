import connectDb from '../../middleware/mongoose'
import User from '../../models/users'
import bcrypt from 'bcryptjs'
import { AES, enc } from 'crypto-js'
import jwt from 'jsonwebtoken'
import { createAuthCookie, createCsrfCookie, generateCsrfToken } from '../../middleware/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  try {
    await connectDb()

    const { email, password } = req.body || {}

    // Input validation & NoSQL injection prevention
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Email and password are required' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      // Generic message to prevent account enumeration
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }

    let isMatch = false

    // Check if stored password is a bcrypt hash
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      isMatch = await bcrypt.compare(password, user.password)
    } else {
      // Legacy AES password verification with automatic migration to bcrypt
      try {
        const bytes = AES.decrypt(user.password, process.env.JWT_SECRET)
        const decryptedPass = bytes.toString(enc.Utf8)
        if (decryptedPass === password) {
          isMatch = true
          // Transparently rehash with bcrypt and persist
          const hashedPassword = await bcrypt.hash(password, 12)
          user.password = hashedPassword
          await user.save()
        }
      } catch (decryptErr) {
        isMatch = false
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }

    // Role normalization to lowercase
    const normalizedRole = (user.role || '').toLowerCase() === 'admin' ? 'admin' : 'teacher'

    // Include role inside signed JWT token
    const jwtToken = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: normalizedRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Generate stateless CSRF token
    const csrfToken = generateCsrfToken()

    // Set HttpOnly auth cookie and non-HttpOnly CSRF cookie
    res.setHeader('Set-Cookie', [createAuthCookie(jwtToken), createCsrfCookie(csrfToken)])

    return res.status(200).json({
      success: true,
      email: user.email,
      role: normalizedRole,
      csrfToken,
    })
  } catch (err) {
    console.log("err", err)
    return res.status(500).json({ success: false, error: 'Internal Server Error' })
  }
}
