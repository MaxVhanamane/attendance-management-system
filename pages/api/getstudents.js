import connectDb from '../../middleware/mongoose'
import Student from '../../models/students'
import { withAuth } from '../../middleware/auth'

async function handler(req, res) {
  try {
    await connectDb()

    if (req.method === 'POST') {
      const { className, division } = req.body || {}
      const query = {}
      if (className) query.className = className.trim()
      if (division) query.division = division.toUpperCase().trim()

      const students = await Student.find(query).sort({ rollNumber: 1 })
      return res.status(200).json({ success: true, students })
    } else if (req.method === 'GET') {
      const students = await Student.find({}).sort({ className: 1, division: 1, rollNumber: 1 })
      return res.status(200).json({ success: true, students })
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch students' })
  }
}

export default withAuth(handler)
