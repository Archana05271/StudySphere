
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import authenticate, {
  requireRoles
} from '../middleware/authMiddleware.js';

import {
  uploadMaterial,
  getAllMaterials,
  getStudentMaterials,
  downloadMaterial,
  deleteMaterial
} from '../controllers/materialController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.resolve(__dirname, '../uploads');

// Create uploads folder if it does not exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  }
});

// Allowed file formats
const allowedExtensions = [
  '.pdf',
  '.ppt',
  '.pptx',
  '.doc',
  '.docx',
  '.zip',
  '.txt',
  '.xlsx',
  '.csv'
];

const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new Error('Unsupported file format')
      );
    }

    cb(null, true);
  }
});

// All routes require authentication
router.use(authenticate);

// Student: Get materials for enrolled courses
router.get(
  '/student',
  requireRoles('student'),
  getStudentMaterials
);

// Admin: Get all materials
router.get(
  '/',
  requireRoles('admin'),
  getAllMaterials
);

// Admin: Upload material
router.post(
  '/',
  requireRoles('admin'),
  upload.single('file'),
  uploadMaterial
);

// Student/Admin: Download material
router.get(
  '/:id/download',
  requireRoles('student', 'admin'),
  downloadMaterial
);

// Admin: Delete material
router.delete(
  '/:id',
  requireRoles('admin'),
  deleteMaterial
);

export default router;
