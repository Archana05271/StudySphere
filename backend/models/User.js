
import mongoose from 'mongoose';

// Validate phone number.
const phonePattern = /^$|^[0-9+()\-\s]{7,15}$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },

    phone: {
      type: String,
      trim: true,
      default: '',
      match: [phonePattern, 'Phone number is invalid']
    },

    department: {
      type: String,
      trim: true,
      default: '',
      maxlength: 100
    },

    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('User', userSchema);
