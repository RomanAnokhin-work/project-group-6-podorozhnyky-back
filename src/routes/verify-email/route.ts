import { sendEmail } from '../../utils/sendMail';
import { connectMongoDB } from '../../db/connectMongoDB';
import { User } from '../../models/user';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Middleware для перевірки авторизації
export const saMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Route handler для PATCH
export const patchEmailHandler = async (req: Request, res: Response) => {
  try {
    // Підключення до MongoDB
    await connectMongoDB();

    // Отримуємо дані з тіла запиту
    const { userId, newEmail } = req.body;

    if (!userId || !newEmail) {
      return res.status(400).json({ error: 'userId або newEmail не вказано' });
    }

    // Генеруємо токен
    const token = crypto.randomBytes(32).toString('hex');

    // Зберігаємо новий email + токен
    const user = await User.findByIdAndUpdate(
      userId,
      {
        email: newEmail,
        emailVerified: false,
        emailVerificationToken: token,
        emailVerificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60), // 1 година
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    // Посилання для підтвердження
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${token}`;

    // Відправка листа
    await sendEmail({
      to: newEmail,
      subject: 'Підтвердження email',
      text: `Натисніть на посилання для підтвердження: ${verificationUrl}`,
      html: `<a href="${verificationUrl}">Підтвердити email</a>`,
    });

    return res.status(200).json({ message: 'Лист для підтвердження відправлено' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Сталася помилка на сервері' });
  }
};