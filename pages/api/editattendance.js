import connectDb from '../../middleware/mongoose'
import AttendanceRecord from '../../models/attendancerecord'
import { withAuth } from '../../middleware/auth'

async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    res.setHeader('Allow', ['POST', 'PUT'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  try {
    await connectDb()

    const { _id, attendance } = req.body || {}

    if (!_id || !attendance) {
      return res.status(400).json({ success: false, error: 'Record ID and attendance status are required' })
    }

    if (!['P', 'A', 'NT'].includes(attendance)) {
      return res.status(400).json({ success: false, error: 'Attendance must be P, A, or NT' })
    }

    const updated = await AttendanceRecord.findByIdAndUpdate(
      _id,
      { attendance },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' })
    }

    return res.status(200).json({ success: true, message: 'Attendance updated successfully', record: updated })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update attendance record' })
  }
}

export default withAuth(handler)
