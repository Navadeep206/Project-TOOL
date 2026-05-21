import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/userModel.js';

const resetPassword = async () => {
    try {
        const mongoUrl = process.env.MONGO_DB_URL || process.env.MONGO_URI;
        await mongoose.connect(mongoUrl);
        console.log('Connected to DB...');

        const email = 'gudurunavadeep12@gmail.com';
        const newPassword = 'admin123';

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.password = newPassword; // The pre-save hook will hash this
        await user.save();

        console.log(`Password reset successfully for ${email}`);
        console.log('New Password: admin123');
        process.exit(0);
    } catch (err) {
        console.error('Reset failed:', err);
        process.exit(1);
    }
};

resetPassword();
