import express from "express";
import path from "path";
import cors from "cors";
import hotelRoutes from "./routes/hotelRoutes.routes";
import bookingRoutes from "./routes/hotelBookingRoutes.route"
import userRegRoutes from "./routes/userRoutes.routes"
import authRoutes from "./routes/authRoutes.routes"
//V's_new_start
import cabBookingRoutes from "./routes/cabBookingRoutes.routes";
import reviewRoutes from "./routes/reviewRoutes.route";
//V's_new_end
const app = express();

app.use(express.json());
app.use(cors());

// Serve uploaded hotel images statically
// __dirname in ts-node = backend/src, so ../uploads = backend/uploads where multer saves files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRegRoutes);
app.use("/api/hotel", hotelRoutes);
app.use("/api/bookings", bookingRoutes)
//V's_new_start
app.use("/api/cabs", cabBookingRoutes);
app.use("/api/reviews", reviewRoutes);
//V's_new_end


export default app;