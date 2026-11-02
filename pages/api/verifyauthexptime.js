import jwt from 'jsonwebtoken'
import { extractToken } from '../../middleware/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  const token = extractToken(req)

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, error: 'Token is invalid or expired' })
    }
    return res.status(200).json({ success: true, user: decoded })
  })
}
