const mongoose = require("mongoose");

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });
        console.log("Connected successfully to MongoDB")
    }catch(err){
        console.log("mongoDB connection Failed:", err.message);
        // Don't exit the process, just log the error
        console.log("Retrying connection in 5 seconds...");
        setTimeout(connectDB, 5000);
    }
}

module.exports = connectDB;