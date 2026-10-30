
const text = (v, max) =>
  typeof v === 'string' && v.trim().length <= max;

export function validateCourse(req, res, next) {
  const {
    title,
    department,
    description = '',
    instructor = '',
    duration = '',
    totalLessons,
    resources = []
  } = req.body || {};

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

  if (typeof description !== 'string' || description.length > 5000) {
    return res.status(400).json({
      success: false,
      message: 'Description must be text of at most 5000 characters'
    });
  }

  if (!text(instructor, 100) || !text(duration, 50)) {
    return res.status(400).json({
      success: false,
      message: 'Instructor (max 100) and duration (max 50) must be short text'
    });
  }

  if (
    totalLessons !== undefined &&
    (!Number.isInteger(totalLessons) || totalLessons < 1 || totalLessons > 500)
  ) {
    return res.status(400).json({
      success: false,
      message: 'totalLessons must be a whole number between 1 and 500'
    });
  }

  // Validate learning resources.
  if (!Array.isArray(resources) || resources.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Resources must be an array containing at most 100 items'
    });
  }

  const allowedTypes = ['video', 'pdf', 'quiz'];

  for (const resource of resources) {
    if (!resource || typeof resource !== 'object' || Array.isArray(resource)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid learning resource'
      });
    }

    if (!allowedTypes.includes(resource.type)) {
      return res.status(400).json({
        success: false,
        message: 'Resource type must be video, pdf or quiz'
      });
    }

    if (
      typeof resource.title !== 'string' ||
      !resource.title.trim() ||
      resource.title.trim().length > 150
    ) {
      return res.status(400).json({
        success: false,
        message: 'Resource title is required and must be at most 150 characters'
      });
    }

    if (
      typeof resource.url !== 'string' ||
      !resource.url.trim() ||
      resource.url.trim().length > 2048
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid resource URL is required'
      });
    }

    try {
      const parsedUrl = new URL(resource.url.trim());

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Resource URL must be a valid HTTP or HTTPS URL'
      });
    }
  }

  next();
}
