import express from "express";
import cors from "cors";
import hotelRoutes from "./routes/hotelRoutes.routes";
import bookingRoutes from "./routes/hotelBookingRoutes.route"
import userRegRoutes from "./routes/userRoutes.routes"
//V's_new_start
import cabBookingRoutes from "./routes/cabBookingRoutes.routes";
import reviewRoutes from "./routes/reviewRoutes.route";
//V's_new_end
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/users", userRegRoutes);
app.use("/api/hotel", hotelRoutes);
app.use("/api/bookings", bookingRoutes)
//V's_new_start
app.use("/api/cabs", cabBookingRoutes);
app.use("/api/reviews", reviewRoutes);
//V's_new_end


export default app;