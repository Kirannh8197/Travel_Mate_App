import express, { Request, Response } from 'express';
import { User } from '../models/userSchema.model';
import { Hotel } from '../models/hotelSchema.model';
import bcrypt from 'bcryptjs';

const router = express.Router();

/**
 * UNIFIED LOGIN
 * We check if the email belongs to a User first. 
 * If not, we check if it belongs to a Hotel (Host).
 * If neither, or password mismatch, return 401.
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // 1. Check if it's a Hotel Host (Prioritize this if there's a conflict)
        const hotel = await Hotel.findOne({ email });
        if (hotel) {
            const isMatch = await bcrypt.compare(password, hotel.password);
            if (isMatch) {
                const { password: _, ...hotelWithoutPassword } = hotel.toObject();
                return res.status(200).json({
                    message: "Login successful",
                    data: hotelWithoutPassword,
                    role: "HOTEL_HOST"
                });
            }
            // If email matches but password doesn't, we FALL THROUGH to check User 
            // in case they have a different account or we want to be safe.
        }

        // 2. Check if it's a User (USER or ADMIN)
        const user = await User.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

            const { password: _, ...userWithoutPassword } = user.toObject();
            return res.status(200).json({
                message: "Login successful",
                data: userWithoutPassword,
                role: user.role 
            });
        }

        return res.status(401).json({ message: "Invalid credentials" });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
