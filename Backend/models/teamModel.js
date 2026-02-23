import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' }
});

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Operational', 'Standby', 'Inactive'], default: 'Operational' },
    members: [memberSchema]
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
