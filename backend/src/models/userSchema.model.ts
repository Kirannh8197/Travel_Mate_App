import { Schema, model, Document } from 'mongoose';

export enum UserRole {
  USER = "USER",
  HOTEL_HOST = "HOTEL_HOST",
  ADMIN = "ADMIN"
}

export interface IUser extends Document {
  userId: number;
  name: string;
  email: string;
  password: string; 
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: {type: Number, required: true, unique:true},
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  },
  { timestamps: true } 
);

export const User = model<IUser>('User', UserSchema);