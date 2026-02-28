// Basic in-memory presence tracking
// For production, use Redis or MongoDB for persistence/scalability
const roomPresence = new Map();

export const registerPresenceHandlers = (io, socket) => {
    const user = socket.user;

    socket.on('project:join', (projectId) => {
        const roomName = `project_${projectId}`;

        if (!roomPresence.has(roomName)) {
            roomPresence.set(roomName, new Set());
        }

        const presence = roomPresence.get(roomName);
        presence.add(user._id.toString());

        // Broadcast updated presence list to room
        io.to(roomName).emit('presence:update', {
            projectId,
            onlineUsers: Array.from(presence)
        });
    });

    // Cleanup on disconnect or manual leave
    const handleLeave = () => {
        // Iterate through all rooms the socket was in
        for (const roomName of socket.rooms) {
            if (roomName.startsWith('project_')) {
                const projectId = roomName.split('_')[1];
                const presence = roomPresence.get(roomName);
                if (presence) {
                    presence.delete(user._id.toString());
                    io.to(roomName).emit('presence:update', {
                        projectId,
                        onlineUsers: Array.from(presence)
                    });
                }
            }
        }
    };

    socket.on('disconnecting', handleLeave);
    socket.on('project:leave', handleLeave);
};
