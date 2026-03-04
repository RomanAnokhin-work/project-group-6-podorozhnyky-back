import { Request, Response, NextFunction } from 'express'

export const saMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // приклад перевірки токена
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' }) // тут json() є!
  }

  next() // продовжуємо маршрут
}