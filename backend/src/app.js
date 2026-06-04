import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

import logger from './utils/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { ApiError } from './utils/apiHelpers.js';

import authRoutes       from './routes/auth.routes.js';
import userRoutes       from './routes/user.routes.js';
import courseRoutes     from './routes/course.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';
import { resultRouter, noticeRouter, routineRouter, dashboardRouter } from './routes/misc.routes.js';

dotenv.config();

const app = express();

// Security 
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.set('trust proxy', 1);

//  Body Parsing 
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//  Logging 
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
}

//  Rate Limiting 
app.use('/api', apiLimiter);

//  Health 
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

//  Routes 
const API = '/api';
app.use(`${API}/auth`,        authRoutes);
app.use(`${API}/users`,       userRoutes);
app.use(`${API}/courses`,     courseRoutes);
app.use(`${API}/attendance`,  attendanceRoutes);
app.use(`${API}/assignments`, assignmentRoutes);
app.use(`${API}/results`,     resultRouter);
app.use(`${API}/notices`,     noticeRouter);
app.use(`${API}/routines`,    routineRouter);
app.use(`${API}/dashboard`,   dashboardRouter);

//  404 
app.use((_req, _res, next) => next(new ApiError(404, 'Route not found.')));

//  Global Error Handler 
app.use(errorHandler);

export default app;
