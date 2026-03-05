import express from 'express'

import { User } from '../models/userSchema.model'

const router = express.Router();

router.get("/api/user/", async(req, res) => {
    try{
        const user = await User.find();
        res.status(200).json({users: user});
    }catch(error: any){
        res.status(500).json({message:error.message});
    }
})

router.post("/api/user/", async(req, res) =>{
    try{
        const createUser = await User.create(req.body);
        res.status(201).json({message: "User created successfully", data: createUser});
    }catch(err: any){
        res.status(500).json({message: err.json});
    }
})

router.put("/api/user/:id", async(req, res) => {
    try {
        const empUpdate = await User.findOneAndUpdate({ empId: Number({userID: req.params.id}) }, 
            req.body,
            { new: true, runValidators: true }
        );
        if (!empUpdate) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json({
            message: "Employee updated succesfully",
            data: empUpdate
        });
    }
    catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});
