import mongoose from 'mongoose';

const dbUrl = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/TravelMate";

const connectDb = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log("connected to database");
    } catch (err: any) {
        console.error("connection failed:", err.message);
    }
}

export default connectDb;