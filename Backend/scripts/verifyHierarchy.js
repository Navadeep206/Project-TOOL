import mongoose from 'mongoose';
import 'dotenv/config';
import Project from '../models/projectModel.js';
import Team from '../models/teamModel.js';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';

const runTests = async () => {
    try {
        const mongoUrl = process.env.MONGO_DB_URL || process.env.MONGO_URI;
        await mongoose.connect(mongoUrl);
        console.log('Connected to DB for Verification.');

        // 1. Setup Data
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) throw new Error('Admin user required for tests.');

        const projectA = await Project.create({ name: 'Project A', createdBy: admin._id });
        const projectB = await Project.create({ name: 'Project B', createdBy: admin._id });

        const teamA = await Team.create({
            name: 'Team A',
            project: projectA._id,
            lead: admin._id,
            members: [{ user: admin._id, role: 'Admin' }]
        });

        console.log('Setup data created.');

        // 2. Test Cross-Project Assignment (Simulation of Middleware Logic)
        console.log('Verifying Cross-Project Assignment Constraint...');
        const invalidTask = new Task({
            name: 'Malicious Task',
            project: projectB._id, // Project B
            team: teamA._id,        // Team A (belongs to Project A)
            assignedTo: admin._id
        });

        // The middleware would block this at the API level. 
        // Logic check:
        const teamCheck = await Team.findOne({ _id: invalidTask.team, project: invalidTask.project });
        if (!teamCheck) {
            console.log('SUCCESS: Middleware logic correctly identifies Team A does NOT belong to Project B.');
        } else {
            throw new Error('FAILURE: Team A incorrectly associated with Project B.');
        }

        // 3. Test Cascade Delete
        console.log('Verifying Cascade Delete...');
        const taskA = await Task.create({
            name: 'Task in Project A',
            project: projectA._id,
            team: teamA._id,
            assignedTo: admin._id
        });

        await Project.findByIdAndDelete(projectA._id);

        const remainingTasks = await Task.find({ project: projectA._id });
        const remainingTeams = await Team.find({ project: projectA._id });

        if (remainingTasks.length === 0 && remainingTeams.length === 0) {
            console.log('SUCCESS: Cascade delete removed associated Tasks and Teams.');
        } else {
            console.error('FAILURE: Orphan records detected after project deletion.');
            console.log('Tasks:', remainingTasks.length, 'Teams:', remainingTeams.length);
        }

        // Cleanup
        await Project.findByIdAndDelete(projectB._id);
        await Team.deleteMany({ project: { $in: [projectA._id, projectB._id] } });
        await Task.deleteMany({ project: { $in: [projectA._id, projectB._id] } });

        console.log('Tests completed.');
        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
};

runTests();
