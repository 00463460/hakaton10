/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // Main tutorial sidebar with 4 modules
  tutorialSidebar: [
    // Introduction/Homepage
    {
      type: 'doc',
      id: 'intro',
      label: 'Welcome',
    },

    // ========================================================================
    // MODULE 1: Introduction to Physical AI & Humanoid Robotics
    // ========================================================================
    {
      type: 'category',
      label: '📘 Module 1: Introduction & Humanoid Robotics',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'module-1/chapter-1',
          label: 'Chapter 1: The Rise of Humanoid Robotics',
        },
        {
          type: 'doc',
          id: 'module-1/chapter-2',
          label: 'Chapter 2: Physical AI Landscape',
        },
      ],
    },

    // ========================================================================
    // MODULE 2: ROS 2 Fundamentals & Simulation with Isaac Sim
    // ========================================================================
    {
      type: 'category',
      label: '🔧 Module 2: ROS 2 & Simulation',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'module-2/chapter-3',
          label: 'Chapter 3: ROS 2 Fundamentals',
        },
        {
          type: 'doc',
          id: 'module-2/chapter-4',
          label: 'Chapter 4: The Digital Twin (Gazebo & Unity)',
        },
        {
          type: 'doc',
          id: 'module-2/chapter-5',
          label: 'Chapter 5: NVIDIA Isaac Sim',
        },
        {
          type: 'doc',
          id: 'module-2/chapter-6',
          label: 'Chapter 6: Navigation & Manipulation',
        },
      ],
    },

    // ========================================================================
    // MODULE 3: Vision-Language-Action Models & AI Integration
    // ========================================================================
    {
      type: 'category',
      label: '🧠 Module 3: Vision-Language-Action Models',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'module-3/chapter-7',
          label: 'Chapter 7: VLA Model Architecture',
        },
        {
          type: 'doc',
          id: 'module-3/chapter-8',
          label: 'Chapter 8: Imitation Learning',
        },
        {
          type: 'doc',
          id: 'module-3/chapter-9',
          label: 'Chapter 9: Reinforcement Learning for Robotics',
        },
        {
          type: 'doc',
          id: 'module-3/chapter-10',
          label: 'Chapter 10: End-to-End Visuomotor Policies',
        },
      ],
    },

    // ========================================================================
    // MODULE 4: Advanced Topics - Kinematics, Control, Deployment
    // ========================================================================
    {
      type: 'category',
      label: '🚀 Module 4: Advanced Topics',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'module-4/chapter-11',
          label: 'Chapter 11: Kinematics & Manipulation',
        },
        {
          type: 'doc',
          id: 'module-4/chapter-12',
          label: 'Chapter 12: Trajectory Optimization',
        },
      ],
    },

    // ========================================================================
    // APPENDICES & RESOURCES
    // ========================================================================
    // {
    //   type: 'category',
    //   label: '📚 Resources',
    //   collapsed: true,
    //   items: [
    //     // Future additions:
    //     // - Glossary
    //     // - Installation Guides
    //     // - Code Examples Repository
    //     // - Further Reading
    //   ],
    // },
  ],
};

module.exports = sidebars;
