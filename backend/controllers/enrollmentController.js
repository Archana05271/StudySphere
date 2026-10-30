import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import LearningProgress from '../models/LearningProgress.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpError from '../utils/httpError.js';
import { notifyUser } from '../services/notificationService.js';

const shape = (enrollment, progress) => ({
  id: String(enrollment._id),
  status: enrollment.status,
  enrolledAt: enrollment.enrolledAt,
  course: enrollment.course,
  progress: progress ? {
    completedLessons: progress.completedLessons,
    totalLessons: progress.totalLessons,
    progressPercentage: progress.progressPercentage
  } : { completedLessons: 0, totalLessons: enrollment.course?.totalLessons || 1, progressPercentage: 0 }
});

function validId(id, label = 'ID') {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, `Invalid ${label}`);
}

export const enroll = asyncHandler(async (req, res) => {
  const { courseId } = req.body || {};
  validId(courseId, 'course ID');
  const course = await Course.findById(courseId);
  if (!course) throw httpError(404, 'Course not found');
  if (course.status !== 'active') throw httpError(400, 'This course is not open for enrollment');
  if (await Enrollment.exists({ student: req.user._id, course: course._id })) throw httpError(409, 'You are already enrolled in this course');
  const enrollment = await Enrollment.create({ student: req.user._id, course: course._id });
  await LearningProgress.create({ student: req.user._id, course: course._id, totalLessons: course.totalLessons });
  await notifyUser(req.app.get('io'), req.user._id, { title: 'Enrollment confirmed', message: `You are now enrolled in "${course.title}".`, type: 'success' });
  res.status(201).json({ success: true, message: 'Enrolled successfully', enrollment: shape({ ...enrollment.toObject(), course }, null) });
});

export const myEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate('course').sort({ enrolledAt: -1 }).lean();
  const progress = await LearningProgress.find({ student: req.user._id }).lean();
  const byCourse = new Map(progress.map((p) => [String(p.course), p]));
  const rows = enrollments.filter((e) => e.course).map((e) => shape(e, byCourse.get(String(e.course._id))));
  res.json({ success: true, count: rows.length, enrollments: rows });
});

export const updateProgress = asyncHandler(async (req, res) => {
  validId(req.params.courseId, 'course ID');
  const completed = req.body?.completedLessons;
  if (!Number.isInteger(completed) || completed < 0) throw httpError(400, 'completedLessons must be a non-negative whole number');
  const progress = await LearningProgress.findOne({ student: req.user._id, course: req.params.courseId });
  if (!progress) throw httpError(404, 'You are not enrolled in this course');
  if (completed > progress.totalLessons) throw httpError(400, `completedLessons cannot exceed ${progress.totalLessons}`);
  progress.completedLessons = completed;
  progress.lastAccessedAt = new Date();
  await progress.save();
  let status = 'active';
  if (progress.progressPercentage === 100) {
    status = 'completed';
    const course = await Course.findById(req.params.courseId).lean();
    const enrollment = await Enrollment.findOneAndUpdate({ student: req.user._id, course: req.params.courseId, status: 'active' }, { status }, { new: true });
    if (enrollment) await notifyUser(req.app.get('io'), req.user._id, { title: 'Course completed 🎉', message: `You completed "${course?.title}". Your certificate is ready.`, type: 'success' });
  }
  res.json({ success: true, progress: { completedLessons: progress.completedLessons, totalLessons: progress.totalLessons, progressPercentage: progress.progressPercentage }, status });
});

export const unenroll = asyncHandler(async (req, res) => {
  validId(req.params.courseId, 'course ID');
  const removed = await Enrollment.findOneAndDelete({ student: req.user._id, course: req.params.courseId });
  if (!removed) throw httpError(404, 'You are not enrolled in this course');
  await LearningProgress.deleteOne({ student: req.user._id, course: req.params.courseId });
  res.json({ success: true, message: 'Enrollment removed' });
});

export const allEnrollments = asyncHandler(async (req, res) => {
  const rows = await Enrollment.find().populate('student', 'name email').populate('course', 'title').sort({ enrolledAt: -1 }).lean();
  res.json({ success: true, count: rows.length, enrollments: rows });
});
