import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Certificate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseTitle = searchParams.get('course') || 'Full Stack Web Development';
  const { user } = useAuth();
  const studentName = user?.name || 'Student';

  return (
    <div style={{ padding: '2rem', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button 
        onClick={() => navigate('/student/my-courses')} 
        style={{ alignSelf: 'flex-start', marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px' }}
      >
        ← Back to My Courses
      </button>

      <div 
        id="printable-certificate"
        style={{
          width: '100%',
          maxWidth: '800px',
          padding: '3rem',
          border: '10px solid #2563eb',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h1 style={{ fontSize: '2.5rem', color: '#1e293b', letterSpacing: '1px', marginBottom: '0.5rem' }}>
          CERTIFICATE OF COMPLETION
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', fontStyle: 'italic' }}>
          This is proudly presented to
        </p>

        <h2 style={{ fontSize: '2.2rem', color: '#2563eb', margin: '1.5rem 0', borderBottom: '2px solid #e2e8f0', display: 'inline-block', paddingBottom: '0.5rem' }}>
          {studentName}
        </h2>

        <p style={{ color: '#334155', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
          For successfully completing all requirements, coursework, and assessments for:
        </p>
        
        <h3 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '1rem 0' }}>
          {courseTitle}
        </h3>

        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #94a3b8', width: '180px', marginBottom: '0.5rem' }}></div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>StudySphere Platform</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #94a3b8', width: '180px', marginBottom: '0.5rem' }}></div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Date: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => window.print()} 
        style={{
          marginTop: '2rem',
          padding: '0.8rem 2rem',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        🖨️ Print / Download Certificate
      </button>
    </div>
  );
};

export default Certificate;