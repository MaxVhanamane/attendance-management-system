import { clearAuthCookie, clearCsrfCookie } from '../../middleware/auth'

export default async function handler(req, res) {
  res.setHeader('Set-Cookie', [clearAuthCookie(), clearCsrfCookie()])
  return res.status(200).json({ success: true, message: 'Logged out successfully' })
}
