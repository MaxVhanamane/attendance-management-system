import connectDb from '../../middleware/mongoose'
import User from '../../models/users'
import { withAuth } from '../../middleware/auth'

async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.setHeader('Allow', ['POST', 'DELETE'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  try {
    await connectDb()

    const teacherId = req.body?._id

    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'User ID is required' })
    }

    // Prevent self-deletion of the active admin account
    if (req.user?.id === teacherId) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own account' })
    }

    const deletedTeacherInfo = await User.findByIdAndDelete(teacherId)

    if (!deletedTeacherInfo) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    return res.status(200).json({ success: true, message: 'User deleted successfully' })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete user' })
  }
}

export default withAuth(handler, { requiredRole: 'admin' })
