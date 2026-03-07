# Functional Core Refactoring Changes

### Added
- `backend/src/models/roomTypeSchema.model.ts`: Created RoomType schema to track room variations and base inventory values.
- `backend/src/models/roomAvailabilitySchema.model.ts`: Created RoomAvailability schema to track inventory per date and prevent overbooking.
- `frontend/travel-mate-app/src/store/useUserStore.ts`: Established a lightweight Zustand store for global user/auth state.
- `frontend/travel-mate-app/src/pages/SearchPage.tsx`: Logic UI component to test `$near` spatial queries.
- `frontend/travel-mate-app/src/pages/SandboxBooking.tsx`: Logic UI component simulating the Two-Phase Commit transaction loop.
- `frontend/travel-mate-app/src/pages/ReviewPortal.tsx`: Logic UI component validating internal auth state before API post.
- `backend/src/services/cabBooking.service.ts`: Implemented `findNearbyCabs` utilizing GeoJSON `$near` logic and `bookCab` logic.
- `backend/src/routes/cabBookingRoutes.routes.ts`: Created REST endpoints to expose the Cab service.

### Modified
- `backend/src/models/hotelBookingSchema.model.ts`: Added PENDING status to the enum and a 15-minute TTL index for holds.
- `backend/src/services/hotelBooking.service.ts`: Rewrote `createBooking` to use MongoDB transactions and dynamically check/reduce room availability.
- `backend/src/models/cabBookingSchema.model.ts`: Replaced basic string pickup/dropoff locations with GeoJSON Point structures and established `2dsphere` spatial indexes.
- `backend/src/services/review.service.ts`: Updated `createReview` to strictly enforce that users can only submit reviews if they have a prior `COMPLETED` booking for that specific hotel.
- `frontend/travel-mate-app/src/main.tsx`: Wrapped the application with `<QueryClientProvider>` to scaffold TanStack React Query.
- `frontend/travel-mate-app/src/App.tsx`: Wired up React Router to scaffold the minimal Sandbox test environments.

### Added
- `frontend/travel-mate-app/src/components/ui/UserDashboard.tsx`: Dashboard for travelers showing active bookings.
- `frontend/travel-mate-app/src/components/ui/HostDashboard.tsx`: Command center for hotel hosts to view live bookings and revenue stats.
- `frontend/travel-mate-app/src/components/ui/AdminDashboard.tsx`: Governance dashboard for admins to approve/reject hotel properties.
- `frontend/travel-mate-app/src/components/ui/AuthModal.tsx`: Unified Auth Modal to handle login & registration seamlessly for all roles.
- `frontend/travel-mate-app/src/components/ui/ListHotelWizard.tsx`: Integrated Mapbox GL JS for accurate Host Location Pin-dropping.
- `backend/src/middleware/upload.middleware.ts`: Implemented Multer configuration strictly filtering for `.jpeg/jpg/png/webp` and setting up `/uploads` target path.

### Modified
- `frontend/travel-mate-app/src/App.tsx`: Wired the Role-based `<DashboardRouter />` to render the correct view based on the user's role.
- `frontend/travel-mate-app/src/pages/SandboxBooking.tsx`: Integrated Mapbox Directions API for cab fare routing post-booking.
- `backend/src/services/hotelBooking.service.ts`: Altered booking flow to bypass manual approval by saving initial booking as `CONFIRMED` upon checkout completion.
- `backend/src/app.ts`: Attached static file serving for the `/uploads` directory.
- `backend/src/routes/hotelRoutes.routes.ts`: Refactored `/register` to accept `multipart/form-data` via Multer, generating stored file URLs.
- `frontend/travel-mate-app/src/components/ui/ListHotelWizard.tsx`: Refactored image attachment to dispatch an array of raw `File` objects mapped onto `FormData`.

### Added
- `frontend/travel-mate-app/src/components/ui/InteractiveStarRating.tsx`: Created a highly engaging interactive star review component replacing numerical inputs.

### Modified
- `frontend/travel-mate-app/src/pages/LandingPage.tsx`: Completely overhauled the UI into an ultra-premium Ethereal light mode layout with Framer motion, gradient meshes, and dynamic routing to List Property Studio.
- `frontend/travel-mate-app/src/App.tsx`: Refactored navbar to not shrink. Enforced redirect logic so logged-in users bypass the landing page and are routed straight to their dashboards.
- `frontend/travel-mate-app/src/pages/SearchPage.tsx`: Removed dark mode classes, enforced bright mode, converted USD prices to Rupee (₹).
- `frontend/travel-mate-app/src/components/ui/UserDashboard.tsx`: Removed dark mode classes, enforced bright Ethereal mode, mapped USD to Rupee (₹). 
- `frontend/travel-mate-app/src/components/ui/HostDashboard.tsx`: Removed dark mode classes, enforced bright Ethereal mode, mapped USD to Rupee (₹).
- `frontend/travel-mate-app/src/pages/SandboxBooking.tsx`: Removed dark mode classes, enforced bright Ethereal mode, mapped USD to Rupee (₹).
- `frontend/travel-mate-app/src/pages/ReviewPortal.tsx`: Removed dark mode components and integrated the `InteractiveStarRating`.
- `backend/src/middleware/upload.middleware.ts`: Migrated multer from `diskStorage` to `memoryStorage` to handle raw buffer processing requested by DB storage strategy.
- `backend/src/routes/hotelRoutes.routes.ts`: Refactored `req.files` handling to parse buffers into base64 data URIs and save directly into MongoDB `images` array field instead of local uploads folder.
- `backend/src/models/hotelSchema.model.ts`: Verified active syntax and resolved schema syntax drift impacting `ts-node-dev` compilation.

//V's_new_end


### Added
- `frontend/travel-mate-app/src/components/ui/StatusModal.tsx`: Created a premium Framer Motion enhanced modal to replace native alert dialogs.

### Modified
- `frontend/travel-mate-app/src/components/ui/ListHotelWizard.tsx`: Interfaced the form submission error states to trigger the custom `StatusModal` instead of a browser alert.
- `frontend/travel-mate-app/src/pages/LandingPage.tsx`: Appended Ethereal Infinity Pools text/imagery, replaced Mapbox grid component with a dedicated Cab Transfers component, and wrapped an Auth Guard around the List Property Studio routing button.
- `backend/src/middleware/upload.middleware.ts`: Migrated back from memory buffer to local `/uploads` disk storage and expanded filesize maximum thresholds to 10MB per file to stabilize large-asset uploads.
- `backend/src/routes/hotelRoutes.routes.ts`: Wrapped the image parsing middleware explicitly within an error handler wrapper. This intercepts high-volume load rejections and returns formatted HTTP 400 Bad Request data, ending the unlogged dropped connections (Failed to fetch). Modified MongoDB document insertion to strictly refer to lightweight static `/uploads` URL parameters to bypass the destructive 16MB document cap.


### Modified
- `frontend/travel-mate-app/src/pages/LandingPage.tsx`: Removed "Ethereal Infinity Pools" section and restored the structural `Mapbox Integration` card. Injected high-resolution luxury Cab imagery to the Dedicated Cab Transfers section. Stripped text remnants of 'Ethereal' and reverted to 'TravelMate'. Appended the `{ defaultRole: "HOTEL_HOST" }` injection to the `List Property Studio` AuthGuard checkpoint.
- `frontend/travel-mate-app/src/components/ui/AuthModal.tsx`: Expanded `AuthModalProps` to passively accept a dynamic `defaultRole`. Injected this role into the `/api/users` account creation payload so Landing Page property listers are formally persisted as `HOTEL_HOST`s. Stripped 'Ethereal' text.
- `frontend/travel-mate-app/src/components/ui/HostDashboard.tsx`: Added an intelligent zero-state logic gate: if a Host logs in but has 0 listings, a giant `+ List New Property` CTA intercepts them and routes them cleanly into `/list-hotel` instead of arriving at a blank registry.
- `frontend/travel-mate-app/src/store/useUserStore.ts`: Re-architected the `logout()` bounds action to physically wipe state AND force `window.location.href = '/'`, permanently clearing the memory cache and ejecting all users explicitly to the safe Landing Page root.
- `frontend/travel-mate-app/src/App.tsx`: Removed textual references mapping strings like 'TravelMate Ethereal' strictly back to 'TravelMate'.


### Added
- `frontend/travel-mate-app/src/components/ui/BrandIcon.tsx`: Engineered a high-detail Framer Motion brand component implementing the new elite identity.
- `frontend/travel-mate-app/src/assets/logo-icon.png`: Integrated the refined, isolated "Pin/M/Bird" brand mark as a permanent asset.

### Modified
- `backend/src/routes/authRoutes.routes.ts`: Refactored the unified login priority. Authentications now prioritize the `Hotel` collection, ensuring hosts are returned with full metadata and correct MongoDB `_id` instead of generic `User` records.
- `backend/src/middleware/upload.middleware.ts`: Corrected relative pathing (`../../uploads`) to align the Multer destination with the root static directory, resolving the broken image issue for all newly uploaded host photos.
- `frontend/travel-mate-app/src/components/ui/HostDashboard.tsx`: Hardened the guest activity fetch. The dashboard now identifies the backend Hotel record via email to ensure persistent ID-mapping regardless of the session state, successfully restoring the 'The Neo Grand' booking feed.
- `frontend/travel-mate-app/src/App.tsx`: Replaced generic MapPin icons in the Global Navigation with the pulsing `BrandIcon`.
- `frontend/travel-mate-app/src/components/ui/AuthModal.tsx`: Injected the premium `BrandIcon` into the Auth Header to establish immediate visual trust at the entry point.
- `frontend/travel-mate-app/index.html`: (User) Updated the Favicon link to reference the new elite brand icon.

//V's_new_end
