import createHttpError from "http-errors";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import { createSession, setSessionCookies } from "../services/auth.js";
import { Session } from '../models/session.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendMail.js';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

// Логін
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

  await Session.deleteOne({ userId: user._id });

  const newSession = await createSession(user._id);

  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

// Реєстрація
export const registerUser = async (req, res) => {
  const { email, password, name } = req.body;

  // Перевірка, чи email вже використовується
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(400, "Email in use");
  }

  // Хешуємо пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // Створюємо нового користувача
  const newUser = await User.create({
    email,
    name,
    password: hashedPassword,
  });

  // Створюємо сесію і встановлюємо cookie
  const session = await createSession(newUser._id);
  setSessionCookies(res, session);

  // Відправляємо відповідь
  res.status(201).json(newUser);
};

// Вихід
export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const refreshUserSession = async (req, res, next) => {
  const session = await Session.findOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    return next(createHttpError(401, 'Session token expired'));
  }

  await Session.deleteOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({
    message: 'Session refreshed',
  });
};

export const checkSession = async (req, res, next) => {
   const session = await Session.findOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    return next(createHttpError(401, 'Session token expired'));
  }

  await Session.deleteOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({
    message: 'Session refreshed',
  });
};

export const requestResetEmail = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      message: 'Password reset email sent successfully',
    });
  }

  const resetToken = jwt.sign(
    { sub: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const templatePath = path.resolve('src/templates/reset-password-email.html');
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset Your Password',
      html,
    });
  } catch {
    next(createHttpError(500, 'Failed to send the email, please try again later.'));
    return;
  }

  res.status(200).json({
    message: 'Password reset email sent successfully',
  });
};

export const resetPassword = async (req, res, next) => {
  const { password, token } = req.body;

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    next(createHttpError(401, 'Invalid or expired token'));
    return;
  }

  const user = await User.findOne({ _id: payload.sub, email: payload.email });

  if (!user) {
    next(createHttpError(404, 'User not found'));
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.updateOne(
    { _id: user._id },
    { password: hashedPassword },
  );

  await Session.deleteMany({ userId: user._id });

  res.status(200).json({
    message: 'Password reset successfully'
  });
};
