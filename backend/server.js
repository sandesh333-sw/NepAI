import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chartRoutes from "./routes/chat.js";


const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

app.use("/api", chartRoutes);

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Db connected");
    } catch (error) {
        console.log("Failed to connect ",error);
    }
}

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
    connectDB();
});



