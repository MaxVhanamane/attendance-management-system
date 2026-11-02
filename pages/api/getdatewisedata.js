import connectDb from '../../middleware/mongoose'
import AttendanceRecord from '../../models/attendancerecord'
import { withAuth } from '../../middleware/auth'
import { getIndianDayStart, getIndianDayEnd } from '../../lib/dateUtils'

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  try {
    await connectDb()

    const { className, division, sDate, eDate } = req.body || {}

    if (!className || !division || !sDate || !eDate) {
      return res.status(400).json({ success: false, error: 'Missing required search criteria' })
    }

    const startDate = getIndianDayStart(sDate)
    const endDate = getIndianDayEnd(eDate)

    const studentsAttendanceRecord = await AttendanceRecord.find({
      className: className.toString().trim(),
      division: division.toString().toUpperCase().trim(),
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1, rollNumber: 1 })

    return res.status(200).json({ success: true, studentsAttendanceRecord })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve attendance records' })
  }
}

export default withAuth(handler)
