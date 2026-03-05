import { Schema, model, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  user: Types.ObjectId;
  hotel: Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  totalAmount: number;
  //  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  roomType?: Types.ObjectId; // Tracking which room type is booked
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    //V's_new_start
    roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: false },
    //V's_new_end
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    //    status: { 
    //      type: String, 
    //      enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED'], 
    //      default: 'CONFIRMED' 
    //    },
    //V's_new_start
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING'
    },
    //V's_new_end
  },
  { timestamps: true }
);

//V's_new_start
// Automatically delete PENDING bookings after 15 minutes (900 seconds)
BookingSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 900, partialFilterExpression: { status: 'PENDING' } }
);
//V's_new_end

export const Booking = model<IBooking>('Booking', BookingSchema);