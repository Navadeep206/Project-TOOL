export const registerTaskHandlers = (io, socket) => {
    const user = socket.user;

    socket.on('task:update', (data) => {
        const { projectId, task } = data;
        const roomName = `project_${projectId}`;

        // Broadcast to everyone in the project room EXCEPT the sender
        socket.to(roomName).emit('task:updated', {
            task,
            updatedBy: { id: user._id, name: user.name }
        });
    });

    socket.on('task:assign', (data) => {
        const { projectId, task, assignedToId } = data;
        const roomName = `project_${projectId}`;

        socket.to(roomName).emit('task:assigned', {
            task,
            assignedBy: { id: user._id, name: user.name }
        });
    });
};
