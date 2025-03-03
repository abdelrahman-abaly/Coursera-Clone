const organizationAuthController = {
  // Register Organization
  registerOrganization: async (req, res) => {
    try {
      const { 
        username, 
        organizationName, 
        contactPerson,
        email, 
        password,
        phone,
        website,
        description,
        address
      } = req.body;
      
      // Check if organization already exists
      const existingOrg = await Organization.findOne({ 
        $or: [{ email }, { username }, { organizationName }] 
      });
      
      if (existingOrg) {
        return res.status(400).json({ 
          message: 'Organization with this email, username, or name already exists' 
        });
      }
      
      // Create new organization
      const organization = new Organization({
        username,
        organizationName,
        contactPerson,
        email,
        password,
        phone,
        website,
        description,
        address
      });
      
      // Generate verification token
      const verificationToken = organization.generateEmailVerificationToken();
      
      await organization.save();
      
      // Send verification email
      const emailService = new EmailService();
      await emailService.sendVerificationEmail(email, verificationToken, 'organization');
      
      res.status(201).json({
        message: 'Organization registered successfully. Please check your email to verify your account.',
        organizationId: organization._id
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Approve Organization (admin only)
  approveOrganization: async (req, res) => {
    try {
      // Check if the requester is an admin
      if (req.userType !== 'admin') {
        return res.status(403).json({ 
          message: 'Only admins can approve organizations' 
        });
      }
      
      const { organizationId } = req.params;
      
      const organization = await Organization.findById(organizationId);
      
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      if (organization.isApproved) {
        return res.status(400).json({ message: 'Organization already approved' });
      }
      
      // Update organization
      organization.isApproved = true;
      organization.approvedBy = req.user._id;
      organization.approvedAt = Date.now();
      
      await organization.save();
      
      // Send approval notification email
      const emailService = new EmailService();
      const mailOptions = {
        from: `"Coursera Clone" <${process.env.EMAIL_FROM}>`,
        to: organization.email,
        subject: 'Organization Approval',
        html: `
          <h1>Your Organization Has Been Approved</h1>
          <p>Congrats, your organization has been approved by an admin.</p>
          <p>Please login to your Coursera Clone account to view your organization details.</p>
          <p>Best regards,</p>
          <p>Coursera Clone Team</p>
          <p><a href="${process.env.CLIENT_URL}">Visit Coursera Clone</a></p>
          <p><a href="mailto:${process.env.EMAIL_SUPPORT}">Contact Support</a></p>
          <p><a href="https://github.com/coursera-clone/coursera-clone">View on GitHub</a></p>
          <p>This email was sent automatically. Please do not reply.</p>
          `
      };
      
      await emailService.sendEmail(mailOptions);
      
      res.status(200).json({ 
        message: 'Organization approved successfully',
        organization: {
          _id: organization._id,
          organizationName: organization.organizationName,
          email: organization.email,
          isApproved: organization.isApproved,
          approvedAt: organization.approvedAt
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Verify Organization Email
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.params;
      
      // Find organization with the verification token
      const organization = await Organization.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() }
      });
      
      if (!organization) {
        return res.status(400).json({ 
          message: 'Invalid or expired verification token' 
        });
      }
      
      // Update organization verification status
      organization.isEmailVerified = true;
      organization.emailVerificationToken = undefined;
      organization.emailVerificationExpires = undefined;
      
      await organization.save();
      
      res.status(200).json({ 
        message: 'Email verified successfully. You can now login to your account.',
        verified: true
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Organization Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find organization
      const organization = await Organization.findOne({ email });
      
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      // Check if password is correct
      const isPasswordValid = await organization.comparePassword(password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }
      
      // Check if email is verified
      if (!organization.isEmailVerified) {
        return res.status(401).json({ 
          message: 'Please verify your email before logging in' 
        });
      }
      
      // Check if organization is approved
      if (!organization.isApproved) {
        return res.status(401).json({ 
          message: 'Your organization is pending approval by an admin' 
        });
      }
      
      // Generate token
      const token = organization.generateAuthToken();
      
      // Update last login
      organization.lastLogin = Date.now();
      await organization.save();
      
      res.status(200).json({
        message: 'Login successful',
        token,
        organization: {
          _id: organization._id,
          organizationName: organization.organizationName,
          email: organization.email,
          username: organization.username,
          contactPerson: organization.contactPerson,
          isApproved: organization.isApproved,
          isEmailVerified: organization.isEmailVerified
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Forgot Password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
      const organization = await Organization.findOne({ email });
      
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      // Generate reset token
      const resetToken = organization.generatePasswordResetToken();
      
      await organization.save();
      
      // Send password reset email
      const resetURL = `${process.env.CLIENT_URL}/organization/reset-password/${resetToken}`;
      
      const emailService = new EmailService();
      const mailOptions = {
        from: `"Coursera Clone" <${process.env.EMAIL_FROM}>`,
        to: organization.email,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset for your organization account.</p>
          <p>Please click the link below to reset your password:</p>
          <p><a href="${resetURL}" target="_blank">Reset Password</a></p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>The link will expire in 1 hour.</p>
          <p>Best regards,</p>
          <p>Coursera Clone Team</p>
        `
      };
      
      await emailService.sendEmail(mailOptions);
      
      res.status(200).json({
        message: 'Password reset email sent. Please check your email.'
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Reset Password
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
      const organization = await Organization.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });
      
      if (!organization) {
        return res.status(400).json({ 
          message: 'Invalid or expired reset token' 
        });
      }
      
      // Update password
      organization.password = password;
      organization.passwordResetToken = undefined;
      organization.passwordResetExpires = undefined;
      
      await organization.save();
      
      // Send confirmation email
      const emailService = new EmailService();
      const mailOptions = {
        from: `"Coursera Clone" <${process.env.EMAIL_FROM}>`,
        to: organization.email,
        subject: 'Password Reset Successful',
        html: `
          <h1>Password Reset Successful</h1>
          <p>Your organization account password has been successfully reset.</p>
          <p>If you didn't do this, please contact our support team immediately.</p>
          <p>Best regards,</p>
          <p>Coursera Clone Team</p>
        `
      };
      
      await emailService.sendEmail(mailOptions);
      
      res.status(200).json({
        message: 'Password reset successful. You can now login with your new password.'
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Get Organization Profile
  getProfile: async (req, res) => {
    try {
      const organization = await Organization.findById(req.user._id).select('-password');
      
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      res.status(200).json({
        organization
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Update Organization Profile
  updateProfile: async (req, res) => {
    try {
      const {
        organizationName,
        contactPerson,
        phone,
        website,
        description,
        address
      } = req.body;
      
      const organization = await Organization.findById(req.user._id);
      
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      // Update fields
      if (organizationName) organization.organizationName = organizationName;
      if (contactPerson) organization.contactPerson = contactPerson;
      if (phone) organization.phone = phone;
      if (website) organization.website = website;
      if (description) organization.description = description;
      if (address) organization.address = address;
      
      await organization.save();
      
      res.status(200).json({
        message: 'Organization profile updated successfully',
        organization: {
          _id: organization._id,
          organizationName: organization.organizationName,
          email: organization.email,
          username: organization.username,
          contactPerson: organization.contactPerson,
          phone: organization.phone,
          website: organization.website,
          description: organization.description,
          address: organization.address
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Change Password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const organization = await Organization.findById(req.user._id);
      
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      // Verify current password
      const isPasswordValid = await organization.comparePassword(currentPassword);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Update password
      organization.password = newPassword;
      
      await organization.save();
      
      res.status(200).json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Resend Verification Email
  resendVerificationEmail: async (req, res) => {
    try {
      const { email } = req.body;
      
      const organization = await Organization.findOne({ email });
      
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      if (organization.isEmailVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }
      
      // Generate new verification token
      const verificationToken = organization.generateEmailVerificationToken();
      
      await organization.save();
      
      // Send verification email
      const emailService = new EmailService();
      await emailService.sendVerificationEmail(email, verificationToken, 'organization');
      
      res.status(200).json({
        message: 'Verification email sent. Please check your email.'
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = organizationAuthController;