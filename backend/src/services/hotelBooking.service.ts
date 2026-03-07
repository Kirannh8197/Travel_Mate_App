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
 * Create Booking Service
 * NOTE: Uses simple create() — no transactions (requires standalone-compatible MongoDB)
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

  const diffTime = checkOut.getTime() - checkIn.getTime();
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalAmount = totalDays * hotel.pricePerNight;

  const booking = await Booking.create({
    user: userId,
    hotel: hotelId,
    roomType: roomTypeId,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    totalAmount,
    status: "CONFIRMED",
  });

  return booking;
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

//V's_new_start
/**
 * Confirm Booking (Payment Success)
 */
export const confirmBooking = async (bookingId: string) => {
  if (!Types.ObjectId.isValid(bookingId)) {
    throw new Error("Invalid Booking ID");
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "PENDING") {
    throw new Error("Only pending bookings can be confirmed");
  }

  booking.status = "CONFIRMED";
  await booking.save();

  return booking;
};
//V's_new_end

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