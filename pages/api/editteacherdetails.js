import connectDb from '../../middleware/mongoose'
import User from '../../models/users'
import bcrypt from 'bcryptjs'
import { withAuth } from '../../middleware/auth'

async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    res.setHeader('Allow', ['POST', 'PUT'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  try {
    await connectDb()

    const { _id, name, email, phone, role, address, password } = req.body || {}

    if (!_id) {
      return res.status(400).json({ success: false, error: 'User ID is required' })
    }

    const callerRole = (req.user?.role || '').toLowerCase()
    const isCallerAdmin = callerRole === 'admin'
    const isEditingSelf = req.user?.id === _id

    if (!isCallerAdmin && !isEditingSelf) {
      return res.status(403).json({ success: false, error: 'Forbidden: You cannot modify other users' })
    }

    const updateData = {}
    if (name !== undefined) updateData.name = name.trim()
    if (email !== undefined) updateData.email = email.toLowerCase().trim()
    if (phone !== undefined) updateData.phone = phone.toString().trim()
    if (address !== undefined) updateData.address = address.trim()

    // Only admins can modify user roles
    if (role !== undefined && isCallerAdmin) {
      updateData.role = role.toLowerCase() === 'admin' ? 'admin' : 'teacher'
    }

    // Securely hash password if updated
    if (password && typeof password === 'string' && password.trim().length >= 8) {
      updateData.password = await bcrypt.hash(password.trim(), 12)
    }

    const updatedUser = await User.findByIdAndUpdate(_id, updateData, { new: true }).select('-password')

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    return res.status(200).json({ success: true, message: 'User updated successfully', user: updatedUser })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: 'Email is already in use by another account' })
    }
    return res.status(500).json({ success: false, error: 'Failed to update user details' })
  }
}

export default withAuth(handler, { requiredRole: 'admin' })
