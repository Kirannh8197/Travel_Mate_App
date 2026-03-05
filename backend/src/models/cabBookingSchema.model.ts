import { Schema, model, Document, Types } from 'mongoose';

export interface ICabRide extends Document {
  user: Types.ObjectId;
  //  pickupLocation: string; // Could also be GeoJSON if you want map pins
  //  dropoffLocation: string;
  //V's_new_start
  pickupLocation: {
    type: 'Point';
    coordinates: number[]; // [longitude, latitude]
  };
  dropoffLocation: {
    type: 'Point';
    coordinates: number[];
  };
  //V's_new_end
  distanceKm: number;
  ratePerKm: number;
  totalFare: number;
  status: 'BOOKED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

const CabRideSchema = new Schema<ICabRide>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    //    pickupLocation: { type: String, required: true },
    //    dropoffLocation: { type: String, required: true },
    //V's_new_start
    pickupLocation: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { type: [Number], required: true },
    },
    dropoffLocation: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { type: [Number], required: true },
    },
    //V's_new_end
    distanceKm: { type: Number, required: true },
    ratePerKm: { type: Number, default: 15, required: true }, // e.g., ₹15 or $15 per km
    totalFare: { type: Number, required: true },
    status: {
      type: String,
      enum: ['BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'BOOKED'
    },
  },
  { timestamps: true }
);

// Pre-save hook to automatically calculate the total fare
CabRideSchema.pre('validate', function () {
  if (this.distanceKm && this.ratePerKm) {
    this.totalFare = this.distanceKm * this.ratePerKm;
  }
});

//V's_new_start
// Add spatial indexes to support $near routes
CabRideSchema.index({ pickupLocation: '2dsphere' });
CabRideSchema.index({ dropoffLocation: '2dsphere' });
//V's_new_end

export const CabRide = model<ICabRide>('CabRide', CabRideSchema);