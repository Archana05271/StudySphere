import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FormField from '../../components/FormField';
import { useAuth } from '../../context/AuthContext';
import { validateLoginForm } from '../../utils/validation';
import { apiErrorMessage } from '../../utils/ui';

export default function StudentLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const found = validateLoginForm(values);
    setErrors(found);
    if (Object.keys(found).length) return; // block submission when invalid
    setLoading(true);
    try {
      const user = await login(values);
      if (user.role !== 'student') {
        logout();
        throw new Error('This is an administrator account. Please use the admin portal.');
      }
      setSuccess('Login successful! Redirecting…');
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setServerError(apiErrorMessage(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-wrap">
        <form className="auth-card" onSubmit={onSubmit} noValidate>
          <h2>Student Sign In</h2>
          <p className="sub">Enter your credentials to access your courses.</p>
          {serverError && <div className="alert error" role="alert">{serverError}</div>}
          {success && <div className="alert success" role="status">{success}</div>}
          <FormField label="Email Address" name="email" type="email" placeholder="student@example.com" value={values.email} onChange={onChange} error={errors.email} autoComplete="email" />
          <FormField label="Password" name="password" type="password" placeholder="••••••••" value={values.password} onChange={onChange} error={errors.password} autoComplete="current-password" />
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Signing In…' : 'Sign In'}</button>
          <p className="muted" style={{ marginTop: '1.25rem', textAlign: 'center' }}>No account? <Link to="/auth/register">Register here</Link></p>
          <p className="muted" style={{ marginTop: '.5rem', textAlign: 'center' }}><Link to="/auth/forgot-password">Forgot password?</Link></p>
        </form>
      </main>
      <Footer />
    </>
  );
}
