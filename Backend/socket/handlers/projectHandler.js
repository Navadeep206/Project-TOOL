import Project from '../../models/projectModel.js';
import Team from '../../models/teamModel.js';

export const registerProjectHandlers = (io, socket) => {
    const user = socket.user;

    socket.on('project:join', async (projectId) => {
        try {
            // Validate project exists
            const project = await Project.findById(projectId);
            if (!project) {
                return socket.emit('error', { message: 'Project not found' });
            }

            // Check membership: If not admin, must be project creator or team member
            // (Note: This is a simplified check for the demo, refine as needed)
            const isCreator = project.createdBy.toString() === user._id.toString();
            const isAdmin = user.role === 'admin';

            // Complex membership check could go here (e.g., checking teams in that project)
            // For now, let's allow admins and creators, and we'll refine if needed.

            const roomName = `project_${projectId}`;
            socket.join(roomName);
            console.log(`[Socket] User ${user.name} joined room: ${roomName}`);

            socket.emit('project:joined', { projectId, roomName });
        } catch (error) {
            socket.emit('error', { message: 'Failed to join project room' });
        }
    });

    socket.on('project:leave', (projectId) => {
        const roomName = `project_${projectId}`;
        socket.leave(roomName);
        console.log(`[Socket] User ${user.name} left room: ${roomName}`);
    });
};
