import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

import express from "express";
import userRouter from "./routes/userRouter.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRouter.js";
import cors from "cors";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";
import path from "path";
import cartRouter from "./routes/cartRouter.js";

const app = express();

app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"))
);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    // origin: ["https://amir-watch.vercel.app"],
    origin: true,
    credentials: true
}));
app.set("query parser", "extended");

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/cart", cartRouter);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
}

mongoose
    .connect("mongodb://127.0.0.1:27017/clock-store")
    .then(() => console.log("db connected successfully!"))
    .catch((err) => console.error("db connection error:", err));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(PORT, () => {
    console.log("server is running on the port:", PORT);
});