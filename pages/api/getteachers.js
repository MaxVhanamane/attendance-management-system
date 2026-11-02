import connectDb from '../../middleware/mongoose'
import User from '../../models/users'
import { withAuth } from '../../middleware/auth'

async function handler(req, res) {
  try {
    await connectDb()

    if (req.method === 'POST') {
      const { role } = req.body || {}
      const query = {}
      if (role) {
        query.role = role.trim().toLowerCase()
      }

      // CRITICAL: Always exclude password from query results
      const teachers = await User.find(query).select('-password').sort({ name: 1 })
      return res.status(200).json({ success: true, teachers })
    } else if (req.method === 'GET') {
      // CRITICAL: Always exclude password from query results
      const teachers = await User.find({}).select('-password').sort({ name: 1 })
      return res.status(200).json({ success: true, teachers })
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch teachers' })
  }
}

export default withAuth(handler, { requiredRole: 'admin' })
