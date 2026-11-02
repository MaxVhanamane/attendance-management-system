import connectDb from '../../middleware/mongoose'
import AttendanceRecord from '../../models/attendancerecord'
import Student from '../../models/students'
import mongoose from 'mongoose'
import { withAuth } from '../../middleware/auth'
import { getIndianDayStart, getIndianDayEnd, getIndianDateString } from '../../lib/dateUtils'

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  try {
    await connectDb()

    const { _id, className, division, attendance, date, time } = req.body || {}

    if (!_id || !className || !division || !attendance || !date) {
      return res.status(400).json({ success: false, error: 'Missing required attendance fields' })
    }

    const normalizedClassName = className.toString().trim()
    const normalizedDivision = division.toString().toUpperCase().trim()
    const targetStudentId = new mongoose.Types.ObjectId(_id)

    // Calculate Indian day boundaries to identify today's attendance window
    const dateString = getIndianDateString(date || new Date())
    const startOfDay = getIndianDayStart(dateString)
    const endOfDay = getIndianDayEnd(dateString)
    const recordDate = date ? new Date(date) : new Date()
    const recordTime = time || new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })

    // 1. Atomically upsert the targeted student's attendance record
    await AttendanceRecord.findOneAndUpdate(
      {
        name: targetStudentId,
        date: { $gte: startOfDay, $lte: endOfDay },
      },
      {
        $set: {
          name: targetStudentId,
          email: req.body.email,
          phone: req.body.phone,
          className: normalizedClassName,
          division: normalizedDivision,
          rollNumber: req.body.rollNumber,
          attendance: attendance,
          date: recordDate,
          time: recordTime,
          genRegNumber: req.body.genRegNumber,
          caste: req.body.caste,
          subCaste: req.body.subCaste,
          DOB: req.body.DOB ? new Date(req.body.DOB) : undefined,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    // 2. Query all students enrolled in this specific class and division
    const allStudentsInClass = await Student.find({
      className: normalizedClassName,
      division: normalizedDivision,
    })

    // 3. Find all existing attendance records for this class & division on this date
    const existingRecordsToday = await AttendanceRecord.find({
      className: normalizedClassName,
      division: normalizedDivision,
      date: { $gte: startOfDay, $lte: endOfDay },
    })

    const existingStudentIdSet = new Set(existingRecordsToday.map((r) => r.name.toString()))

    // 4. Identify any students who do not yet have an attendance entry today and initialize with 'NT' (Not Taken)
    const missingStudents = allStudentsInClass.filter(
      (student) => !existingStudentIdSet.has(student._id.toString())
    )

    if (missingStudents.length > 0) {
      const defaultRecords = missingStudents.map((student) => ({
        name: student._id,
        email: student.email,
        phone: student.phone,
        className: student.className,
        division: student.division,
        rollNumber: student.rollNumber,
        attendance: 'NT',
        date: recordDate,
        time: recordTime,
        genRegNumber: student.genRegNumber,
        DOB: student.DOB,
        caste: student.caste,
        subCaste: student.subCaste,
      }))

      try {
        await AttendanceRecord.insertMany(defaultRecords, { ordered: false })
      } catch (insertError) {
        // Ignore duplicate key errors if inserted concurrently by another request
      }
    }

    return res.status(200).json({ success: true, message: 'Attendance recorded successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to record attendance' })
  }
}

export default withAuth(handler)
