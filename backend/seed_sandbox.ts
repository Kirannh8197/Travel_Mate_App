//V's_new_start
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, UserRole } from './src/models/userSchema.model';
import { Hotel } from './src/models/hotelSchema.model';
import { RoomType } from './src/models/roomTypeSchema.model';
import { RoomAvailability } from './src/models/roomAvailabilitySchema.model';
import fs from 'fs';

dotenv.config();

const seedAndExtractIds = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/TravleMate';
        await mongoose.connect(uri);
        console.log(`Connected to local DB at ${uri} for seeding.`);

        // Clear old test data conditionally if needed, but let's just create unique robust ones 
        // to avoid violating unique indexes:
        const rand = Math.floor(Math.random() * 100000);

        const user = await User.create({
            userId: rand,
            name: "Test Sandbox User",
            email: `sandbox${rand}@example.com`,
            password: "password123",
            role: UserRole.CUSTOMER
        });

        const hotel = await Hotel.create({
            hotelId: rand,
            name: "The Sandbox Grand",
            email: `hotel${rand}@example.com`,
            password: "password123",
            description: "Testing hotel for the Sandbox verification loops.",
            location: {
                type: "Point",
                coordinates: [77.59, 12.97] // Bangalore
            },
            address: {
                city: "Bangalore",
                state: "Karnataka",
                country: "India"
            },
            amenities: ["WiFi", "Pool"],
            images: ["test1.jpg", "test2.jpg", "test3.jpg"],
            pricePerNight: 5000
        });

        const roomType = await RoomType.create({
            hotel: hotel._id,
            name: "Deluxe Test Room",
            basePrice: 5000,
            totalInventory: 10
        });

        const dateToday = new Date();
        dateToday.setHours(0, 0, 0, 0);

        const dateTomorrow = new Date(dateToday);
        dateTomorrow.setDate(dateTomorrow.getDate() + 1);

        await RoomAvailability.create([
            { hotel: hotel._id, roomType: roomType._id, date: dateToday, availableRooms: 10 },
            { hotel: hotel._id, roomType: roomType._id, date: dateTomorrow, availableRooms: 10 }
        ]);

        const IdsJSON = {
            userId: user.userId.toString(),
            userObjectId: user._id.toString(),
            hotelId: hotel._id.toString(),
            hotelNumericId: hotel.hotelId.toString(),
            roomTypeId: roomType._id.toString()
        };

        fs.writeFileSync('sandboxIds.json', JSON.stringify(IdsJSON, null, 2));
        console.log("Seeding complete. IDs written to sandboxIds.json");

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        process.exit(0);
    }
};

seedAndExtractIds();
//V's_new_end
