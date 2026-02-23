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

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

connectDB();

app.use('/api/users', userRoute);
app.use('/api/projects', projectRoute);
app.use('/api/tasks', taskRoute);
app.use('/api/teams', teamRoute);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Centralized error handler MUST be the last middleware
app.use(errorHandler);

export default app;