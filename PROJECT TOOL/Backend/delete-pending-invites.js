import "dotenv/config";
import mongoose from "mongoose";
import Invitation from "./models/invitationModel.js";

async function deletePendingInvitations() {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("Connected to MongoDB.");

        const result = await Invitation.deleteMany({ status: 'pending' });
        console.log(`Successfully deleted ${result.deletedCount} pending invitations.`);
    } catch (err) {
        console.error("Caught error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

deletePendingInvitations();
