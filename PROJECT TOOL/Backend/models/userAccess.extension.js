/**
 * Extension for the User Schema.
 * 
 * INSTRUCTIONS:
 * Do not replace your existing User model. Instead, merge these fields 
 * into your existing User Schema definition in your primary model file
 * (e.g., `Backend/models/user.model.js`).
 */

const userAccessExtension = {
    // Add to your existing schema object:
    accessType: {
        type: String,
        enum: ['permanent', 'temporary'],
        default: 'permanent',
        index: true // Recommended for cron job performance
    },
    accessExpiresAt: {
        type: Date,
        default: null,
        // When checking expiry, we will see if `accessExpiresAt < Date.now()`
    },
    grantedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    grantReason: {
        type: String,
        maxLength: 500,
        default: null
    },

    // Assuming your model already has a way to block/disable users. 
    // If not, add this:
    // isActive: {
    //   type: Boolean,
    //   default: true
    // }
};

export default userAccessExtension;
