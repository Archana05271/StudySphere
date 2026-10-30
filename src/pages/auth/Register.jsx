import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FormField from '../../components/FormField';
import { useAuth } from '../../context/AuthContext';
import { validateRegisterForm } from '../../utils/validation';
import { apiErrorMessage } from '../../utils/ui';

const empty = { name: '', email: '', phone: '', department: '', password: '', confirmPassword: '' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState(empty);
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
    const found = validateRegisterForm(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = values;
      await register(payload);
      setSuccess('Account created successfully! Redirecting to login…');
      setTimeout(() => navigate('/auth/login'), 1200);
    } catch (err) {
      setServerError(apiErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-wrap">
        <form className="auth-card" onSubmit={onSubmit} noValidate>
          <h2>Join StudySphere</h2>
          <p className="sub">Create your student account for the learning platform.</p>
          {serverError && <div className="alert error" role="alert">{serverError}</div>}
          {success && <div className="alert success" role="status">{success}</div>}
          <FormField label="Full Name" name="name" placeholder="John Doe" value={values.name} onChange={onChange} error={errors.name} autoComplete="name" />
          <FormField label="Email Address" name="email" type="email" placeholder="john@example.com" value={values.email} onChange={onChange} error={errors.email} autoComplete="email" />
          <FormField label="Phone (optional)" name="phone" type="tel" placeholder="+91 98765 43210" value={values.phone} onChange={onChange} error={errors.phone} autoComplete="tel" />
          <FormField label="Department" name="department" placeholder="Computer Science" value={values.department} onChange={onChange} error={errors.department} />
          <FormField label="Password" name="password" type="password" placeholder="At least 8 characters" value={values.password} onChange={onChange} error={errors.password} autoComplete="new-password" />
          <FormField label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat password" value={values.confirmPassword} onChange={onChange} error={errors.confirmPassword} autoComplete="new-password" />
          <button type="submit" className="btn btn-primary btn-block" disabled={loading || Boolean(success)}>{loading ? 'Creating Account…' : 'Register'}</button>
          <p className="muted" style={{ marginTop: '1.25rem', textAlign: 'center' }}>Already registered? <Link to="/auth/login">Sign in</Link></p>
        </form>
      </main>
      <Footer />
    </>
  );
}
