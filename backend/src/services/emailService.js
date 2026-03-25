const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, name = 'Student') => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: '🎓 EduKids - Your OTP Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: 'Comic Sans MS', cursive; background: #FFF9E6; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 20px; padding: 30px; border: 3px solid #FFD700; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #FF6B35; font-size: 32px; margin: 0;">🎓 EduKids</h1>
              <p style="color: #666; font-size: 14px;">Fun Learning Platform</p>
            </div>
            <h2 style="color: #4CAF50; text-align: center;">Hello, ${name}! 👋</h2>
            <p style="color: #333; font-size: 16px;">Your OTP verification code is:</p>
            <div style="background: linear-gradient(135deg, #FF6B35, #FFD700); border-radius: 15px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: white; font-size: 42px; letter-spacing: 8px; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center;">⏰ This code expires in <strong>5 minutes</strong></p>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
            <div style="text-align: center; margin-top: 20px;">
              <span style="font-size: 24px;">⭐🏅🎁</span>
              <p style="color: #FF6B35; font-size: 12px;">Keep learning and earn rewards!</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { generateOTP, sendOTPEmail };
