
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import Material from '../models/Material.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store uploaded files in backend/uploads
const uploadDirectory = path.resolve(__dirname, '../uploads');

// Admin: Upload course material
export async function uploadMaterial(req, res, next) {
  try {
    const { title, courseId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a file to upload'
      });
    }

    if (!title || !courseId) {
      await fs.unlink(req.file.path).catch(() => {});

      return res.status(400).json({
        success: false,
        message: 'Title and course are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      await fs.unlink(req.file.path).catch(() => {});

      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      await fs.unlink(req.file.path).catch(() => {});

      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const material = await Material.create({
      title: title.trim(),
      course: courseId,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Material uploaded successfully',
      material
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    next(error);
  }
}

// Admin: Get all uploaded materials
export async function getAllMaterials(req, res, next) {
  try {
    const materials = await Material.find()
      .populate('course', 'title department')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      materials
    });
  } catch (error) {
    next(error);
  }
}

// Student: Get materials for enrolled courses
export async function getStudentMaterials(req, res, next) {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
      status: { $in: ['active', 'completed'] }
    }).select('course');

    const courseIds = enrollments.map(
      (enrollment) => enrollment.course
    );

    const materials = await Material.find({
      course: { $in: courseIds }
    })
      .populate('course', 'title department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      materials
    });
  } catch (error) {
    next(error);
  }
}

// Student/Admin: Download a material
export async function downloadMaterial(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid material ID'
      });
    }

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Students must be enrolled in the material's course.
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: material.course,
        status: { $in: ['active', 'completed'] }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
    }

    const filePath = path.resolve(
      uploadDirectory,
      material.storedName
    );

    // Prevent path traversal
    if (path.dirname(filePath) !== uploadDirectory) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file path'
      });
    }

    await fs.access(filePath);

    res.download(filePath, material.originalName);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        message: 'Uploaded file not found on server'
      });
    }

    next(error);
  }
}

// Admin: Delete a material
export async function deleteMaterial(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid material ID'
      });
    }

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    const filePath = path.resolve(
      uploadDirectory,
      material.storedName
    );

    // Delete the physical file
    await fs.unlink(filePath).catch((error) => {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    });

    // Delete material metadata from MongoDB
    await Material.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
