import createHttpError from "http-errors";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import { createSession, setSessionCookies } from "../services/auth.js";

// Логін
export const loginUser = async (req, res) => {
  const { email, password, name } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

  const session = await createSession(user._id);
  setSessionCookies(res, session);

  res.json({ message: "Login successful", user: { _id: user._id, email: user.email, name: user.name } });
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
  res.status(201).json({
    message: "Registration successful",
    user: {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
    },
  });
};
