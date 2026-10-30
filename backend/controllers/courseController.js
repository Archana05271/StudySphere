
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import LearningProgress from '../models/LearningProgress.js';

// Get all courses.
export async function getAllCourses(req, res, next) {
  try {
    const courses = await Course.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    next(error);
  }
}

// Get a single course.
export async function getCourseById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    const course = await Course.findById(req.params.id).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      course
    });
  } catch (error) {
    next(error);
  }
}

// Create a new course with learning resources.
export async function createCourse(req, res, next) {
  try {
    const {
      title,
      department,
      description = '',
      instructor = '',
      duration = '',
      totalLessons,
      resources = []
    } = req.body || {};

    // Validate required fields.
    if (
      typeof title !== 'string' ||
      !title.trim() ||
      title.trim().length > 160
    ) {
      return res.status(400).json({
        success: false,
        message: 'Course title is required and must be at most 160 characters'
      });
    }

    if (
      typeof department !== 'string' ||
      !department.trim() ||
      department.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Department is required and must be at most 100 characters'
      });
    }

    // Validate optional text fields.
    if (
      typeof description !== 'string' ||
      description.length > 5000 ||
      typeof instructor !== 'string' ||
      instructor.trim().length > 100 ||
      typeof duration !== 'string' ||
      duration.trim().length > 50
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course description, instructor or duration'
      });
    }

    if (
      totalLessons !== undefined &&
      (!Number.isInteger(totalLessons) ||
        totalLessons < 1 ||
        totalLessons > 500)
    ) {
      return res.status(400).json({
        success: false,
        message: 'totalLessons must be between 1 and 500'
      });
    }

    if (!Array.isArray(resources) || resources.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Resources must be an array containing at most 100 items'
      });
    }

    const course = await Course.create({
      title: title.trim(),
      department: department.trim(),
      description: description.trim(),
      instructor: instructor.trim(),
      duration: duration.trim(),
      ...(totalLessons !== undefined ? { totalLessons } : {}),
      resources,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    next(error);
  }
}

// Update course details and learning resources.
export async function updateCourse(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    const allowed = [
      'title',
      'department',
      'description',
      'instructor',
      'duration',
      'totalLessons',
      'status',
      'resources'
    ];

    const update = {};

    for (const key of allowed) {
      if (req.body?.[key] !== undefined) {
        update[key] = req.body[key];
      }
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({
        success: false,
        message: 'No editable fields supplied'
      });
    }

    // Validate text fields before trimming.
    const textLimits = {
      title: 160,
      department: 100,
      description: 5000,
      instructor: 100,
      duration: 50
    };

    for (const [key, maxLength] of Object.entries(textLimits)) {
      if (update[key] !== undefined) {
        if (
          typeof update[key] !== 'string' ||
          update[key].trim().length > maxLength
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${key} value`
          });
        }

        update[key] = update[key].trim();
      }
    }

    if (
      update.title !== undefined &&
      !update.title
    ) {
      return res.status(400).json({
        success: false,
        message: 'Course title cannot be empty'
      });
    }

    if (
      update.department !== undefined &&
      !update.department
    ) {
      return res.status(400).json({
        success: false,
        message: 'Department cannot be empty'
      });
    }

    if (
      update.totalLessons !== undefined &&
      (!Number.isInteger(update.totalLessons) ||
        update.totalLessons < 1 ||
        update.totalLessons > 500)
    ) {
      return res.status(400).json({
        success: false,
        message: 'totalLessons must be between 1 and 500'
      });
    }

    if (
      update.resources !== undefined &&
      (!Array.isArray(update.resources) ||
        update.resources.length > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course resources'
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      update,
      {
        new: true,
        runValidators: true
      }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    next(error);
  }
}

// Delete a course and its related records.
export async function deleteCourse(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await Promise.all([
      Enrollment.deleteMany({ course: course._id }),
      LearningProgress.deleteMany({ course: course._id })
    ]);

    await Course.deleteOne({ _id: course._id });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
