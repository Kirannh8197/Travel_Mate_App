//V's_new_start
import { Types } from "mongoose";
import { CabRide } from "../models/cabBookingSchema.model";
import { User } from "../models/userSchema.model";

/**
 * Find nearby simulated cabs or service availability
 * In a real app we'd query driver locations. Here we query past rides or simulated hubs.
 */
export const findNearbyCabs = async (lng: number, lat: number, maxDistance: number = 10000) => {
    // Demonstration query: find recent cab rides near this location to approximate "cab availability"
    const cabs = await CabRide.find({
        pickupLocation: {
            $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: maxDistance
            }
        }
    }).sort({ createdAt: -1 }).limit(10);

    return cabs;
};

/**
 * Book a Cab Ride
 */
export const bookCab = async (
    userId: string,
    pickupLng: number,
    pickupLat: number,
    dropoffLng: number,
    dropoffLat: number,
    distanceKm: number
) => {
    // Validate User ID
    let userObjectId: Types.ObjectId;
    if (Types.ObjectId.isValid(userId)) {
        userObjectId = new Types.ObjectId(userId);
    } else {
        // Check if it's the custom numeric userId
        const numericUserId = parseInt(userId, 10);
        if (isNaN(numericUserId)) {
            throw new Error(`Invalid userId format: ${userId}`);
        }
        const userRecord = await User.findOne({ userId: numericUserId });
        if (!userRecord) {
            throw new Error(`User with ID ${userId} not found`);
        }
        userObjectId = userRecord._id as Types.ObjectId;
    }

    // Create Cab Ride (pre-save hook will calculate totalFare)
    const cabRide = await CabRide.create({
        user: userObjectId,
        pickupLocation: {
            type: "Point" as "Point",
            coordinates: [pickupLng, pickupLat]
        },
        dropoffLocation: {
            type: "Point" as "Point",
            coordinates: [dropoffLng, dropoffLat]
        },
        distanceKm: distanceKm,
        status: "BOOKED" as "BOOKED"
        // ratePerKm uses the default (15) unless otherwise specified
    });

    return cabRide;
};

/**
 * Get Cab Rides by User
 */
export const getCabRidesByUser = async (userId: string) => {
    let userObjectId: Types.ObjectId;
    if (Types.ObjectId.isValid(userId)) {
        userObjectId = new Types.ObjectId(userId);
    } else {
        const numericUserId = parseInt(userId, 10);
        if (isNaN(numericUserId)) {
            throw new Error(`Invalid userId format: ${userId}`);
        }
        const userRecord = await User.findOne({ userId: numericUserId });
        if (!userRecord) {
            throw new Error(`User with ID ${userId} not found`);
        }
        userObjectId = userRecord._id as Types.ObjectId;
    }

    return await CabRide.find({ user: userObjectId }).sort({ createdAt: -1 });
};
//V's_new_end
