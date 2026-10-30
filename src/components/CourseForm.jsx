
import React, { useState } from 'react';
import FormField from './FormField';
import { apiErrorMessage } from '../utils/ui';

const blank = {
  title: '',
  department: '',
  description: '',
  instructor: '',
  duration: '',
  totalLessons: 10,
  resources: []
};

const resourceTypes = [
  { value: 'video', label: 'Video' },
  { value: 'pdf', label: 'PDF / Notes' },
  { value: 'quiz', label: 'MCQ / Quiz' }
];

const createResource = () => ({
  type: 'video',
  title: '',
  url: ''
});

export default function CourseForm({
  initial = blank,
  submitLabel,
  onSubmit
}) {
  const [values, setValues] = useState({
    ...blank,
    ...initial,
    resources: Array.isArray(initial.resources)
      ? initial.resources.map((resource) => ({
          type: resource.type || 'video',
          title: resource.title || '',
          url: resource.url || ''
        }))
      : []
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setValues((v) => ({
      ...v,
      [e.target.name]: e.target.value
    }));

    setErrors((er) => ({
      ...er,
      [e.target.name]: ''
    }));
  };

  // Add a new learning resource.
  const addResource = () => {
    setValues((v) => ({
      ...v,
      resources: [...v.resources, createResource()]
    }));
  };

  // Update a resource field.
  const updateResource = (index, field, value) => {
    setValues((v) => ({
      ...v,
      resources: v.resources.map((resource, i) =>
        i === index
          ? { ...resource, [field]: value }
          : resource
      )
    }));
  };

  // Remove a resource.
  const removeResource = (index) => {
    setValues((v) => ({
      ...v,
      resources: v.resources.filter((_, i) => i !== index)
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const found = {};

    if (!values.title.trim()) {
      found.title = 'Title is required';
    } else if (values.title.trim().length > 160) {
      found.title = 'Title must be at most 160 characters';
    }

    if (!values.department.trim()) {
      found.department = 'Department is required';
    }

    const lessons = Number(values.totalLessons);

    if (!Number.isInteger(lessons) || lessons < 1 || lessons > 500) {
      found.totalLessons = 'Enter a whole number between 1 and 500';
    }

    // Validate learning resources.
    values.resources.forEach((resource, index) => {
      if (!resource.title.trim()) {
        found[`resourceTitle${index}`] = 'Resource title is required';
      }

      if (!resource.url.trim()) {
        found[`resourceUrl${index}`] = 'Resource URL is required';
      } else {
        try {
          const parsedUrl = new URL(resource.url.trim());

          if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            throw new Error('Invalid URL');
          }
        } catch {
          found[`resourceUrl${index}`] = 'Enter a valid HTTP or HTTPS URL';
        }
      }
    });

    setErrors(found);

    if (Object.keys(found).length) return;

    setLoading(true);
    setServerError('');

    try {
      await onSubmit({
        title: values.title.trim(),
        department: values.department.trim(),
        description: values.description.trim(),
        instructor: values.instructor.trim(),
        duration: values.duration.trim(),
        totalLessons: lessons,
        resources: values.resources.map((resource) => ({
          type: resource.type,
          title: resource.title.trim(),
          url: resource.url.trim()
        }))
      });
    } catch (err) {
      setServerError(apiErrorMessage(err, 'Could not save the course'));
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="workspace-main"
      style={{ maxWidth: 640 }}
    >
      {serverError && (
        <div className="alert error" role="alert">
          {serverError}
        </div>
      )}

      <FormField
        label="Course Title"
        name="title"
        value={values.title}
        onChange={onChange}
        error={errors.title}
        placeholder="e.g. Full Stack Web Development"
      />

      <FormField
        label="Department"
        name="department"
        value={values.department}
        onChange={onChange}
        error={errors.department}
        placeholder="Computer Science"
      />

      <FormField
        label="Instructor"
        name="instructor"
        value={values.instructor}
        onChange={onChange}
        placeholder="Dr. Ramesh Kumar"
      />

      <FormField
        label="Duration"
        name="duration"
        value={values.duration}
        onChange={onChange}
        placeholder="8 weeks"
      />

      <FormField
        label="Number of lessons"
        name="totalLessons"
        type="number"
        min="1"
        max="500"
        value={values.totalLessons}
        onChange={onChange}
        error={errors.totalLessons}
      />

      <FormField
        as="textarea"
        rows="4"
        label="Description"
        name="description"
        value={values.description}
        onChange={onChange}
      />

      {/* Learning Resources Section */}
      <section
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}
      >
        <h3 style={{ marginBottom: '6px' }}>
          Learning Resources ({values.resources.length})
        </h3>

        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Add video, PDF and MCQ/quiz links. Students can access
          them on the course page.
        </p>

        {values.resources.map((resource, index) => (
          <div
            key={index}
            style={{
              display: 'grid',
              gridTemplateColumns: '110px 1fr',
              gap: '10px',
              marginTop: '12px',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}
          >
            <label>
              <span style={{ fontSize: '12px' }}>Resource type</span>
              <select
                value={resource.type}
                onChange={(e) =>
                  updateResource(index, 'type', e.target.value)
                }
                style={{ width: '100%', padding: '9px' }}
              >
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <label style={{ fontSize: '12px' }}>
                Resource title
              </label>
              <input
                type="text"
                value={resource.title}
                placeholder="e.g. Lecture 1"
                onChange={(e) =>
                  updateResource(index, 'title', e.target.value)
                }
                style={{ width: '100%', padding: '9px' }}
              />
              {errors[`resourceTitle${index}`] && (
                <small style={{ color: 'red' }}>
                  {errors[`resourceTitle${index}`]}
                </small>
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px' }}>
                Resource URL
              </label>
              <input
                type="url"
                value={resource.url}
                placeholder="https://example.com/resource"
                onChange={(e) =>
                  updateResource(index, 'url', e.target.value)
                }
                style={{ width: '100%', padding: '9px' }}
              />
              {errors[`resourceUrl${index}`] && (
                <small style={{ color: 'red' }}>
                  {errors[`resourceUrl${index}`]}
                </small>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeResource(index)}
              className="btn"
              style={{
                gridColumn: '1 / -1',
                color: '#dc2626'
              }}
            >
              Remove resource
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addResource}
          className="btn"
          style={{ marginTop: '12px' }}
        >
          + Add resource
        </button>
      </section>

      <button
        className="btn btn-primary"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
