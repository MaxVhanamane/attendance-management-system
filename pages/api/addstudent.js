import connectDb from '../../middleware/mongoose'
import Student from '../../models/students'
import { withAuth } from '../../middleware/auth'

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  try {
    await connectDb()

    const {
      name,
      email,
      phone,
      className,
      division,
      rollNumber,
      genRegNumber,
      DOB,
      caste,
      subCaste,
    } = req.body || {}

    // Input validation
    if (!name || !email || !className || !division || rollNumber === undefined || genRegNumber === undefined || !DOB) {
      return res.status(400).json({ success: false, error: 'Please provide all required student details.' })
    }

    const normalizedDivision = division.toUpperCase().trim()

    // Check for duplicate roll number in same class & division
    const existingStudent = await Student.findOne({
      className: className.trim(),
      division: normalizedDivision,
      rollNumber: Number(rollNumber),
    })

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        error: `Roll Number ${rollNumber} already exists in Class ${className} Division ${normalizedDivision}.`,
      })
    }

    // Check for duplicate general registration number
    const existingGenReg = await Student.findOne({ genRegNumber: Number(genRegNumber) })
    if (existingGenReg) {
      return res.status(409).json({
        success: false,
        error: `General Registration Number ${genRegNumber} is already assigned to another student.`,
      })
    }

    const studentDetails = new Student({
      name: name.trim(),
      email: email.trim(),
      phone,
      className: className.trim(),
      division: normalizedDivision,
      rollNumber: Number(rollNumber),
      genRegNumber: Number(genRegNumber),
      DOB: new Date(DOB),
      caste: (caste || '').trim(),
      subCaste: (subCaste || '').trim(),
    })

    await studentDetails.save()
    return res.status(201).json({ success: true, message: 'Student registered successfully' })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: 'Duplicate student record detected.' })
    }
    return res.status(500).json({ success: false, error: 'Internal server error while adding student.' })
  }
}

export default withAuth(handler)
