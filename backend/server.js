import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import vendorRegisterRoutes from "./routes/vendorRegisterRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/vendor_registers", vendorRegisterRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
