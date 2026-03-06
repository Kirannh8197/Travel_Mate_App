# Functional Core Refactoring Changes

## Added
- `backend/src/models/roomTypeSchema.model.ts`: Created RoomType schema to track room variations and base inventory values.
- `backend/src/models/roomAvailabilitySchema.model.ts`: Created RoomAvailability schema to track inventory per date and prevent overbooking.
- `frontend/travel-mate-app/src/store/useUserStore.ts`: Established a lightweight Zustand store for global user/auth state.
- `frontend/travel-mate-app/src/pages/SearchPage.tsx`: Logic UI component to test `$near` spatial queries.
- `frontend/travel-mate-app/src/pages/SandboxBooking.tsx`: Logic UI component simulating the Two-Phase Commit transaction loop.
- `frontend/travel-mate-app/src/pages/ReviewPortal.tsx`: Logic UI component validating internal auth state before API post.
- `backend/src/services/cabBooking.service.ts`: Implemented `findNearbyCabs` utilizing GeoJSON `$near` logic and `bookCab` logic.
- `backend/src/routes/cabBookingRoutes.routes.ts`: Created REST endpoints to expose the Cab service.

## Modified
- `backend/src/models/hotelBookingSchema.model.ts`: Added PENDING status to the enum and a 15-minute TTL index for holds.
- `backend/src/services/hotelBooking.service.ts`: Rewrote `createBooking` to use MongoDB transactions and dynamically check/reduce room availability.
- `backend/src/models/cabBookingSchema.model.ts`: Replaced basic string pickup/dropoff locations with GeoJSON Point structures and established `2dsphere` spatial indexes.
- `backend/src/services/review.service.ts`: Updated `createReview` to strictly enforce that users can only submit reviews if they have a prior `COMPLETED` booking for that specific hotel.
- `frontend/travel-mate-app/src/main.tsx`: Wrapped the application with `<QueryClientProvider>` to scaffold TanStack React Query.
- `frontend/travel-mate-app/src/App.tsx`: Wired up React Router to scaffold the minimal Sandbox test environments.
