import nodemailer from 'nodemailer'
import { withAuth } from '../../middleware/auth'

let transporter = null
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
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

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` })
  }

  const { name, email, attendance } = req.body || {}

  if (!email || typeof email !== 'string' || !name || typeof name !== 'string') {
    return res.status(400).json({ success: false, error: 'Valid student name and parent email are required' })
  }

  const attendanceValue = attendance === 'P' ? 'present' : 'absent'
  const isPresent = attendanceValue === 'present'
  const safeName = escapeHtml(name)
  const todayFormatted = new Date().toLocaleDateString('en-GB')

  const message = {
    from: process.env.EMAIL_ADDRESS,
    to: email.trim(),
    subject: `Attendance Update for ${safeName}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <p style="font-weight:bold">Dear Parent,</p>
        <p>Your son/daughter <strong>${safeName}</strong> is <span style="color:${
      isPresent ? 'green' : 'red'
    }; font-weight:bold;">${attendanceValue}</span> in school on ${todayFormatted}.</p>
        <p>आपला पाल्य <strong>${safeName}</strong> आज दिनांक ${todayFormatted} रोजी शाळेत <span style="color:${
      isPresent ? 'green' : 'red'
    }; font-weight:bold;">${isPresent ? 'उपस्थित' : 'अनुपस्थित'}</span> आहे.</p>
        <br/>
        <p style="font-weight:bold">Yours faithfully,</p>
        <p>Someshwar Highschool Hattur.</p>
      </div>
    `,
  }

  try {
    await getTransporter().sendMail(message)
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to dispatch email' })
  }
}

// Protected route: only authenticated teachers / admins can trigger emails
export default withAuth(handler)
