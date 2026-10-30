import mongoose from "mongoose";

const learningProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    completedLessons: {
      type: Number,
      default: 0,
      min: 0
    },
    totalLessons: {
      type: Number,
      required: true,
      min: 1
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// One progress record per student per course
learningProgressSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);

// Calculate progress automatically before saving
learningProgressSchema.pre("save", function () {
  if (this.completedLessons > this.totalLessons) {
    throw new Error("Completed lessons cannot exceed total lessons");
  }
  this.progressPercentage = Math.round(
    (this.completedLessons / this.totalLessons) * 100
  );
});

export default mongoose.model("LearningProgress", learningProgressSchema);