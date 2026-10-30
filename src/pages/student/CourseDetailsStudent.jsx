
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import StatusMessage from '../../components/StatusMessage';
import { apiErrorMessage } from '../../utils/ui';

const resourceLabels = {
  video: '🎥 Video',
  pdf: '📄 PDF / Notes',
  quiz: '📝 MCQ / Quiz'
};

export default function CourseDetailsStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    enrollments,
    loading,
    error,
    updateProgress,
    unenroll
  } = useCourses();

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const enrollment = enrollments.find(
    (e) => e.course?._id === id
  );

  const run = async (fn) => {
    setBusy(true);
    setActionError('');

    try {
      await fn();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const completeLesson = () =>
    run(() =>
      updateProgress(
        id,
        enrollment.progress.completedLessons + 1
      )
    );

  const completeAll = () =>
    run(async () => {
      await updateProgress(id, enrollment.progress.totalLessons);

      navigate(
        `/student/certificate?course=${encodeURIComponent(
          enrollment.course.title
        )}`
      );
    });

  const leave = () =>
    window.confirm(
      'Unenroll from this course? Your progress will be lost.'
    ) &&
    run(async () => {
      await unenroll(id);
      navigate('/student/my-courses');
    });

  return (
    <StatusMessage
      loading={loading}
      error={error}
      empty={!enrollment}
      emptyText="You are not enrolled in this course."
    >
      {enrollment && (() => {
        const { course, progress, status } = enrollment;
        const finished = status === 'completed';
        const resources = Array.isArray(course.resources)
          ? course.resources
          : [];

        return (
          <div style={{ maxWidth: 800 }}>
            <p>
              <Link to="/student/my-courses">
                ← My courses
              </Link>
            </p>

            <header style={{ margin: '1rem 0 1.5rem' }}>
              <h1>{course.title}</h1>

              <p className="muted">
                {course.department}
                {course.instructor ? ` · ${course.instructor}` : ''}
                {course.duration ? ` · ${course.duration}` : ''}
              </p>

              <p style={{ marginTop: '.75rem' }}>
                {course.description}
              </p>
            </header>

            {actionError && (
              <div className="alert error" role="alert">
                {actionError}
              </div>
            )}

            {/* Learning Resources */}
            <section
              className="workspace-main"
              style={{ marginBottom: '1.5rem' }}
            >
              <h2>📚 Learning Resources</h2>

              <p className="muted">
                Access your course videos, notes and quizzes below.
              </p>

              {resources.length === 0 ? (
                <p className="muted">
                  No learning resources have been added yet.
                </p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gap: '12px',
                    marginTop: '1rem'
                  }}
                >
                  {resources.map((resource, index) => (
                    <div
                      key={resource._id || index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                        padding: '14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    >
                      <div>
                        <strong>
                          {resourceLabels[resource.type] || '📎 Resource'}
                        </strong>

                        <p style={{ margin: '5px 0 0' }}>
                          {resource.title}
                        </p>
                      </div>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        Open resource ↗
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Student Progress */}
            <div className="workspace-main">
              <h3>Your progress</h3>

              <div
                className={`progress-bar${finished ? ' done' : ''}`}
              >
                <div
                  style={{
                    width: `${progress.progressPercentage}%`
                  }}
                />
              </div>

              <p className="muted">
                {progress.completedLessons} of {progress.totalLessons} lessons
                completed ({progress.progressPercentage}%)
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '.75rem',
                  flexWrap: 'wrap',
                  marginTop: '1rem'
                }}
              >
                {finished ? (
                  <Link
                    className="btn btn-primary"
                    to={`/student/certificate?course=${encodeURIComponent(
                      course.title
                    )}`}
                  >
                    🎓 View certificate
                  </Link>
                ) : (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={completeLesson}
                      disabled={busy}
                    >
                      ✔ Complete next lesson
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={completeAll}
                      disabled={busy}
                    >
                      Mark all complete &amp; get certificate
                    </button>
                  </>
                )}

                <button
                  className="btn btn-danger"
                  onClick={leave}
                  disabled={busy}
                >
                  Unenroll
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </StatusMessage>
  );
}
