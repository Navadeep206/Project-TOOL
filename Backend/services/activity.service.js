import { Activity } from '../models/activity.model.js';

export const activityService = {
    /**
     * Smart Message Generator
     * Converts raw data payload into a human-readable format.
     * 
     * @param {Object} data Contextual data for generation
     * @returns {String} Formatted message
     */
    generateMessage: (data) => {
        const { userName, actionType, entityType, entityName, property, newStatus } = data;

        // Default basic sentence
        let message = `${userName} performed a ${actionType} action on ${entityType}`;

        switch (actionType) {
            case 'create':
                message = `${userName} created the ${entityType} '${entityName || 'Item'}'`;
                break;
            case 'update':
                if (property && property.toLowerCase() === 'status') {
                    message = `${userName} updated the status of ${entityType} '${entityName}' to '${newStatus}'`;
                } else {
                    message = `${userName} updated the ${entityType} '${entityName || 'Item'}'`;
                }
                break;
            case 'delete':
                message = `${userName} deleted the ${entityType} '${entityName || 'Item'}'`;
                break;
            case 'assign':
                message = `${userName} assigned the ${entityType} '${entityName}'`;
                break;
            case 'comment':
                message = `${userName} left a comment on the ${entityType} '${entityName}'`;
                break;
            case 'status':
                message = `${userName} changed the ${entityType} status to '${newStatus}'`;
                break;
        }

        return message;
    },

    /**
     * Asynchronously logs an activity without blocking the main event loop.
     * Safely captures errors gracefully without throwing to the caller.
     * 
     * @param {Object} payload Activity data
     */
    logActivity: async (payload) => {
        // Non-blocking approach: Process heavily in the background
        setImmediate(async () => {
            try {
                const message = payload.message || activityService.generateMessage({
                    userName: payload.userName,
                    actionType: payload.actionType,
                    entityType: payload.entityType,
                    entityName: payload.entityName, // Used for message generator, not stored
                    property: payload.property, // Used for message generator
                    newStatus: payload.newValue?.status || payload.newValue,
                });

                // Omit utility fields intended only for the message generator
                const { entityName, property, ...validPayload } = payload;

                await Activity.create({
                    ...validPayload,
                    message,
                });
                // Console log for debug purposes only if running locally
                // console.log(`[Activity Logged]: ${message}`); 
            } catch (error) {
                // Graceful error handling - avoid crashing the app
                console.error('[Activity Service Error] Failed to log activity:', error.message);
            }
        });
    },

    /**
     * Log multiple activities at once.
     * Useful for bulk operations (e.g., bulk assignment).
     * 
     * @param {Array<Object>} payloads Array of activity data
     */
    logBulkActivities: async (payloads) => {
        setImmediate(async () => {
            try {
                const structuredPayloads = payloads.map((payload) => {
                    const message = payload.message || activityService.generateMessage({
                        userName: payload.userName,
                        actionType: payload.actionType,
                        entityType: payload.entityType,
                        entityName: payload.entityName,
                        property: payload.property,
                        newStatus: payload.newValue?.status || payload.newValue,
                    });

                    const { entityName, property, ...validPayload } = payload;
                    return { ...validPayload, message };
                });

                await Activity.insertMany(structuredPayloads, { ordered: false }); // Avoid Failing entire batch on single error
            } catch (error) {
                console.error('[Activity Service Error] Failed bulk logging activities:', error.message);
            }
        });
    }
};
