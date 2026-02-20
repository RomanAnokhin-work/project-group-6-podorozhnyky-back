import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectMongoDB } from './db/connectMongoDB.js';
import { errors } from 'celebrate';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';

import storiesRoutes from './routes/storiesRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middleware
app.use(logger);
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use(storiesRoutes);
app.use(usersRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

// Connect to MongoDB
console.log('Current working directory =', process.cwd());
console.log('MONGO_URL =', process.env.MONGO_URL);
await connectMongoDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});