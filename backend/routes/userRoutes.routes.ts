import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/userSchema.model';

const router = express.Router();

// GET all users
router.get("/", async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ users });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// GET single user by ID (Added for completeness)
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// POST - Create a new user (Registration)
router.post("/", async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const createUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });
        
        const { password: removedPassword, ...userResponse } = createUser.toObject();

res.status(201).json({ message: "User created successfully", data: userResponse });
        res.status(201).json({ message: "User created successfully", data: userResponse });
    } catch (err: any) {
        res.status(500).json({ message: err.message }); // Fixed err.json typo
    }
});

// PUT - Update a user
router.put("/:id", async (req: Request, res: Response) => {
    try {
        // If the user is trying to update their password, we must hash the new one
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        // Fixed query: Use findByIdAndUpdate and pass the req.params.id directly
        const userUpdate = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (!userUpdate) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User updated successfully",
            data: userUpdate
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE - Remove a user (Added for completeness)
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;