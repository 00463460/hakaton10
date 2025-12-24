import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import AuthModal from '../components/AuthModal';
import styles from './index.module.css';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');
    if (token && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
    }
  }, []);

  const handleAuthSuccess = (data) => {
    setIsAuthenticated(true);
    setUserEmail(data.email);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserEmail('');
  };

  const handleProtectedLink = (e, href) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  // If not authenticated, show sign-in landing page
  if (!isAuthenticated) {
    return (
      <Layout
        title="Physical AI & Humanoid Robotics"
        description="An AI-native textbook for learning Physical AI, humanoid robotics, ROS 2, simulation, and vision-language-action models for embodied intelligence."
        wrapperClassName={styles.layoutWrapper}
      >
        <div className={styles.authLandingPage}>
          <div className={styles.authContainer}>
            <div className={styles.authLeft}>
              <div className={styles.authBadge}>
                <span className={styles.authBadgeIcon}>✨</span>
                AI-Powered Learning Platform
              </div>

              <h1 className={styles.authTitle}>
                Master Physical AI &<br />Humanoid Robotics
              </h1>

              <p className={styles.authDescription}>
                Join thousands of students learning cutting-edge robotics with our interactive,
                AI-powered textbook. Build real-world robots with ROS 2, deep learning, and
                foundation models.
              </p>

              <div className={styles.authFeatures}>
                <div className={styles.authFeature}>
                  <div className={styles.authFeatureIcon}>🤖</div>
                  <div>
                    <h3>Interactive RAG Chatbot</h3>
                    <p>Get instant answers from AI assistant</p>
                  </div>
                </div>
                <div className={styles.authFeature}>
                  <div className={styles.authFeatureIcon}>💻</div>
                  <div>
                    <h3>Hands-On Projects</h3>
                    <p>Build real robotics applications</p>
                  </div>
                </div>
                <div className={styles.authFeature}>
                  <div className={styles.authFeatureIcon}>🎓</div>
                  <div>
                    <h3>Expert Curriculum</h3>
                    <p>Learn from industry professionals</p>
                  </div>
                </div>
              </div>

              <div className={styles.authStats}>
                <div className={styles.authStat}>
                  <div className={styles.authStatNumber}>10</div>
                  <div className={styles.authStatLabel}>Weeks</div>
                </div>
                <div className={styles.authStat}>
                  <div className={styles.authStatNumber}>40+</div>
                  <div className={styles.authStatLabel}>Labs</div>
                </div>
                <div className={styles.authStat}>
                  <div className={styles.authStatNumber}>5</div>
                  <div className={styles.authStatLabel}>Projects</div>
                </div>
              </div>
            </div>

            <div className={styles.authRight}>
              <div className={styles.authCard}>
                <div className={styles.authCardHeader}>
                  <h2>Get Started Today</h2>
                  <p>Sign in to access the complete textbook</p>
                </div>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className={styles.authButton}
                >
                  <span>Sign In / Sign Up</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className={styles.authDivider}>
                  <span>What you'll get</span>
                </div>

                <div className={styles.authBenefits}>
                  <div className={styles.authBenefit}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#6366f1" strokeWidth="2"/>
                      <path d="M6 10L9 13L14 7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Full access to all 4 modules</span>
                  </div>
                  <div className={styles.authBenefit}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#6366f1" strokeWidth="2"/>
                      <path d="M6 10L9 13L14 7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>AI chatbot for instant help</span>
                  </div>
                  <div className={styles.authBenefit}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#6366f1" strokeWidth="2"/>
                      <path d="M6 10L9 13L14 7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Downloadable code examples</span>
                  </div>
                  <div className={styles.authBenefit}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#6366f1" strokeWidth="2"/>
                      <path d="M6 10L9 13L14 7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Certificate of completion</span>
                  </div>
                </div>

                <div className={styles.authFooter}>
                  <p>Join the Physical AI Hackathon by <a href="https://panaversity.com" target="_blank" rel="noopener noreferrer">Panaversity</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </Layout>
    );
  }

  // Authenticated view - full website access
  return (
    <Layout
      title="Physical AI & Humanoid Robotics"
      description="An AI-native textbook for learning Physical AI, humanoid robotics, ROS 2, simulation, and vision-language-action models for embodied intelligence."
      wrapperClassName={styles.layoutWrapper}
    >
      <div className={styles.landingPage}>
        <div className={styles.heroContainer}>
          <div className={styles.heroLeft}>
            <div className={styles.badge}>AI-Native Textbook</div>

            <h1 className={styles.mainTitle}>
              Master Physical AI & Humanoid Robotics
            </h1>

            <p className={styles.description}>
              An interactive, AI-powered textbook for learning embodied intelligence.
              Build real-world robots with ROS 2, deep learning, and foundation models.
            </p>

            <div className={styles.ctaButtons}>
              <a href="/module-1/chapter-1" className={`button button--primary button--lg ${styles.primaryBtn}`}>
                Start Learning →
              </a>
              <a href="#curriculum" className={`button button--secondary button--lg ${styles.secondaryBtn}`}>
                View Curriculum
              </a>
            </div>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>10</div>
                <div className={styles.statLabel}>WEEKS</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>40+</div>
                <div className={styles.statLabel}>LABS</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>5</div>
                <div className={styles.statLabel}>PROJECTS</div>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.topicCard}>
              <div className={styles.cardIcon}>🤖</div>
              <h3>Humanoid Robotics</h3>
              <p>Bipedal locomotion & whole-body control</p>
            </div>

            <div className={styles.topicCard}>
              <div className={styles.cardIcon}>👁️</div>
              <h3>Computer Vision</h3>
              <p>YOLOv8, depth sensing, point clouds</p>
            </div>

            <div className={styles.topicCard}>
              <div className={styles.cardIcon}>🧠</div>
              <h3>Foundation Models</h3>
              <p>LLMs & VLMs for robot intelligence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Banner */}
      <div className={styles.announcementBanner}>
        <div className="container">
          <span className={styles.announcementIcon}>🚀</span>
          <span className={styles.announcementText}>
            <strong>Physical AI Hackathon</strong> in progress! Build your robotics project with this textbook.
          </span>
          <a href="https://panaversity.com" target="_blank" rel="noopener noreferrer" className={styles.announcementLink}>
            Learn more →
          </a>
        </div>
      </div>

      <div id="curriculum" className={styles.curriculumSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Four Learning Modules</h2>
          <p className={styles.sectionSubtitle}>
            A structured learning path from fundamentals to advanced deployment
          </p>

          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <div className={styles.iconCircle} style={{background: '#6366f1'}}>📘</div>
              </div>
              <div className={styles.timelineContent}>
                <h3>Module 1: Introduction & Humanoid Robotics</h3>
                <p>Explore the Physical AI landscape, humanoid platforms, and the future of embodied intelligence.</p>
                <a href="/module-1/chapter-1" className={styles.moduleLink}>Learn more →</a>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <div className={styles.iconCircle} style={{background: '#8b5cf6'}}>🔧</div>
              </div>
              <div className={styles.timelineContent}>
                <h3>Module 2: ROS 2 & Simulation</h3>
                <p>Master ROS 2 fundamentals, Gazebo simulation, and digital twin development for robotics.</p>
                <a href="/module-2/chapter-3" className={styles.moduleLink}>Learn more →</a>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <div className={styles.iconCircle} style={{background: '#06b6d4'}}>🧠</div>
              </div>
              <div className={styles.timelineContent}>
                <h3>Module 3: Vision-Language-Action Models</h3>
                <p>Integrate foundation models, imitation learning, and reinforcement learning for intelligent robots.</p>
                <a href="/module-3/chapter-7" className={styles.moduleLink}>Learn more →</a>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <div className={styles.iconCircle} style={{background: '#a855f7'}}>🚀</div>
              </div>
              <div className={styles.timelineContent}>
                <h3>Module 4: Advanced Topics</h3>
                <p>Deep dive into kinematics, control theory, and sim-to-real deployment strategies.</p>
                <a href="/module-4/chapter-11" className={styles.moduleLink}>Learn more →</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.featuresSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why This Textbook?</h2>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🤖</div>
              <h3>Interactive RAG Chatbot</h3>
              <p>Ask questions and get instant answers grounded in the textbook content</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💻</div>
              <h3>Executable Code Examples</h3>
              <p>Copy-paste ready ROS 2, Python, and simulation code</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3>Real-World Applications</h3>
              <p>Learn from Boston Dynamics, NASA, Waymo, and leading robotics teams</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎯</div>
              <h3>Hands-On Projects</h3>
              <p>Build skills through simulation-first, hardware-validated development</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌐</div>
              <h3>AI-Native Learning</h3>
              <p>Designed for the modern robotics engineer with cutting-edge AI integration</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🏆</div>
              <h3>Hackathon Ready</h3>
              <p>Perfect for the Physical AI Hackathon by Panaversity</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.ctaSection}>
        <div className="container">
          <h2>Ready to Build the Future of Physical AI?</h2>
          <p>
            Join the robotics revolution and start building intelligent machines that interact with the physical world
          </p>
          <div className={styles.ctaButtons}>
            <a href="/module-1/chapter-1" className="button button--primary button--lg">
              Get Started Now →
            </a>
            <a href="https://github.com/panaversity/physical-ai-book" className="button button--secondary button--lg" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
