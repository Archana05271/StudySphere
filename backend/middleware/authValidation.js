
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+()\-\s]{7,15}$/;

// Validate student registration input.
export function validateRegistration(req, res, next) {
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
      message: 'Phone number must be 7–15 characters'
    });
  }

  next();
}

// Validate student login input.
export function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  if (
    typeof email !== 'string' ||
    !emailPattern.test(email.trim()) ||
    typeof password !== 'string' ||
    !password ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    return res.status(400).json({
      success: false,
      message: 'A valid email and password are required'
    });
  }

  next();
}
