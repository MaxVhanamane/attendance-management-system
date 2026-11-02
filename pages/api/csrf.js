import { generateCsrfToken, createCsrfCookie } from '../../middleware/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  const csrfToken = generateCsrfToken()
  res.setHeader('Set-Cookie', createCsrfCookie(csrfToken))
  return res.status(200).json({ success: true, csrfToken })
}
