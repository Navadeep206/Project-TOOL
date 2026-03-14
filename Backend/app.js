import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import cookieParser from "cookie-parser";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';

// Environment Validation
const REQUIRED_ENV = ['MONGO_DB_URL', 'JWT_SECRET', 'PORT'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
    console.error(`\x1b[31m[FATAL] Missing required environment variables: ${missingEnv.join(', ')}\x1b[0m`);
    process.exit(1);
}
import userRoute from './routes/userRoute.js';
import projectRoute from './routes/projectRoute.js';
import taskRoute from './routes/taskRoute.js';
import teamRoute from './routes/teamRoute.js';
import adminRoute from './routes/adminRoute.js';
import invitationRoute from './routes/invitationRoute.js';
import chatRoute from './routes/chatRoute.js';
import { protect } from './middleware/authMiddleware.js';
import { authorizeRoles } from './middleware/roleMiddleware.js';
import { accessExpiryMiddleware } from './middleware/accessExpiryMiddleware.js';

// Import New Plugins
import activityRoutes from './routes/activity.routes.js';
import approvalRoutes from './routes/approval.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import accessRoutes from './routes/access.routes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import analyticsRoute from './routes/analyticsRoute.js';

import { ROLES } from './constants/roles.js';

console.log(`[Env Check] PORT: ${process.env.PORT}`);
console.log(`[Env Check] MONGO_DB_URL: ${process.env.MONGO_DB_URL ? 'PRESENT' : 'MISSING'}`);
console.log(`[Env Check] JWT_SECRET: ${process.env.JWT_SECRET ? 'PRESENT' : 'MISSING'}`);
console.log(`[Env Check] ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS ? 'PRESENT' : 'MISSING'}`);

const app = express();

// Enable trust proxy for Render (required for express-rate-limit)
app.set('trust proxy', 1);

// 1. Security Headers - Adjusted for React/Recharts compatibility
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. NoSQL Injection Protection - Handled by Zod Validation in routes
// (mongoSanitize removed due to Express 5 incompatibility)

// 3. Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." }
});
app.use('/api/', limiter);

// Request logger
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});

app.use(express.json());
app.use(cookieParser());
const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'https://projecttool-eo5y.vercel.app'];
const allowedOrigins = [...new Set([...envOrigins, ...defaultOrigins])];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            console.error(`[CORS Error] Origin ${origin} not allowed`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

connectDB();

app.use('/api/users', userRoute);
app.use('/api/projects', projectRoute);
app.use('/api/tasks', taskRoute);
app.use('/api/teams', teamRoute);
app.use('/api/admin', adminRoute);
app.use('/api/invitations', invitationRoute);
app.use('/api/chat', chatRoute);

// Mount Modular Plugins
// Apply global expiry middleware alongside protect to ensure Temp Access restrictions apply
app.use('/api/v1/activities', protect, accessExpiryMiddleware, activityRoutes);
app.use('/api/v1/approvals', protect, accessExpiryMiddleware, approvalRoutes);
app.use('/api/v1/notifications', protect, accessExpiryMiddleware, notificationRoutes);
// Access routes require Admin
app.use('/api/v1/access', protect, authorizeRoles(ROLES.ADMIN), accessRoutes);
// Audit Logs require Admin
app.use('/api/audit-logs', protect, authorizeRoles(ROLES.ADMIN), auditLogRoutes);

// Analytics
app.use('/api/analytics', protect, analyticsRoute);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'active', timestamp: new Date() });
});

// 404 Handler for unmatched API routes
app.use('/api', (req, res) => {
    console.warn(`[404 NOT FOUND] ${req.method} ${req.originalUrl} - No route matched`);
    res.status(404).json({
        success: false,
        message: `API Route Not Found: ${req.method} ${req.originalUrl}`
    });
});

// Centralized error handler MUST be the last middleware
app.use(errorHandler);

export default app;