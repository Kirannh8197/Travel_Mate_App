# Travel_Mate_App

Gemini said
Building "Travel Mate" is a fantastic full-stack MERN project. It incorporates standard e-commerce features (booking), complex data relationships, and third-party integrations (maps and geolocation), which are excellent for a developer portfolio.

Since you want a clean, production-ready setup, we will use a Feature-Driven Architecture for the frontend (similar to what we discussed for your previous microservices project) and a Layered Architecture (Controllers -> Services -> Models) for the backend.

Here is the blueprint to structure the Travel Mate application.

1. The Monorepo Folder Structure
Keep your frontend and backend in the same root repository for easy full-stack development, but strictly separate their dependencies.

Plaintext
travel-mate/
├── backend/          # Node.js, Express, MongoDB, TypeScript
│   ├── package.json
│   └── src/
└── frontend/         # React, Vite, TailwindCSS, TypeScript
    ├── package.json
    └── src/
2. MongoDB Database Schema (Mongoose + TypeScript)
Your database needs to handle users, hotels with geospatial data, bookings, reviews, and cab rides. Here is how you should structure your core collections.

Users Collection:

TypeScript
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER' }
});
Hotels Collection (Notice the GeoJSON for location):

TypeScript
const HotelSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  address: {
    city: String,
    state: String,
    country: String
  },
  // MongoDB GeoJSON format for accurate map plotting and proximity searches
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  pricePerNight: { type: Number, required: true },
  amenities: [String],
  averageRating: { type: Number, default: 0 }
});
// Create a geospatial index to search "Hotels near me"
HotelSchema.index({ location: '2dsphere' });
Bookings & Reviews Collections:

TypeScript
const BookingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' }
});

const ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  hotel: { type: Schema.Types.ObjectId, ref: 'Hotel' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String }
});
Cab Rides Collection:

TypeScript
const CabRideSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  distanceKm: { type: Number, required: true },
  ratePerKm: { type: Number, default: 15 }, // Fixed price per km logic
  totalFare: { type: Number, required: true },
  status: { type: String, enum: ['BOOKED', 'COMPLETED', 'CANCELLED'] }
});
3. Backend Services Structure (Node/Express)
Keep your routing logic separate from your business logic. This makes the code readable and easy to test.

Plaintext
backend/src/
├── config/           # DB connection (db.ts), Environment variables
├── controllers/      # Extract req.body, call services, send res.json
│   ├── auth.controller.ts
│   ├── hotel.controller.ts
│   └── cab.controller.ts
├── middlewares/      # JWT verification, Error handling, Input validation
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── models/           # Mongoose schemas (defined above)
├── routes/           # Map Express endpoints to Controllers
│   ├── auth.routes.ts
│   └── hotel.routes.ts
├── services/         # Core business logic (e.g., calculate cab fare, check room availability)
│   ├── hotel.service.ts
│   └── cab.service.ts
└── app.ts            # Express app initialization
4. Frontend React Structure & UI Components
Organize the React app by feature. This prevents a massive, cluttered components folder.

Plaintext
frontend/src/
├── api/              # Axios instance and interceptors (like we did before)
├── components/       # Global Shared UI
│   ├── layout/       # Navbar, Footer, Sidebar
│   └── ui/           # Buttons, Modals, LoadingSpinners, StarRating
├── features/         # Domain-specific logic and components
│   ├── auth/         # Login/Register forms, useAuth hook
│   ├── hotels/
│   │   ├── components/
│   │   │   ├── HotelCard.tsx     # Displays image, price, rating
│   │   │   ├── HotelList.tsx     # Grid of HotelCards
│   │   │   └── MapView.tsx       # Leaflet or Google Maps integration
│   │   └── api/      # Axios calls to /api/hotels
│   ├── bookings/
│   │   ├── components/ 
│   │   │   └── BookingForm.tsx   # Date picker and payment summary
│   │   └── api/
│   └── cabs/
│       ├── components/
│       │   └── CabEstimator.tsx  # Input pickup/dropoff, shows calculated fare
│       └── api/
├── pages/            # Route-level components mapping features together
│   ├── Home.tsx
│   ├── HotelDetails.tsx
│   └── UserDashboard.tsx
└── App.tsx           # React Router setup
