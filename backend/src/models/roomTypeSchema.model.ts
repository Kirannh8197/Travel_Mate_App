import { Schema, model, Document, Types } from 'mongoose';

//V's_new_start
export interface IRoomType extends Document {
    hotel: Types.ObjectId;
    name: string;
    basePrice: number;
    totalInventory: number;
}

const RoomTypeSchema = new Schema<IRoomType>(
    {
        hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
        name: { type: String, required: true },
        basePrice: { type: Number, required: true },
        totalInventory: { type: Number, required: true },
    },
    { timestamps: true }
);

export const RoomType = model<IRoomType>('RoomType', RoomTypeSchema);
//V's_new_end
