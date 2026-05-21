import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/userModel.js';

const resetPassword = async () => {
    try {
        const mongoUrl = process.env.MONGO_DB_URL || process.env.MONGO_URI;
        await mongoose.connect(mongoUrl);

        const email = 'gudurunavadeep12@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User ${email} not found!`);
            process.exit(1);
        }

        user.password = 'Pass123!';
        await user.save();

        console.log(`Password for ${email} has been reset to: Pass123!`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

resetPassword();
