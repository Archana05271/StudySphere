
import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { useCourses } from '../../context/CourseContext';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  'pdf', 'ppt', 'pptx', 'doc', 'docx',
  'zip', 'txt', 'xlsx', 'csv'
];

export default function ManageMaterials() {
  const { courses, loading: coursesLoading } = useCourses();

  const [materials, setMaterials] = useState([]);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load all uploaded materials
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get('/materials');

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

  // Select and validate a file
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setFile(null);
    setError('');
    setSuccess('');

    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size must not exceed 20 MB.');
      event.target.value = '';
      return;
    }

    const extension = selectedFile.name
      .split('.')
      .pop()
      .toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError('Unsupported file format. Please select a supported file.');
      event.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  // Upload a new course material
  const handleUpload = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Please enter a material title.');
      return;
    }

    if (!courseId) {
      setError('Please select a course.');
      return;
    }

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('courseId', courseId);
    formData.append('file', file);

    try {
      setUploading(true);

      // Axios will set the multipart boundary automatically.
      await apiClient.post('/materials', formData);

      setTitle('');
      setCourseId('');
      setFile(null);

      const fileInput = document.getElementById('material-file');
      if (fileInput) fileInput.value = '';

      setSuccess('Course material uploaded successfully!');

      await fetchMaterials();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to upload course material.'
      );
    } finally {
      setUploading(false);
    }
  };

  // Download a material
  const handleDownload = async (material) => {
    try {
      setDownloadingId(material._id);
      setError('');

      const response = await apiClient.get(
        `/materials/${material._id}/download`,
        { responseType: 'blob' }
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
      setError('Unable to download this material.');
    } finally {
      setDownloadingId('');
    }
  };

  // Delete a material
  const handleDelete = async (material) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${material.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(material._id);
      setError('');
      setSuccess('');

      await apiClient.delete(`/materials/${material._id}`);

      setMaterials((previous) =>
        previous.filter((item) => item._id !== material._id)
      );

      setSuccess('Material deleted successfully!');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to delete material.'
      );
    } finally {
      setDeletingId('');
    }
  };

  // Convert bytes into a readable file size
  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';

    return bytes >= 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="manage-materials-page">
      <div className="page-header">
        <h1>Manage Course Materials</h1>
        <p>Upload and manage learning resources for your courses.</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      {/* Upload form */}
      <section className="material-upload-section">
        <h2>Upload New Material</h2>

        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label htmlFor="material-title">
              Material Title
            </label>

            <input
              id="material-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter material title"
              maxLength={150}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="material-course">
              Select Course
            </label>

            <select
              id="material-course"
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              required
              disabled={coursesLoading}
            >
              <option value="">
                {coursesLoading ? 'Loading courses...' : 'Select a course'}
              </option>

              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>

            {!coursesLoading && courses.length === 0 && (
              <p>No courses available. Please add a course first.</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="material-file">
              Select File
            </label>

            <input
              id="material-file"
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.txt,.xlsx,.csv"
              onChange={handleFileChange}
              required
            />

            <small>
              Supported formats: PDF, PPT, PPTX, DOC, DOCX, ZIP,
              TXT, XLSX and CSV. Maximum size: 20 MB.
            </small>

            {file && (
              <p>
                Selected: {file.name} ({formatSize(file.size)})
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading || coursesLoading || courses.length === 0}
          >
            {uploading ? 'Uploading...' : 'Upload Material'}
          </button>
        </form>
      </section>

      {/* Uploaded materials */}
      <section className="material-list-section">
        <div className="section-heading">
          <h2>Uploaded Materials</h2>

          <button
            type="button"
            onClick={fetchMaterials}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <p>Loading materials...</p>
        ) : materials.length === 0 ? (
          <p>No course materials uploaded yet.</p>
        ) : (
          <div className="materials-table-wrapper">
            <table className="materials-table">
              <thead>
                <tr>
                  <th>Material Title</th>
                  <th>Course</th>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Uploaded Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {materials.map((material) => (
                  <tr key={material._id}>
                    <td>{material.title}</td>

                    <td>
                      {material.course?.title || 'Unknown Course'}
                    </td>

                    <td>{material.originalName}</td>

                    <td>{formatSize(material.size)}</td>

                    <td>
                      {material.createdAt
                        ? new Date(material.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => handleDownload(material)}
                        disabled={downloadingId === material._id}
                      >
                        {downloadingId === material._id
                          ? 'Downloading...'
                          : 'Download'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(material)}
                        disabled={deletingId === material._id}
                      >
                        {deletingId === material._id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
