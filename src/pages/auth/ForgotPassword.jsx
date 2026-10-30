import React from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return <main className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' }}>
    <section className="auth-form" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '440px', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
      <h1>Password reset</h1>
      <p style={{ margin: '1rem 0' }}>Secure password recovery has not been configured for this project. For your account's safety, this page will not change a password using only an email address.</p>
      <p>Please contact the system administrator to recover access.</p>
      <p style={{ marginTop: '1rem' }}><Link to="/auth/login">Return to student login</Link></p>
    </section>
  </main>;
}
