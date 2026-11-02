import connectDb from '../../middleware/mongoose'
import AttendanceRecord from '../../models/attendancerecord'
import mongoose from 'mongoose'
import { withAuth } from '../../middleware/auth'
import { getIndianDayStart, getIndianDayEnd } from '../../lib/dateUtils'

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  try {
    await connectDb()

    const { _id, className, division, sDate, eDate } = req.body || {}

    if (!_id || !sDate || !eDate) {
      return res.status(400).json({ success: false, error: 'Student ID and date range are required' })
    }

    const query = {
      name: new mongoose.Types.ObjectId(_id),
      date: { $gte: getIndianDayStart(sDate), $lte: getIndianDayEnd(eDate) },
    }

    if (className) query.className = className.toString().trim()
    if (division) query.division = division.toString().toUpperCase().trim()

    const studentsAttendance = await AttendanceRecord.find(query).sort({ date: 1 })

    return res.status(200).json({ success: true, studentsAttendance })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve student attendance' })
  }
}

export default withAuth(handler)
