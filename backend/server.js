import multer from "multer";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import vendorAuthRoutes from "./routes/vendorAuthRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import mongoose from "mongoose";

dotenv.config();
connectDB();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/vendor/auth", vendorAuthRoutes);
app.use("/api/vendor", vendorRoutes);

app.use("/api/services", serviceRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

app.use(errorHandler);

mongoose
  .connect("mongodb://localhost:27017/liftlink")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

app.put("/api/vendor/profile/:id", upload.single("logo"), async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const {
      fullname,
      companyName,
      companyType,
      location,
      contact,
      email,
      companyRegistrationNumber,
      description,
      services,
    } = req.body;

    vendor.fullname = fullname || vendor.fullname;
    vendor.companyName = companyName || vendor.companyName;
    vendor.companyType = companyType || vendor.companyType;
    vendor.location = location || vendor.location;
    vendor.contact = contact || vendor.contact;
    vendor.email = email || vendor.email;
    vendor.companyRegistrationNumber = companyRegistrationNumber || vendor.companyRegistrationNumber;
    vendor.description = description || vendor.description;
    vendor.services = services ? JSON.parse(services) : vendor.services;

    if (req.file) {
      vendor.logo = req.file.filename;
    }

    await vendor.save();
    res.json({ message: "Profile updated successfully!", vendor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating profile" });
  }
});
