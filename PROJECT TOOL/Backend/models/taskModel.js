import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Pending', 'In Progress', 'Done'], default: 'Pending', index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    assignedToName: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', index: true }],
    dependents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', index: true }],
    isBlocked: { type: Boolean, default: false, index: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium', index: true },
    startDate: { type: Date, default: Date.now, index: true },
    dueDate: { type: Date, default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000), index: true }
}, { timestamps: true });

// Pre-save middleware to automatically calculate isBlocked could be complex across documents.
// Better to handle in controller for data integrity and explicit control.

export default mongoose.model('Task', taskSchema);
