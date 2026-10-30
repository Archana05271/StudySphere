
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: '📚',
    title: 'Course Catalogue',
    text: 'Explore different courses and discover new learning opportunities.',
    number: '01'
  },
  {
    icon: '📈',
    title: 'Track Progress',
    text: 'Monitor your learning journey and earn completion certificates.',
    number: '02'
  },
  {
    icon: '🔔',
    title: 'Live Notifications',
    text: 'Stay informed with instant announcements and updates.',
    number: '03'
  },
  {
    icon: '💬',
    title: 'Real-Time Chat',
    text: 'Connect and communicate with classmates and administrators.',
    number: '04'
  }
];

export default function Home() {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="home-page">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="home-hero">
          <div className="hero-content">
            <span className="hero-label">
              WELCOME TO STUDYSPHERE
            </span>

            <h1>
              Empowering Next-Gen
              <span> Learning & Management</span>
            </h1>

            <p>
              Your learning journey starts here. Explore courses,
              track your progress and connect with your learning
              community through one integrated platform.
            </p>

            <div className="hero-actions">
              {isAuthenticated ? (
                <Link
                  to={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                  className="home-btn home-btn-primary"
                >
                  Go to My Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="home-btn home-btn-primary"
                  >
                    Student Portal →
                  </Link>

                  <Link
                    to="/auth/admin-login"
                    className="home-btn home-btn-dark"
                  >
                    Admin Portal
                  </Link>

                  <Link
                    to="/auth/register"
                    className="home-btn home-btn-outline"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>

            <div className="hero-note">
              <span>✓</span> Learn at your own pace
              <span>✓</span> Track your achievements
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-circle">
              <div className="hero-book">📚</div>
              <h3>Learn. Grow. Achieve.</h3>
              <p>Your future begins with knowledge.</p>
              <div className="hero-mini-stats">
                <div>
                  <strong>Learn</strong>
                  <span>New skills</span>
                </div>
                <div>
                  <strong>Grow</strong>
                  <span>Every day</span>
                </div>
                <div>
                  <strong>Achieve</strong>
                  <span>Your goals</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="home-features">
          <div className="features-heading">
            <span>OUR PLATFORM</span>
            <h2>Everything You Need to Learn Better</h2>
            <p>
              Powerful features designed to make learning
              simple, organized and interactive.
            </p>
          </div>

          <div className="home-feature-grid">
            {features.map((feature) => (
              <article className="home-feature-card" key={feature.title}>
                <div className="feature-card-top">
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <span>{feature.number}</span>
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.text}</p>

                <div className="feature-card-line" />
              </article>
            ))}
          </div>
        </section>

        {/* Bottom Call to Action */}
        {!isAuthenticated && (
          <section className="home-cta">
            <h2>Ready to Start Your Learning Journey?</h2>
            <p>Create your account and explore StudySphere today.</p>
            <Link to="/auth/register" className="home-btn home-btn-primary">
              Get Started →
            </Link>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
