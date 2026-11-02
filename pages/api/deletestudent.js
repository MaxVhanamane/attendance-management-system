import connectDb from '../../middleware/mongoose'
import Student from '../../models/students'
import AttendanceRecord from '../../models/attendancerecord'
import { withAuth } from '../../middleware/auth'

async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.setHeader('Allow', ['POST', 'DELETE'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  try {
    await connectDb()

    const studentId = req.body?._id

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID (_id) is required for deletion.' })
    }

    const deletedStudentInfo = await Student.findByIdAndDelete(studentId)

    if (!deletedStudentInfo) {
      return res.status(404).json({ success: false, message: 'Student record not found.' })
    }

    // Cascade delete all attendance records associated with this student
    await AttendanceRecord.deleteMany({ name: studentId })

    return res.status(200).json({ success: true, message: 'Student details and attendance deleted successfully!' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error while deleting student.' })
  }
}

export default withAuth(handler)
