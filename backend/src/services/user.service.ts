import { User } from "../models/userSchema.model";
import bcrypt from "bcryptjs";



 // Get All Users
 
export const getAllUsers = async () => {
  return await User.find().select("-password");
};

/**
 * Create User
 */
// export const createUser = async (data: any) => {
//   if (!data) {
//     throw new Error("User data is required");
//   }

//   const user = await User.create(data);
//   return user;
// };

export const createUser = async (data: any) => {
  if (!data) {
    throw new Error("User data is required");
  }

  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({...data,password: hashedPassword,});
  
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};


// login here

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  console.log("Login email:", email);

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const { password: _, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

 // Update User 
 
export const updateUserById = async (userId: number, data: any) => {

  if (isNaN(userId)) {
    throw new Error("Invalid User ID");
  }

  const updatedUser = await User.findOneAndUpdate(
    { userId: userId },   
    { $set: data },      
    { new: true }        
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

// Get User By ID
 
// export const getUserById = async (id: string) => {
//   if (!Types.ObjectId.isValid(id)) {
//     throw new Error("Invalid User ID");
//   }

//   const user = await User.findById(id);

//   if (!user) {
//     throw new Error("User not found");
//   }

//   return user;
// };


export const getUserById = async (userId: number) => {

  const user = await User.findOne({ userId });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};