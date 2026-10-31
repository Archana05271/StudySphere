
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FormField from '../../components/FormField';
import { authApi } from '../../api/authApi';
import { apiErrorMessage } from '../../utils/ui';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: ''
    }));

    setServerError('');
    setSuccess('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setServerError('');
    setSuccess('');

    const newErrors = {};

    if (!values.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!values.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (values.newPassword.length < 8) {
      newErrors.newPassword = 'Password must contain at least 8 characters';
    } else if (
      new TextEncoder().encode(values.newPassword).length > 72
    ) {
      newErrors.newPassword = 'Password must not exceed 72 bytes';
    }

    if (!values.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (values.newPassword !== values.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await authApi.forgotPassword({
        email: values.email.trim(),
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });

      setSuccess('Password reset successfully! You can now sign in.');

      setValues({
        email: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (err) {
      setServerError(
        apiErrorMessage(err, 'Unable to reset password. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="auth-wrap">
        <form
          className="auth-card"
          onSubmit={onSubmit}
          noValidate
        >
          <h2>Forgot Password</h2>

          <p className="sub">
            Enter your registered email and create a new password.
          </p>

          {serverError && (
            <div className="alert error" role="alert">
              {serverError}
            </div>
          )}

          {success && (
            <div className="alert success" role="status">
              {success}
              <p style={{ marginTop: '0.75rem' }}>
                <Link to="/auth/login">Go to Student Login</Link>
              </p>
            </div>
          )}

          <FormField
            label="Registered Email Address"
            name="email"
            type="email"
            placeholder="student@example.com"
            value={values.email}
            onChange={onChange}
            error={errors.email}
            autoComplete="email"
          />

          <FormField
            label="New Password"
            name="newPassword"
            type="password"
            placeholder="Enter new password"
            value={values.newPassword}
            onChange={onChange}
            error={errors.newPassword}
            autoComplete="new-password"
          />

          <FormField
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={values.confirmPassword}
            onChange={onChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Resetting Password…' : 'Reset Password'}
          </button>

          <p
            className="muted"
            style={{
              marginTop: '1.25rem',
              textAlign: 'center'
            }}
          >
            Remember your password?{' '}
            <Link to="/auth/login">Sign In</Link>
          </p>
        </form>
      </main>

      <Footer />
    </>
  );
}
