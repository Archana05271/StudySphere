
import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);

  // Fetch materials from backend
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get('/materials/student');

      setMaterials(response.data.materials || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load course materials.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Convert file size into readable format
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Download material from backend
  const handleDownload = async (material) => {
    try {
      setDownloading(material._id);
      setError('');

      const response = await apiClient.get(
        `/materials/${material._id}/download`,
        {
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], {
        type: material.mimeType || 'application/octet-stream'
      });

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = material.originalName || material.title;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError('Unable to download this material. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header
        className="content-header"
        style={{ marginBottom: '2rem' }}
      >
        <div>
          <h1>Course Assets & Downloads</h1>
          <p style={{ color: '#64748b' }}>
            Access downloadable guides, project files, and course resources.
          </p>
        </div>
      </header>

      <div
        className="workspace-main"
        style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
      >
        <h2 style={{ marginBottom: '1rem', color: '#0f172a' }}>
          Available Materials
        </h2>

        {loading && (
          <p style={{ color: '#64748b' }}>
            Loading course materials...
          </p>
        )}

        {error && (
          <div
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              background: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '6px'
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && materials.length === 0 && (
          <p style={{ color: '#64748b' }}>
            No course materials are available yet.
          </p>
        )}

        {!loading && materials.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}
          >
            {materials.map((material) => (
              <li
                key={material._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  padding: '1rem 0',
                  borderBottom: '1px solid #e2e8f0'
                }}
              >
                <div>
                  <strong style={{ color: '#0f172a' }}>
                    📄 {material.title}
                  </strong>

                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '0.85rem',
                      marginTop: '0.4rem'
                    }}
                  >
                    {material.originalName}
                    {' · '}
                    {formatFileSize(material.size)}
                  </div>

                  <small style={{ color: '#64748b' }}>
                    Course: {material.course?.title || 'Course'}
                  </small>
                </div>

                <button
                  onClick={() => handleDownload(material)}
                  disabled={downloading === material._id}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    cursor: downloading === material._id
                      ? 'not-allowed'
                      : 'pointer',
                    fontWeight: 600,
                    opacity: downloading === material._id ? 0.6 : 1
                  }}
                >
                  {downloading === material._id
                    ? 'Downloading...'
                    : 'Download'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Materials;
