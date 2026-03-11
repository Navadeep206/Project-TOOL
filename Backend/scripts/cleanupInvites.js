import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const InvitationSchema = new mongoose.Schema({
    status: String
});
const Invitation = mongoose.model('Invitation', InvitationSchema);

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log('Connected to MongoDB');

        const result = await Invitation.deleteMany({ status: 'pending' });
        console.log(`Deleted ${result.deletedCount} pending invitations.`);

        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

cleanup();
