import { Types } from "mongoose";
import { Review } from "../models/reviewSchema.model";
import { Hotel } from "../models/hotelSchema.model";
import { User } from "../models/userSchema.model"; // Import User to look up the user's ObjectId
//V's_new_start
import { Booking } from "../models/hotelBookingSchema.model";
//V's_new_end

// /**
//  * Create a new Review
//  */
// export const createReview = async (data: any) => {
//   // Assume the frontend sends your custom numeric IDs: data.userId and data.hotelId
//   if (!data.reviewId || !data.userId || !data.hotelId || !data.rating || !data.comment) {
//     throw new Error("reviewId, userId, hotelId, rating, and comment are required fields.");
//   }
// 
//   // 1. Find the actual MongoDB _id for the User
//   const userRecord = await User.findOne({ userId: data.userId });
//   if (!userRecord) {
//     throw new Error(`User with userId ${data.userId} not found.`);
//   }
// 
//   // 2. Find the actual MongoDB _id for the Hotel
//   const hotelRecord = await Hotel.findOne({ hotelId: data.hotelId });
//   if (!hotelRecord) {
//     throw new Error(`Hotel with hotelId ${data.hotelId} not found.`);
//   }
// 
//   // 3. Construct the review object using the real ObjectIds
//   const reviewDataToSave = {
//     reviewId: data.reviewId,
//     user: userRecord._id,   // Use the MongoDB _id
//     hotel: hotelRecord._id, // Use the MongoDB _id
//     rating: data.rating,
//     comment: data.comment
//   };
// 
//   const review = await Review.create(reviewDataToSave);
//   return review;
// };
//V's_new_start
/**
 * Create a new Review (Trust System Enforced)
 */
export const createReview = async (data: any) => {
  if (!data.reviewId || !data.userId || !data.hotelId || !data.rating || !data.comment) {
    throw new Error("reviewId, userId, hotelId, rating, and comment are required fields.");
  }

  const userRecord = await User.findOne({ userId: data.userId });
  if (!userRecord) {
    throw new Error(`User with userId ${data.userId} not found.`);
  }

  const hotelRecord = await Hotel.findOne({ hotelId: data.hotelId });
  if (!hotelRecord) {
    throw new Error(`Hotel with hotelId ${data.hotelId} not found.`);
  }

  // Enforce trust system: Check for a COMPLETED booking
  const completedBooking = await Booking.findOne({
    user: userRecord._id,
    hotel: hotelRecord._id,
    status: "COMPLETED"
  });

  if (!completedBooking) {
    throw new Error("Reviews can only be submitted for completed stays.");
  }

  const reviewDataToSave = {
    reviewId: data.reviewId,
    user: userRecord._id,
    hotel: hotelRecord._id,
    rating: data.rating,
    comment: data.comment
  };

  const review = await Review.create(reviewDataToSave);
  return review;
};
//V's_new_end

/**
 * Get all reviews for a specific Hotel using your custom numeric hotelId
 */
export const getReviewsByHotel = async (hotelId: number) => {
  if (isNaN(hotelId)) {
    throw new Error("Invalid Hotel ID");
  }

  // 1. Find the hotel using your custom numeric hotelId
  const hotelRecord = await Hotel.findOne({ hotelId: hotelId });
  if (!hotelRecord) {
    throw new Error("Hotel not found");
  }

  // 2. Use that hotel's MongoDB _id to find its reviews
  const reviews = await Review.find({ hotel: hotelRecord._id })
    .populate('user', 'name') // This works perfectly now because 'user' holds a real ObjectId
    .sort({ createdAt: -1 });

  return reviews;
};

/**
 * Get a specific review by custom reviewId
 */
export const getReviewByReviewId = async (reviewId: number) => {
  if (isNaN(reviewId)) {
    throw new Error("Invalid Review ID");
  }

  const review = await Review.findOne({ reviewId }).populate('user', 'name');

  if (!review) {
    throw new Error("Review not found");
  }

  return review;
};

/**
 * Update a Review by custom reviewId
 */
export const updateReviewByReviewId = async (reviewId: number, data: any) => {
  if (isNaN(reviewId)) {
    throw new Error("Invalid Review ID");
  }

  // Remove relationships so users can't change who wrote the review or what hotel it belongs to
  const { user, hotel, userId, hotelId, reviewId: idField, ...safeUpdateData } = data;

  const updatedReview = await Review.findOneAndUpdate(
    { reviewId: reviewId },
    safeUpdateData,
    { new: true, runValidators: true }
  ).populate('user', 'name');

  if (!updatedReview) {
    throw new Error("Review not found");
  }

  return updatedReview;
};

/**
 * Delete a Review by custom reviewId
 */
export const deleteReviewByReviewId = async (reviewId: number) => {
  if (isNaN(reviewId)) {
    throw new Error("Invalid Review ID");
  }

  const deletedReview = await Review.findOneAndDelete({ reviewId: reviewId });

  if (!deletedReview) {
    throw new Error("Review not found");
  }

  return deletedReview;
};