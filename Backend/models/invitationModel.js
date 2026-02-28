import mongoose from 'mongoose';
import { ROLES } from '../constants/roles.js';

const invitationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    name: {
        type: String,
        trim: true,
        default: null
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.MEMBER
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'joined', 'rejected', 'expired'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Compound index to prevent multiple active invites to the same email for same project
invitationSchema.index({ email: 1, projectId: 1, status: 1 }, {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'accepted'] } }
});

const Invitation = mongoose.model('Invitation', invitationSchema);
export default Invitation;
