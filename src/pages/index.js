import React from 'react';
import Layout from '@theme/Layout';
import styles from './index.module.css';

export default function Home() {
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

      <div id="curriculum" className={styles.curriculumSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Four Learning Modules</h2>
          <p className={styles.sectionSubtitle}>
            A structured learning path from fundamentals to advanced deployment
          </p>

          <div className={styles.modulesGrid}>
            <div className={styles.moduleCard}>
              <div className={styles.moduleIcon}>📘</div>
              <h3>Module 1: Introduction & Humanoid Robotics</h3>
              <p>Explore the Physical AI landscape, humanoid platforms, and the future of embodied intelligence.</p>
              <a href="/module-1/chapter-1" className={styles.moduleLink}>Learn more →</a>
            </div>

            <div className={styles.moduleCard}>
              <div className={styles.moduleIcon}>🔧</div>
              <h3>Module 2: ROS 2 & Simulation</h3>
              <p>Master ROS 2 fundamentals, Gazebo simulation, and digital twin development for robotics.</p>
              <a href="/module-2/chapter-3" className={styles.moduleLink}>Learn more →</a>
            </div>

            <div className={styles.moduleCard}>
              <div className={styles.moduleIcon}>🧠</div>
              <h3>Module 3: Vision-Language-Action Models</h3>
              <p>Integrate foundation models, imitation learning, and reinforcement learning for intelligent robots.</p>
              <a href="/module-3/chapter-7" className={styles.moduleLink}>Learn more →</a>
            </div>

            <div className={styles.moduleCard}>
              <div className={styles.moduleIcon}>🚀</div>
              <h3>Module 4: Advanced Topics</h3>
              <p>Deep dive into kinematics, control theory, and sim-to-real deployment strategies.</p>
              <a href="/module-4/chapter-11" className={styles.moduleLink}>Learn more →</a>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.featuresSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why This Textbook?</h2>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3>🤖 Interactive RAG Chatbot</h3>
              <p>Ask questions and get instant answers grounded in the textbook content</p>
            </div>

            <div className={styles.featureCard}>
              <h3>💻 Executable Code Examples</h3>
              <p>Copy-paste ready ROS 2, Python, and simulation code</p>
            </div>

            <div className={styles.featureCard}>
              <h3>📊 Real-World Applications</h3>
              <p>Learn from Boston Dynamics, NASA, Waymo, and leading robotics teams</p>
            </div>

            <div className={styles.featureCard}>
              <h3>🎯 Hands-On Projects</h3>
              <p>Build skills through simulation-first, hardware-validated development</p>
            </div>

            <div className={styles.featureCard}>
              <h3>🌐 AI-Native Learning</h3>
              <p>Designed for the modern robotics engineer with cutting-edge AI integration</p>
            </div>

            <div className={styles.featureCard}>
              <h3>🏆 Hackathon Ready</h3>
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
            <a href="https://github.com/panaversity/physical-ai-book" className="button button--secondary button--lg" target="_blank">
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
