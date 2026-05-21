import { authMiddleware } from './middleware/auth.js';
import { registerProjectHandlers } from './handlers/projectHandler.js';
import { registerTaskHandlers } from './handlers/taskHandler.js';
import { registerPresenceHandlers } from './handlers/presenceHandler.js';
import { registerPrivateChatHandlers } from './handlers/privateChatHandler.js';

export const initSocket = (io) => {
    // Auth Middleware
    io.use(authMiddleware);

    io.on('connection', (socket) => {
        const user = socket.user;
        console.log(`[Socket] Operative ${user.name} established connection: ${socket.id}`);

        // Register Modular Handlers
        registerProjectHandlers(io, socket);
        registerTaskHandlers(io, socket);
        registerPresenceHandlers(io, socket);
        registerPrivateChatHandlers(io, socket);

        socket.on('disconnect', () => {
            console.log(`[Socket] Connection severed for operative ${user.name}: ${socket.id}`);
        });
    });
};
