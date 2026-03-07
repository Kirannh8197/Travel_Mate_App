import { Schema, model, Document } from 'mongoose';

export interface IHotel extends Document {
  hotelId: number;
  name: string;
  email: string;
  password: string;
  description: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  location: {
    type: 'Point';
    coordinates: number[]; // [longitude, latitude]
  };
  pricePerNight: number;
  amenities: string[];
  images: string[];
  averageRating: number;
  status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
}

const HotelSchema = new Schema<IHotel>(
  {
    hotelId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true }, // Added Email
    password: { type: String, required: true }, // Added Password
    description: { type: String, required: true },
    address: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { type: [Number], required: true },
    },
    pricePerNight: { type: Number, required: true },
    amenities: [{ type: String }],
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr: string[]) {
          return arr && arr.length >= 3;
        },
        message: 'A hotel must upload at least 3 images.',
      },
    },
    averageRating: { type: Number, default: 0 },
    status: { type: String, enum: ['PENDING_VERIFICATION', 'APPROVED', 'REJECTED'], default: 'PENDING_VERIFICATION'}
  },
  { timestamps: true }
);

HotelSchema.index({ location: '2dsphere' });

export const Hotel = model<IHotel>('Hotel', HotelSchema);