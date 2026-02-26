import mongoose from 'mongoose';

const connectDB = async () => {
    const mongoUrl = process.env.MONGO_DB_URL || process.env.MONGO_URI;

    if (!mongoUrl) {
        console.error('DB Connection Error: Missing MONGO_DB_URL (or MONGO_URI) in environment');
        process.exit(1);
    }

    try {
        const maskedUrl = mongoUrl.replace(/:([^@]+)@/, ':****@');
        console.log(`Attempting to connect to: ${maskedUrl}`);
        const conn = await mongoose.connect(mongoUrl);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`DB Connection Error: ${error.message}`);
        if (error.message.includes('whitelist')) {
            console.log('TIP: Try whitelisting 0.0.0.0/0 in Atlas as a test.');
        }
        process.exit(1);
    }
};

export default connectDB;
