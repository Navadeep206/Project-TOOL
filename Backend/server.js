import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { initSocket } from './socket/index.js';
import './jobs/accessCleanup.js'; // Start Temp Access Cleanup Cron Job
import { initCleanupJob } from './jobs/cleanupInvites.js';

// Initialize Invitation Cleanup
initCleanupJob();

const PORT = process.env.PORT || 5050;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:5173', 'http://localhost:5174'],
        credentials: true
    }
});

// Initialize Socket Layer
initSocket(io);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});