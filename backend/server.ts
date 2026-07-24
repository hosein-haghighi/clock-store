import express from "express"
import userRouter from "./routes/userRouter.js";
import mongoose from "mongoose";
import configDotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRouter.js";
import cors from "cors"
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
    origin: true,
    credentials: true
}));
app.set("query parser", "extended")

configDotenv.config({ path: "./config.env" })
app.use("/api/v1/users", userRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/order", orderRouter)
app.use("/api/v1/cart", cartRouter)

mongoose
    .connect("mongodb://127.0.0.1:27017/clock-store")
    .then(() => console.log("db connected successfully!"));


const PORT = 4000
app.listen(PORT, "0.0.0.0", () => {
    console.log("server is running on the port: ", PORT)
})
