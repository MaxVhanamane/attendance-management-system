import connectDb from '../../middleware/mongoose'
import Student from '../../models/students'
import { withAuth } from '../../middleware/auth'

async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    res.setHeader('Allow', ['POST', 'PUT'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  try {
    await connectDb()

    const {
      _id,
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

    if (!_id) {
      return res.status(400).json({ success: false, error: 'Student ID is required' })
    }

    // Whitelist only allowed fields to prevent mass assignment
    const updateData = {}
    if (name !== undefined) updateData.name = name.trim()
    if (email !== undefined) updateData.email = email.trim()
    if (phone !== undefined) updateData.phone = phone
    if (className !== undefined) updateData.className = className.trim()
    if (division !== undefined) updateData.division = division.toUpperCase().trim()
    if (rollNumber !== undefined) updateData.rollNumber = Number(rollNumber)
    if (genRegNumber !== undefined) updateData.genRegNumber = Number(genRegNumber)
    if (DOB !== undefined) updateData.DOB = new Date(DOB)
    if (caste !== undefined) updateData.caste = caste.trim()
    if (subCaste !== undefined) updateData.subCaste = subCaste.trim()

    const data = await Student.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true })

    if (!data) {
      return res.status(404).json({ success: false, error: 'Student record not found' })
    }

    return res.status(200).json({ success: true, data })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: 'Update conflicts with an existing roll number.' })
    }
    return res.status(500).json({ success: false, error: 'Failed to update student details' })
  }
}

export default withAuth(handler)
