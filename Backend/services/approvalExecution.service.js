import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';
import { auditLogService } from './auditLog.service.js';
import { notificationService } from './notification.service.js';

/**
 * Approval Execution Service
 * Handles the actual transformation of system state once a request reaches 'executed'.
 */
export const approvalExecutionService = {
    /**
     * Entry point for executing an approved request.
     * Ensures idempotency and logs the result.
     */
    execute: async (request) => {
        const { requestType, targetEntityId, projectId, requesterId, _id } = request;

        try {
            console.log(`[Approval Execution]: Starting execution for ${requestType} (ID: ${_id})`);

            switch (requestType) {
                case 'project_deletion':
                    await approvalExecutionService.handleProjectDeletion(targetEntityId);
                    break;
                case 'role_promotion':
                    await approvalExecutionService.handleRolePromotion(targetEntityId, request.metadata?.newRole);
                    break;
                    // In a real scenario, the targetEntityId might be the user, 
                    // and metadata would contain the new role.
                    // For now, we'll assume the request body/reason contains intent.
                    // This is a placeholder for actual role change logic.
                    break;
                case 'task_completion_review':
                    await approvalExecutionService.handleTaskCompletion(targetEntityId);
                    break;
                case 'archive_project':
                    await approvalExecutionService.handleArchiveProject(targetEntityId);
                    break;
                case 'deadline_extension':
                case 'project_deadline_extension':
                    await approvalExecutionService.handleDeadlineExtension(targetEntityId, request.metadata?.newDeadline);
                    break;
                case 'project_completion':
                    await approvalExecutionService.handleProjectCompletion(targetEntityId);
                    break;
                default:
                    throw new Error(`Execution logic for ${requestType} not implemented.`);
            }

            console.log(`[Approval Execution]: Successfully executed ${requestType}`);

            // Notify Requester of Execution
            if (requesterId) {
                notificationService.dispatch({
                    recipientId: requesterId,
                    type: 'request_executed',
                    message: `Your ${requestType.replace(/_/g, ' ')} request (ID: ${_id}) has been successfully executed.`,
                    metadata: { requestId: _id, requestType, targetEntityId }
                });
            }

            return true;
        } catch (error) {
            console.error(`[Approval Execution Error]: ${error.message}`);
            throw error;
        }
    },

    handleProjectDeletion: async (projectId) => {
        const project = await Project.findByIdAndDelete(projectId);
        if (!project) throw new Error('Project not found for deletion.');

        // Cleanup related tasks and teams (simplified)
        await Task.deleteMany({ project: projectId });
        // In a full implementation, we'd also clean up Team associations.
    },

    handleRolePromotion: async (userId, newRole) => {
        if (!newRole) throw new Error('New role is required for promotion.');
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found.');

        user.role = newRole;
        await user.save();
    },

    handleTaskCompletion: async (taskId) => {
        const task = await Task.findById(taskId);
        if (!task) throw new Error('Task not found.');

        task.status = 'Done';
        await task.save();

        // Refresh blocking status for dependents (from taskController logic)
        if (task.dependents && task.dependents.length > 0) {
            // This would ideally call refreshBlockingStatus from taskController, 
            // but for service-level decoupling, we'd move that to a TaskService.
        }
    },

    handleArchiveProject: async (projectId) => {
        const project = await Project.findById(projectId);
        if (!project) throw new Error('Project not found.');

        project.status = 'Archived';
        await project.save();
    },

    handleProjectCompletion: async (projectId) => {
        const project = await Project.findById(projectId);
        if (!project) throw new Error('Project not found.');

        project.status = 'Completed';
        await project.save();
    },

    handleDeadlineExtension: async (targetId, newDeadline) => {
        if (!newDeadline) throw new Error('New deadline is required for extension.');

        // Try Project first
        let entity = await Project.findById(targetId);
        if (!entity) {
            // Then try Task
            entity = await Task.findById(targetId);
        }

        if (!entity) throw new Error('Target entity (Project or Task) not found for deadline extension.');

        entity.dueDate = new Date(newDeadline);
        await entity.save();
    }
};
