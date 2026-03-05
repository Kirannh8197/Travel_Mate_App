import { Schema, model, Document, Types } from 'mongoose';

//V's_new_start
export interface IRoomAvailability extends Document {
    hotel: Types.ObjectId;
    roomType: Types.ObjectId;
    date: Date;
    availableRooms: number;
}

const RoomAvailabilitySchema = new Schema<IRoomAvailability>(
    {
        hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
        date: { type: Date, required: true },
        availableRooms: { type: Number, required: true, min: 0 },
    },
    { timestamps: true }
);

// Prevent duplicate entries for the same room type on the same date
RoomAvailabilitySchema.index({ roomType: 1, date: 1 }, { unique: true });

export const RoomAvailability = model<IRoomAvailability>('RoomAvailability', RoomAvailabilitySchema);
//V's_new_end
