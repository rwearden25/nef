const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (images, etc.)
app.use(express.static(path.join(__dirname)));

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  // Configure email transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Build email
  const mailOptions = {
    from: `"Northeast Fence Website" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL || 'info@northeastfencetx.com',
    replyTo: email,
    subject: `New Fence Estimate Request from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1714; padding: 20px 30px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C4956A; margin: 0; font-size: 20px;">New Estimate Request</h1>
          <p style="color: rgba(255,255,255,0.5); margin: 5px 0 0; font-size: 13px;">Northeast Fence Company Website</p>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e0d8cf; border-top: none; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe4; color: #8B5E3C; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe4;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe4; color: #8B5E3C; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe4;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe4; color: #8B5E3C; font-weight: bold;">Phone:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe4;"><a href="tel:${phone || ''}">${phone || 'Not provided'}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe4; color: #8B5E3C; font-weight: bold;">Service:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe4;">${service || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #8B5E3C; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 10px 0;">${message.replace(/\n/g, '<br>')}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background: #faf7f3; border-radius: 6px; font-size: 13px; color: #6B6560;">
            Reply directly to this email to respond to ${name} at ${email}
          </div>
        </div>
      </div>
    `,
    text: `New Estimate Request\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nService: ${service || 'Not specified'}\n\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Thank you! We\'ll be in touch shortly.' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send message. Please call us at 817-281-6261.' });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Northeast Fence server running on port ${PORT}`);
});
