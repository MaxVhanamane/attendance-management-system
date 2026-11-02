import connectDb from '../../middleware/mongoose'
import cryptoRandomString from 'crypto-random-string'
import ForgotPasswordToken from '../../models/forgotpasswordtoken'
import User from '../../models/users'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'

// Reusable nodemailer transporter instance
let transporter = null
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }
  return transporter
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  try {
    await connectDb()

    const { email, sendMail, token, newPassword } = req.body || {}

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid email is required' })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Branch 1: Request password reset link
    if (sendMail) {
      const verifyUser = await User.findOne({ email: normalizedEmail })

      // If user does not exist, return generic success to prevent account enumeration
      if (!verifyUser) {
        return res.status(200).json({
          success: true,
          message: 'If an account exists with this email, a reset link has been sent.',
        })
      }

      const randomToken = cryptoRandomString({ length: 32, type: 'alphanumeric' })
      const expiresIn = Date.now() + 10 * 60 * 1000 // 10 minutes

      await ForgotPasswordToken.findOneAndUpdate(
        { email: normalizedEmail },
        { token: randomToken, expiresIn },
        { upsert: true, new: true }
      )

      const resetUrl = `${process.env.NEXT_PUBLIC_HOST}/forgotpassword?token=${encodeURIComponent(
        randomToken
      )}&email=${encodeURIComponent(normalizedEmail)}`

      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>ClassScribe Password Reset</h2>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <p><a href="${resetUrl}" style="background-color: #0d9488; color: white; padding: 10px 18px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>Or paste this URL in your browser: <a href="${resetUrl}">${resetUrl}</a></p>
          <p style="color: #666; font-size: 13px;">This link will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `

      const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: normalizedEmail,
        subject: 'Password reset link for your account on ClassScribe',
        html: emailHtml,
      }

      await getTransporter().sendMail(mailOptions)

      return res.status(200).json({
        success: true,
        message: 'Password reset link sent successfully.',
      })
    }

    // Branch 2: Reset password using token
    if (!token || typeof token !== 'string' || !newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ success: false, message: 'Token and new password are required' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' })
    }

    const dbTokenRecord = await ForgotPasswordToken.findOne({ email: normalizedEmail })

    if (!dbTokenRecord || dbTokenRecord.token !== token) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' })
    }

    if (Date.now() > dbTokenRecord.expiresIn) {
      await ForgotPasswordToken.deleteOne({ _id: dbTokenRecord._id })
      return res.status(400).json({ success: false, message: 'Your reset token has expired. Please request a new one.' })
    }

    // Hash the new password securely with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await User.findOneAndUpdate({ email: normalizedEmail }, { password: hashedPassword })

    // CRITICAL FIX: Invalidate the token immediately so it cannot be reused
    await ForgotPasswordToken.deleteOne({ _id: dbTokenRecord._id })

    return res.status(200).json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' })
  }
}
