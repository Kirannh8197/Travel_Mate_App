# Functional Core Refactoring Changes

## Added
- `backend/src/models/roomTypeSchema.model.ts`: Created RoomType schema to track room variations and base inventory values.
- `backend/src/models/roomAvailabilitySchema.model.ts`: Created RoomAvailability schema to track inventory per date and prevent overbooking.

## Modified
- `backend/src/models/hotelBookingSchema.model.ts`: Added PENDING status to the enum and a 15-minute TTL index for holds.
- `backend/src/services/hotelBooking.service.ts`: Rewrote `createBooking` to use MongoDB transactions and dynamically check/reduce room availability.
- `backend/src/models/cabBookingSchema.model.ts`: Replaced basic string pickup/dropoff locations with GeoJSON Point structures and established `2dsphere` spatial indexes.
- `backend/src/services/review.service.ts`: Updated `createReview` to strictly enforce that users can only submit reviews if they have a prior `COMPLETED` booking for that specific hotel.
