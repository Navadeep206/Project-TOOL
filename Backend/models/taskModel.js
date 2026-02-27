import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Pending', 'In Progress', 'Done'], default: 'Pending' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedToName: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
