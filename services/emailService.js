const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      // Configure your email service
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendVerificationEmail(email, token, userType) {
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${userType}/${token}`;
    
    const mailOptions = {
      from: `"Coursera Clone" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Email Verification',
      html: `
        <h1>Verify Your Email Address</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationURL}" style="display: inline-block; padding: 10px 20px; background-color: #0056b3; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request this verification, please ignore this email.</p>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email, token, userType) {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${userType}/${token}`;
    
    const mailOptions = {
      from: `"Coursera Clone" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Password Reset',
      html: `
        <h1>Reset Your Password</h1>
        <p>You requested a password reset. Please click the link below to set a new password:</p>
        <a href="${resetURL}" style="display: inline-block; padding: 10px 20px; background-color: #0056b3; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }
}

module.exports = EmailService;