import mongoose from "mongoose";
import Task from "./taskModel.js";
import Team from "./teamModel.js";
import { Activity } from "./activity.model.js";
import { ApprovalRequest } from "./approval.model.js";
import { Notification } from "./notification.model.js";

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Planning', 'In Progress', 'Done', 'Completed'], default: 'Planning', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    dueDate: { type: Date }
}, { timestamps: true });

// Cleanup Tasks when a Project is deleted to prevent orphan records
projectSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        const projectIdString = doc._id.toString();
        await Promise.all([
            Task.deleteMany({ project: doc._id }),
            Team.deleteMany({ project: doc._id }),
            Activity.deleteMany({ projectId: doc._id }),
            ApprovalRequest.deleteMany({ projectId: doc._id }),
            // Notifications don't have a direct projectId but often store it in metadata
            Notification.deleteMany({ "metadata.projectId": projectIdString })
        ]);
    }
});

export default mongoose.model('Project', projectSchema);
