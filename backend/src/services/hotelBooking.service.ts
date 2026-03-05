import { Types } from "mongoose";
import { Booking } from "../models/hotelBookingSchema.model";
import { Hotel } from "../models/hotelSchema.model";
//V's_new_start
import mongoose from "mongoose";
import { RoomAvailability } from "../models/roomAvailabilitySchema.model";
//V's_new_end

// /**
//  * Create Booking Service
//  */
// export const createBooking = async (
//   userId: string,
//   hotelId: string,
//   checkInDate: string,
//   checkOutDate: string
// ) => {
//   //  Validate ObjectIds
//   if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(hotelId)) {
//     throw new Error("Invalid User or Hotel ID");
//   }
// 
//   const checkIn = new Date(checkInDate);
//   const checkOut = new Date(checkOutDate);
// 
//   //  Validate Dates
//   if (checkOut <= checkIn) {
//     throw new Error("Check-out date must be after check-in date");
//   }
// 
//   //  Check if hotel exists
//   const hotel = await Hotel.findById(hotelId);
//   if (!hotel) {
//     throw new Error("Hotel not found");
//   }
// 
//   //  Check availability (overlapping logic)
//   const existingBooking = await Booking.findOne({
//     hotel: hotelId,
//     status: "CONFIRMED",
//     checkInDate: { $lt: checkOut },
//     checkOutDate: { $gt: checkIn },
//   });
// 
//   if (existingBooking) {
//     throw new Error("Hotel not available for selected dates");
//   }
// 
//   //  Calculate total days
//   const diffTime = checkOut.getTime() - checkIn.getTime();
//   const totalDays = diffTime / (1000 * 60 * 60 * 24);
// 
//   //  Calculate total amount
//   const totalAmount = totalDays * hotel.pricePerNight;
// 
//   //  Create booking
//   const booking = await Booking.create({
//     user: userId,
//     hotel: hotelId,
//     checkInDate: checkIn,
//     checkOutDate: checkOut,
//     totalAmount,
//     status: "CONFIRMED",
//   });
// 
//   return booking;
// };
//V's_new_start
/**
 * Create Booking Service (Transactional)
 */
export const createBooking = async (
  userId: string,
  hotelId: string,
  checkInDate: string,
  checkOutDate: string,
  roomTypeId?: string
) => {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(hotelId)) {
    throw new Error("Invalid User or Hotel ID");
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (checkOut <= checkIn) {
    throw new Error("Check-out date must be after check-in date");
  }

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new Error("Hotel not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const dates = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(checkInDate); // using the string to avoid mutating
      d.setUTCHours(0, 0, 0, 0);       // enforce midnight UTC for dates
      d.setUTCDate(d.getUTCDate() + i);
      dates.push(d);
    }

    if (roomTypeId && Types.ObjectId.isValid(roomTypeId)) {
      const availabilities = await RoomAvailability.find({
        hotel: hotelId,
        roomType: roomTypeId,
        date: { $in: dates },
        availableRooms: { $gt: 0 }
      }).session(session);

      if (availabilities.length !== dates.length) {
        throw new Error("Rooms not available for all selected dates");
      }

      await RoomAvailability.updateMany(
        { _id: { $in: availabilities.map(a => a._id) } },
        { $inc: { availableRooms: -1 } },
        { session }
      );
    }

    const totalAmount = totalDays * hotel.pricePerNight;

    const booking = await Booking.create([{
      user: userId,
      hotel: hotelId,
      roomType: roomTypeId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalAmount,
      status: "PENDING",
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return booking[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
//V's_new_end

/**
 * Get All Bookings of a User
 */
export const getBookingsByUser = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid User ID");
  }

  return await Booking.find({ user: userId })
    .populate("hotel")
    .sort({ createdAt: -1 });
};

/**
 * Get All Bookings of a Hotel (Admin use)
 */
export const getBookingsByHotel = async (hotelId: string) => {
  if (!Types.ObjectId.isValid(hotelId)) {
    throw new Error("Invalid Hotel ID");
  }

  return await Booking.find({ hotel: hotelId })
    .populate("user")
    .sort({ createdAt: -1 });
};

/**
 * Cancel Booking
 */
export const cancelBooking = async (bookingId: string) => {
  if (!Types.ObjectId.isValid(bookingId)) {
    throw new Error("Invalid Booking ID");
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status === "CANCELLED") {
    throw new Error("Booking already cancelled");
  }

  booking.status = "CANCELLED";
  await booking.save();

  return booking;
};

/**
 * Complete Booking (optional - admin/system)
 */
export const completeBooking = async (bookingId: string) => {
  if (!Types.ObjectId.isValid(bookingId)) {
    throw new Error("Invalid Booking ID");
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "CONFIRMED") {
    throw new Error("Only confirmed bookings can be completed");
  }

  booking.status = "COMPLETED";
  await booking.save();

  return booking;
};