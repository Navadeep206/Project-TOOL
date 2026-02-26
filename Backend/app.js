import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import cookieParser from "cookie-parser";
import userRoute from './routes/userRoute.js';
import projectRoute from './routes/projectRoute.js';
import taskRoute from './routes/taskRoute.js';
import teamRoute from './routes/teamRoute.js';
import { errorHandler } from './middleware/errorHandler.js';
import { protect } from './middleware/authMiddleware.js';
import { authorizeRoles } from './middleware/roleMiddleware.js';
import { accessExpiryMiddleware } from './middleware/accessExpiryMiddleware.js';

// Import New Plugins
import activityRoutes from './routes/activity.routes.js';
import approvalRoutes from './routes/approval.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import accessRoutes from './routes/access.routes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';

import { ROLES } from './constants/roles.js';

console.log(`[Env Check] PORT: ${process.env.PORT}`);
console.log(`[Env Check] MONGO_DB_URL: ${process.env.MONGO_DB_URL ? 'PRESENT' : 'MISSING'}`);
console.log(`[Env Check] JWT_SECRET: ${process.env.JWT_SECRET ? 'PRESENT' : 'MISSING'}`);
console.log(`[Env Check] ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS ? 'PRESENT' : 'MISSING'}`);

const app = express();

// Request logger
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
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

// Mount Modular Plugins
// Apply global expiry middleware alongside protect to ensure Temp Access restrictions apply
app.use('/api/v1/activities', protect, accessExpiryMiddleware, activityRoutes);
app.use('/api/v1/approvals', protect, accessExpiryMiddleware, approvalRoutes);
app.use('/api/v1/notifications', protect, accessExpiryMiddleware, notificationRoutes);
// Access routes require Admin
app.use('/api/v1/access', protect, authorizeRoles(ROLES.ADMIN), accessRoutes);
// Audit Logs require Admin
app.use('/api/audit-logs', protect, authorizeRoles(ROLES.ADMIN), auditLogRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Centralized error handler MUST be the last middleware
app.use(errorHandler);

export default app;