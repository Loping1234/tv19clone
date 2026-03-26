import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/newsTV19";

// ============================================================
//  MONGODB CONNECTION OPTIONS (P1 Performance)
// ============================================================
const mongoOptions = {
    // Connection pooling
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,

    // Timeout settings
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,

    // Heartbeat for connection monitoring
    heartbeatFrequencyMS: 10000,

    // Retry reads/writes on transient errors
    retryReads: true,
    retryWrites: true,
};

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, mongoOptions);
        console.log("✅ MongoDB connected:", MONGO_URI);

        // Handle connection events
        mongoose.connection.on("error", (err) => {
            console.error("❌ MongoDB connection error:", err.message);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("⚠️  MongoDB disconnected");
        });

        // Graceful shutdown handler
        process.on("SIGINT", async () => {
            console.log("🔄 Shutting down MongoDB connection...");
            await mongoose.connection.close();
            console.log("✅ MongoDB connection closed");
            process.exit(0);
        });

    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    }
}

export default connectDB;
