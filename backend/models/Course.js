
import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['video', 'pdf', 'quiz'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 5000
    },
    instructor: {
      type: String,
      trim: true,
      default: '',
      maxlength: 100
    },
    duration: {
      type: String,
      trim: true,
      default: '',
      maxlength: 50
    },
    totalLessons: {
      type: Number,
      default: 10,
      min: 1,
      max: 500
    },
    resources: {
      type: [resourceSchema],
      default: []
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

courseSchema.index({ title: 1 });

export default mongoose.model('Course', courseSchema);
