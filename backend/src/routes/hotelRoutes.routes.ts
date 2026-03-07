import express, { Request, Response } from 'express';
import * as hotelService from '../services/hotel.service';
import { authorizeRole } from '../middleware/role.middleware'; // Keep this if you use it
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// POST - Register a new hotel with image upload
router.post("/register", (req: Request, res: Response) => {
    upload.array('images', 10)(req, res, async (err) => {
        if (err) {
            // Catch multer file size limits or other strict bounds and prevent 500 crash
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        }

        try {
            const hotelData = { ...req.body };

            // Parse stringified JSON fields from FormData
            if (typeof hotelData.address === 'string') hotelData.address = JSON.parse(hotelData.address);
            if (typeof hotelData.location === 'string') hotelData.location = JSON.parse(hotelData.location);
            if (typeof hotelData.amenities === 'string') hotelData.amenities = JSON.parse(hotelData.amenities);

            // Map uploaded files to relative URLs for static serving via /uploads
            if (req.files && Array.isArray(req.files)) {
                const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
                hotelData.images = imageUrls;
            }

            const createdHotel = await hotelService.createHotel(hotelData);
            res.status(201).json({ message: "Hotel registered successfully", data: createdHotel });
        } catch (err: any) {
            if (err.code === 11000) {
                return res.status(400).json({ message: "A hotel with this hotelId or email already exists." });
            }
            res.status(500).json({ message: err.message });
        }
    });
});

// POST - Login for Hotel Owners
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const hotel = await hotelService.loginHotel(email, password);

        // Note: In a real app, you would generate and return a JWT token here
        res.status(200).json({ message: "Login successful", data: hotel });
    } catch (error: any) {
        if (error.message === "Invalid credentials" || error.message === "Email and password are required") {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});

// GET - All Hotels (Admin - all statuses)
router.get("/", authorizeRole(["ADMIN"]), async (req: Request, res: Response) => {
    try {
        const hotels = await hotelService.getAllHotelsAdmin();
        res.status(200).json({ data: hotels });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// GET - All Approved Hotels (public, no auth required)
router.get("/approved", async (req: Request, res: Response) => {
    try {
        const { maxPrice, amenities } = req.query;
        const query: any = { status: 'APPROVED' };
        if (maxPrice) query.pricePerNight = { $lte: parseFloat(maxPrice as string) };
        if (amenities) query.amenities = { $all: (amenities as string).split(',').map(a => a.trim()) };
        const hotels = await hotelService.Hotel.find(query).select('-password');
        res.status(200).json({ count: hotels.length, data: hotels });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// GET - Hotels near a location with advanced filtering
router.get("/nearby", async (req: Request, res: Response) => {
    try {
        const lng = parseFloat(req.query.lng as string);
        const lat = parseFloat(req.query.lat as string);
        const distance = req.query.distance ? parseInt(req.query.distance as string) : 10000;

        // Parse advanced filters
        const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
        const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;

        let amenities: string[] = [];
        if (req.query.amenities) {
            // Assume comma-separated amenities e.g., 'WiFi,Pool,Gym'
            amenities = (req.query.amenities as string).split(',').map(a => a.trim());
        }

        const options = { minPrice, maxPrice, amenities };

        if (isNaN(lng) || isNaN(lat)) {
            return res.status(400).json({ message: "Valid longitude (lng) and latitude (lat) are required." });
        }

        const hotels = await hotelService.getHotelsNearLocation(lng, lat, distance, options);
        res.status(200).json({ count: hotels.length, data: hotels });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// GET - Single Hotel by custom hotelId
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.id);
        const hotel = await hotelService.getHotelByHotelId(hotelId);
        res.status(200).json({ data: hotel });
    } catch (error: any) {
        if (error.message === "Hotel not found" || error.message === "Invalid Hotel ID") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});

// PUT - Update a hotel by custom hotelId
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.id);
        const updatedHotel = await hotelService.updateHotelByHotelId(hotelId, req.body);
        res.status(200).json({ message: "Hotel updated successfully", data: updatedHotel });
    } catch (err: any) {
        if (err.message === "Hotel not found" || err.message === "Invalid Hotel ID") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: err.message });
    }
});

// DELETE - Remove a hotel by custom hotelId
// PATCH - Host Edit Hotel (details + optional new images)
// Accepts EITHER numeric hotelId OR MongoDB _id in :id param
router.patch("/:id/edit", (req: Request, res: Response) => {
    upload.array('images', 10)(req, res, async (err) => {
        if (err) return res.status(400).json({ message: `Upload error: ${err.message}` });
        try {
            const idParam = req.params.id;
            const updates: any = {};
            if (req.body.name) updates.name = req.body.name;
            if (req.body.description) updates.description = req.body.description;
            if (req.body.pricePerNight) updates.pricePerNight = parseFloat(req.body.pricePerNight);
            if (req.body.amenities) {
                updates.amenities = typeof req.body.amenities === 'string'
                    ? JSON.parse(req.body.amenities) : req.body.amenities;
            }
            if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                updates.images = req.files.map((file: any) => `/uploads/${file.filename}`);
            }

            let updated;
            // Check if it's a valid MongoDB ObjectId
            const { Types } = require('mongoose');
            if (Types.ObjectId.isValid(idParam)) {
                updated = await hotelService.Hotel.findByIdAndUpdate(idParam, { $set: updates }, { new: true });
            } else {
                const hotelId = Number(idParam);
                if (isNaN(hotelId)) return res.status(400).json({ message: 'Invalid hotel ID' });
                updated = await hotelService.Hotel.findOneAndUpdate({ hotelId }, { $set: updates }, { new: true });
            }
            if (!updated) return res.status(404).json({ message: 'Hotel not found' });
            res.status(200).json({ message: 'Hotel updated successfully', data: updated });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });
});


router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.id);
        await hotelService.deleteHotelByHotelId(hotelId);
        res.status(200).json({ message: "Hotel deleted successfully" });
    } catch (error: any) {
        if (error.message === "Hotel not found" || error.message === "Invalid Hotel ID") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});


// PATCH - Admin Approve Hotel
router.patch("/:id/approve", authorizeRole(["ADMIN"]), async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.id);
        const updatedHotel = await hotelService.updateHotelStatus(hotelId, 'APPROVED');
        res.status(200).json({ message: "Hotel approved successfully", data: updatedHotel });
    } catch (error: any) {
        if (error.message === "Hotel not found" || error.message === "Invalid Hotel ID") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});

// PATCH - Admin Reject Hotel
router.patch("/:id/reject", authorizeRole(["ADMIN"]), async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.id);
        const updatedHotel = await hotelService.updateHotelStatus(hotelId, 'REJECTED');
        res.status(200).json({ message: "Hotel rejected successfully", data: updatedHotel });
    } catch (error: any) {
        if (error.message === "Hotel not found" || error.message === "Invalid Hotel ID") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
});

export default router;