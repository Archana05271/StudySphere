
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import LearningProgress from '../models/LearningProgress.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+()\-\s]{7,15}$/;

// Get all students.
export async function getStudents(req, res, next) {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email phone department createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    next(error);
  }
}

// Get a single student by ID.
export async function getStudentById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    const student = await User.findOne({
      _id: req.params.id,
      role: 'student'
    })
      .select('name email phone department role createdAt')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      student
    });
  } catch (error) {
    next(error);
  }
}

// Create a new student.
export async function createStudent(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      department = '',
      phone = ''
    } = req.body || {};

    // Validate name.
    if (
      typeof name !== 'string' ||
      name.trim().length < 2 ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name must be 2–100 characters'
      });
    }

    // Validate email.
    if (
      typeof email !== 'string' ||
      !emailPattern.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required'
      });
    }

    // Validate password.
    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters and at most 72 bytes'
      });
    }

    // Validate department.
    if (
      typeof department !== 'string' ||
      department.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Department must be text of at most 100 characters'
      });
    }

    // Validate phone number.
    if (
      typeof phone !== 'string' ||
      (phone.trim() && !phonePattern.test(phone.trim()))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is invalid'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether email already exists.
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Hash password before saving.
    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      department: department.trim(),
      phone: phone.trim(),
      role: 'student'
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: {
        id: String(student._id),
        name: student.name,
        email: student.email,
        phone: student.phone,
        department: student.department,
        role: student.role
      }
    });
  } catch (error) {
    next(error);
  }
}

// Update student details.
export async function updateStudent(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    const { name, email, department, phone } = req.body || {};
    const update = {};

    // Validate name.
    if (name !== undefined) {
      if (
        typeof name !== 'string' ||
        name.trim().length < 2 ||
        name.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: 'Name must be 2–100 characters'
        });
      }

      update.name = name.trim();
    }

    // Validate email.
    if (email !== undefined) {
      if (
        typeof email !== 'string' ||
        !emailPattern.test(email.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: 'A valid email address is required'
        });
      }

      update.email = email.trim().toLowerCase();
    }

    // Validate department.
    if (department !== undefined) {
      if (
        typeof department !== 'string' ||
        department.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: 'Department must be text of at most 100 characters'
        });
      }

      update.department = department.trim();
    }

    // Validate phone number.
    if (phone !== undefined) {
      if (typeof phone !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Phone number is invalid'
        });
      }

      const normalizedPhone = phone.trim();

      if (
        normalizedPhone &&
        !phonePattern.test(normalizedPhone)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is invalid'
        });
      }

      update.phone = normalizedPhone;
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({
        success: false,
        message: 'No editable fields supplied'
      });
    }

    const student = await User.findOne({
      _id: req.params.id,
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Apply only permitted fields.
    student.set(update);
    await student.save();

    res.json({
      success: true,
      message: 'Student updated successfully',
      student: {
        id: String(student._id),
        name: student.name,
        email: student.email,
        phone: student.phone,
        department: student.department,
        role: student.role,
        createdAt: student.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

// Delete a student and related records.
export async function deleteStudent(req, res, next) {
  let session;

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    session = await mongoose.startSession();

    let studentFound = false;

    await session.withTransaction(async () => {
      const student = await User.findOne({
        _id: req.params.id,
        role: 'student'
      })
        .select('_id')
        .session(session);

      if (!student) {
        return;
      }

      studentFound = true;

      await Enrollment.deleteMany(
        { student: student._id },
        { session }
      );

      await LearningProgress.deleteMany(
        { student: student._id },
        { session }
      );

      await User.deleteOne(
        { _id: student._id },
        { session }
      );
    });

    if (!studentFound) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
