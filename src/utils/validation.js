// Reusable client-side validation (Task 4/5). Every validator returns an error string or ''.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+()\-\s]{7,15}$/;

export const validateRequired = (value, label = 'This field') => (String(value ?? '').trim() ? '' : `${label} is required`);
export const validateName = (v) => (!v.trim() ? 'Full name is required' : v.trim().length < 2 ? 'Name must be at least 2 characters' : v.trim().length > 100 ? 'Name must be at most 100 characters' : '');
export const validateEmail = (v) => (!v.trim() ? 'Email is required' : EMAIL.test(v.trim()) ? '' : 'Enter a valid email address (e.g. name@example.com)');
export const validatePassword = (v) => (!v ? 'Password is required' : v.length < 8 ? 'Password must be at least 8 characters' : v.length > 72 ? 'Password must be at most 72 characters' : '');
export const validatePhone = (v) => (!v.trim() ? '' : PHONE.test(v.trim()) ? '' : 'Phone must be 7–15 digits (spaces, +, - and () allowed)');
export const validateConfirm = (password, confirm) => (!confirm ? 'Please confirm your password' : password === confirm ? '' : 'Passwords do not match');

const clean = (errors) => Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));

export const validateLoginForm = ({ email, password }) =>
  clean({ email: validateEmail(email), password: password ? '' : 'Password is required' });

export const validateRegisterForm = ({ name, email, phone, department, password, confirmPassword }) =>
  clean({
    name: validateName(name),
    email: validateEmail(email),
    phone: validatePhone(phone),
    department: validateRequired(department, 'Department'),
    password: validatePassword(password),
    confirmPassword: validateConfirm(password, confirmPassword)
  });
