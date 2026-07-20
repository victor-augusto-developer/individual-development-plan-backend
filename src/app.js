import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import tokenRoutes from "./routes/tokenRoutes.js"

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());


app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/api", tokenRoutes);

export default app;