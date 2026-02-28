import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    displayName: { type: String, trim: true },
    name: { type: String, trim: true },
    role: { type: String, required: true },
    status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' }
});

memberSchema.pre('validate', function () {
    // Backward compatibility for older payloads/docs that used `name`
    if (!this.displayName && this.name) {
        this.displayName = this.name;
    }

    const hasUser = Boolean(this.user);
    const hasDisplayName = Boolean(this.displayName && this.displayName.trim());

    if (!hasUser && !hasDisplayName) {
        throw new Error('Each team member must include either a user reference or a display name.');
    }
});

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['Operational', 'Standby', 'Inactive'], default: 'Operational' },
    members: [memberSchema]
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
