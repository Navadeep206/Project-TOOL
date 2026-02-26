import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/roles.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.MEMBER
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    // --- TEMPORARY ACCESS SYSTEM FIELDS ---
    accessType: {
        type: String,
        enum: ['permanent', 'temporary'],
        default: 'permanent',
        index: true
    },
    accessExpiresAt: {
        type: Date,
        default: null
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
    }
}, {
    timestamps: true
});

// Index for faster queries
userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Exporting as default and named User for consistency
const User = mongoose.model('User', userSchema);
export default User;