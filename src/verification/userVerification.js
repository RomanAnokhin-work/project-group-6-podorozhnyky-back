import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { User } from '../models/user.js';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const generateVerificationToken = () =>
  crypto.randomBytes(32).toString('hex');

export const sendVerificationEmail = async (toEmail, token) => {
  const transporter = createTransporter();
  const base =
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const verifyUrl = `${base}/users/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to: toEmail,
    subject: 'Підтвердіть ваш емейл',
    html: `<p>Щоб підтвердити зміни емейлу, перейдіть за посиланням:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
};

export const verifyEmailToken = async (token) => {
  const user = await User.findOne({ verificationToken: token }).select(
    '+verificationToken verificationTokenExpires pendingEmail',
  );
  if (!user) return null;
  if (
    user.verificationTokenExpires &&
    user.verificationTokenExpires < new Date()
  )
    return null;

  // Apply pending email
  if (user.pendingEmail) {
    user.email = user.pendingEmail;
    user.pendingEmail = null;
  }
  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  await user.save();
  return user;
};
