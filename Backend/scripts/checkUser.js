import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/userModel.js';

const checkUser = async () => {
    try {
        const mongoUrl = process.env.MONGO_DB_URL || process.env.MONGO_URI;
        await mongoose.connect(mongoUrl);
        const users = await User.find({});
        console.log('USERS_IN_DB:');
        users.forEach(u => {
            console.log(`- Email: "${u.email}", Name: "${u.name}", Role: "${u.role}", ID: ${u._id}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser();
