import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FormField from '../../components/FormField';
import { useAuth } from '../../context/AuthContext';
import { validateLoginForm } from '../../utils/validation';
import { apiErrorMessage } from '../../utils/ui';

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
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
    if (Object.keys(found).length) return;
    setLoading(true);
    try {
      const user = await login(values);
      if (user.role !== 'admin') {
        logout();
        throw new Error('This account is not an administrator account.');
      }
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setServerError(apiErrorMessage(err, 'Invalid admin email or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-wrap">
        <form className="auth-card admin" onSubmit={onSubmit} noValidate>
          <h2>Admin Sign In</h2>
          <p className="sub">Access the administrative command console.</p>
          {serverError && <div className="alert error" role="alert">{serverError}</div>}
          <FormField label="Admin Email" name="email" type="email" placeholder="admin@example.com" value={values.email} onChange={onChange} error={errors.email} autoComplete="email" />
          <FormField label="Password" name="password" type="password" placeholder="••••••••" value={values.password} onChange={onChange} error={errors.password} autoComplete="current-password" />
          <button type="submit" className="btn btn-dark btn-block" disabled={loading}>{loading ? 'Authenticating…' : 'Access Console'}</button>
          <p className="muted" style={{ marginTop: '1.25rem', textAlign: 'center' }}><Link to="/auth/login">← Student login</Link></p>
        </form>
      </main>
      <Footer />
    </>
  );
}
