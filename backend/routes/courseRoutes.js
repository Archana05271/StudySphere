
import express from 'express';

import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} from '../controllers/courseController.js';

import {
  authenticate,
  requireRoles
} from '../middleware/authMiddleware.js';

import {
  validateCourse
} from '../middleware/courseValidation.js';

const router = express.Router();

// Get all courses.
router.get('/', getAllCourses);

// Get a single course.
router.get('/:id', getCourseById);

// Create a course with learning resources.
router.post(
  '/',
  authenticate,
  requireRoles('admin'),
  validateCourse,
  createCourse
);

// Update course details and learning resources.
router.put(
  '/:id',
  authenticate,
  requireRoles('admin'),
  validateCourse,
  updateCourse
);

// Delete a course.
router.delete(
  '/:id',
  authenticate,
  requireRoles('admin'),
  deleteCourse
);

export default router;
