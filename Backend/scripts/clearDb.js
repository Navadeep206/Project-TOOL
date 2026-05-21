import mongoose from 'mongoose';
import "dotenv/config";
import User from '../models/userModel.js';
import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import Team from '../models/teamModel.js';
import Invitation from '../models/invitationModel.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/notification.model.js';
import { Activity } from '../models/activity.model.js';
import { ApprovalRequest } from '../models/approval.model.js';

const clearDatabase = async () => {
    try {
        const mongoUrl = process.env.MONGO_DB_URL || process.env.MONGO_URI;
        if (!mongoUrl) {
            console.error('Error: MONGO_DB_URL not found in .env');
            process.exit(1);
        }

        console.log('Connecting to database...');
        await mongoose.connect(mongoUrl);
        console.log('Connected.');

        console.log('Clearing collections...');

        const results = await Promise.all([
            User.deleteMany({}),
            Project.deleteMany({}),
            Task.deleteMany({}),
            Team.deleteMany({}),
            Invitation.deleteMany({}),
            AuditLog.deleteMany({}),
            Notification.deleteMany({}),
            Activity.deleteMany({}),
            ApprovalRequest.deleteMany({})
        ]);

        console.log(`
            SUCCESS: Database Cleared.
            Results:
            - Users Deleted: ${results[0].deletedCount}
            - Projects Deleted: ${results[1].deletedCount}
            - Tasks Deleted: ${results[2].deletedCount}
            - Teams Deleted: ${results[3].deletedCount}
            - Invitations Deleted: ${results[4].deletedCount}
            - Audit Logs Deleted: ${results[5].deletedCount}
            - Notifications Deleted: ${results[6].deletedCount}
            - Activities Deleted: ${results[7].deletedCount}
            - Approvals Deleted: ${results[8].deletedCount}
        `);

        process.exit(0);
    } catch (error) {
        console.error('CRITICAL ERROR during database clearing:', error);
        process.exit(1);
    }
};

clearDatabase();
