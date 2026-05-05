import mongoose from 'mongoose';

const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age must be a positive number'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: 'throw',
    collection: 'students',
  },
);

export const Student =
  mongoose.models.Student || mongoose.model('Student', studentSchema);
