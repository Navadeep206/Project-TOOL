import mongoose from 'mongoose';
import 'dotenv/config';
import Team from '../models/teamModel.js';
import Project from '../models/projectModel.js';

const migrateTeams = async () => {
    try {
        const mongoUrl = process.env.MONGO_DB_URL || process.env.MONGO_URI;
        await mongoose.connect(mongoUrl);

        const orphanedTeams = await Team.find({ project: { $exists: false } });
        if (orphanedTeams.length === 0) {
            console.log('No orphaned teams found.');
            process.exit(0);
        }

        const project = await Project.findOne();
        if (!project) {
            console.warn('No projects found to link teams to. Please create a project first.');
            process.exit(0);
        }

        console.log(`Linking ${orphanedTeams.length} teams to Project: ${project.name} (${project._id})`);

        for (const team of orphanedTeams) {
            team.project = project._id;
            await team.save();
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrateTeams();
