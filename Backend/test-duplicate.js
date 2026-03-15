import "dotenv/config";
import mongoose from "mongoose";
import Invitation from "./models/invitationModel.js";
import User from "./models/userModel.js";
import Project from "./models/projectModel.js";
import { hashToken, generateRawToken } from "./utils/tokenUtils.js";

async function testDuplicateInvite() {
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("Connected to MongoDB.");

    try {
        const adminUser = await User.findOne({role: "Admin"});
        const project = await Project.findOne();
        
        if (!adminUser || !project) {
            console.log("Missing admin or project data");
            return process.exit(1);
        }

        const rawToken = generateRawToken();
        const encryptedToken = hashToken(rawToken);

        console.log("Creating first invite...");
        await Invitation.create({
            email: "test.duplicate@example.com",
            name: "Test User",
            role: "Operative",
            projectId: project._id,
            invitedBy: adminUser._id,
            token: encryptedToken,
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
        });
        console.log("First invite created.");

        const rawToken2 = generateRawToken();
        const encryptedToken2 = hashToken(rawToken2);
        
        console.log("Creating second invite with same email/project/status...");
        await Invitation.create({
            email: "test.duplicate@example.com",
            name: "Test User",
            role: "Operative",
            projectId: project._id,
            invitedBy: adminUser._id,
            token: encryptedToken2,
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
        });
        console.log("Second invite created unexpectedly.");
    } catch (err) {
        console.error("Caught error:", err);
    } finally {
        await mongoose.disconnect();
    }
}
testDuplicateInvite();
