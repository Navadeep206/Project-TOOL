import mongoose from "mongoose";
import Task from "./taskModel.js";
import Team from "./teamModel.js";

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Planning', 'In Progress', 'Done', 'Completed'], default: 'Planning' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date }
}, { timestamps: true });

// Cleanup Tasks when a Project is deleted to prevent orphan records
projectSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Task.deleteMany({ project: doc._id });
        await Team.deleteMany({ project: doc._id });
    }
});

export default mongoose.model('Project', projectSchema);
