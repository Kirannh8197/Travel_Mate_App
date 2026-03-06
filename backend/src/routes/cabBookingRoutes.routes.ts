//V's_new_start
import { Router, Request, Response } from "express";
import { findNearbyCabs, bookCab, getCabRidesByUser } from "../services/cabBooking.service";

const router = Router();

/**
 * Get Nearby Cabs
 * GET /api/v1/cabs/nearby?lng=77.59&lat=12.97&maxDistance=10000
 */
router.get("/nearby", async (req: Request, res: Response) => {
    try {
        const { lng, lat, maxDistance } = req.query;

        if (!lng || !lat) {
            return res.status(400).json({ message: "Longitude (lng) and Latitude (lat) are required." });
        }

        const cabs = await findNearbyCabs(
            parseFloat(lng as string),
            parseFloat(lat as string),
            maxDistance ? parseFloat(maxDistance as string) : 10000
        );

        res.status(200).json(cabs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Book a Cab
 * POST /api/v1/cabs/book
 */
router.post("/book", async (req: Request, res: Response) => {
    try {
        const { userId, pickupLng, pickupLat, dropoffLng, dropoffLat, distanceKm } = req.body;

        if (!userId || pickupLng === undefined || pickupLat === undefined || dropoffLng === undefined || dropoffLat === undefined || !distanceKm) {
            return res.status(400).json({ message: "userId, pickupLng, pickupLat, dropoffLng, dropoffLat, and distanceKm are required." });
        }

        const cabRide = await bookCab(
            userId,
            parseFloat(pickupLng),
            parseFloat(pickupLat),
            parseFloat(dropoffLng),
            parseFloat(dropoffLat),
            parseFloat(distanceKm)
        );

        res.status(201).json(cabRide);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * Get User's Cab Rides
 * GET /api/v1/cabs/user/:userId
 */
router.get("/user/:userId", async (req: Request<{ userId: string }>, res: Response) => {
    try {
        const { userId } = req.params;
        const rides = await getCabRidesByUser(userId);
        res.status(200).json(rides);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
//V's_new_end
