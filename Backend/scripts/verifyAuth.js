import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

const verifyAuth = async () => {
    try {
        const mongoUrl = process.env.MONGO_DB_URL || process.env.MONGO_URI;
        await mongoose.connect(mongoUrl);

        const email = 'gudurunavadeep12@gmail.com';
        const rawPassword = 'Pass123!';

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User ${email} not found!`);
            process.exit(1);
        }

        console.log(`User found: ${user.email}`);
        console.log(`Stored Hash: ${user.password}`);

        const isMatch = await user.matchPassword(rawPassword);
        console.log(`matchPassword result: ${isMatch}`);

        const manualMatch = await bcrypt.compare(rawPassword, user.password);
        console.log(`Manual bcrypt.compare result: ${manualMatch}`);

        process.exit(0);
    } catch (err) {
        console.error('Test Error:', err);
        process.exit(1);
    }
}

verifyAuth();
