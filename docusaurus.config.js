// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

const math = require('remark-math').default || require('remark-math');
const katex = require('rehype-katex').default || require('rehype-katex');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'An AI-native textbook for learning Physical AI, humanoid robotics, ROS 2, simulation, and vision-language-action models for embodied intelligence',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  // For Vercel deployment, use custom domain or vercel.app subdomain
  url: 'https://physical-ai-book.vercel.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For Vercel deployment at root domain, use '/'
  baseUrl: '/',

  // GitHub repository config (for "Edit this page" links)
  organizationName: 'panaversity', // Usually your GitHub org/user name.
  projectName: 'physical-ai-book', // Usually your repo name.
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/', // Serve docs at the root
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/panaversity/physical-ai-book/tree/main/',
          remarkPlugins: [[math, {}]],
          rehypePlugins: [[katex, { strict: false }]],
        },
        blog: false, // Disable blog for textbook-only site
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        pages: {
          // Optional: Configure standalone pages if needed
        },
      }),
    ],
  ],

  stylesheets: [
    {
      // KaTeX stylesheet for high-quality math rendering
      // Using latest stable version (0.16.9) for best kinematics/dynamics support
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Physical AI',
        logo: {
          alt: 'Physical AI & Humanoid Robotics Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Textbook',
          },
          {
            to: '/module-1/chapter-1',
            label: 'Module 1',
            position: 'left',
          },
          {
            to: '/module-2/chapter-3',
            label: 'Module 2',
            position: 'left',
          },
          {
            to: '/module-3/chapter-7',
            label: 'Module 3',
            position: 'left',
          },
          {
            to: '/module-4/chapter-11',
            label: 'Module 4',
            position: 'left',
          },
          {
            href: 'https://github.com/panaversity/physical-ai-book',
            label: 'GitHub',
            position: 'right',
          },
          {
            href: 'https://discord.gg/panaversity-ai',
            label: 'Discord',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Course Modules',
            items: [
              {
                label: 'Module 1: Introduction & Humanoid Robotics',
                to: '/module-1/chapter-1',
              },
              {
                label: 'Module 2: ROS 2 & Simulation',
                to: '/module-2/chapter-3',
              },
              {
                label: 'Module 3: Vision-Language-Action Models',
                to: '/module-3/chapter-7',
              },
              {
                label: 'Module 4: Advanced Topics',
                to: '/module-4/chapter-11',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/panaversity-ai',
              },
              {
                label: 'GitHub Discussions',
                href: 'https://github.com/panaversity/physical-ai-book/discussions',
              },
              {
                label: 'Twitter / X',
                href: 'https://twitter.com/panaversity',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'GitHub Repository',
                href: 'https://github.com/panaversity/physical-ai-book',
              },
              {
                label: 'Code Examples',
                href: 'https://github.com/panaversity/physical-ai-book/tree/main/examples',
              },
              {
                label: 'Hackathon Info',
                href: 'https://github.com/panaversity/physical-ai-book#hackathon',
              },
              {
                label: 'Report Issues',
                href: 'https://github.com/panaversity/physical-ai-book/issues',
              },
            ],
          },
          {
            title: 'Legal',
            items: [
              {
                label: 'License: CC BY-NC-SA 4.0',
                href: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
              },
              {
                label: 'Contributing Guidelines',
                href: 'https://github.com/panaversity/physical-ai-book/blob/main/CONTRIBUTING.md',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Panaversity. Built with Docusaurus. Licensed under CC BY-NC-SA 4.0.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'python', 'javascript', 'typescript', 'json', 'yaml', 'docker', 'cmake'],
      },
      // Algolia DocSearch configuration (optional - uncomment when ready)
      // algolia: {
      //   appId: 'YOUR_APP_ID',
      //   apiKey: 'YOUR_SEARCH_API_KEY',
      //   indexName: 'physical-ai-book',
      //   contextualSearch: true,
      // },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      announcementBar: {
        id: 'hackathon_announcement',
        content:
          '🚀 <strong>Physical AI Hackathon</strong> in progress! Build your robotics project with this textbook. <a target="_blank" rel="noopener noreferrer" href="https://github.com/panaversity/physical-ai-book#hackathon">Learn more</a>',
        backgroundColor: '#20232a',
        textColor: '#fff',
        isCloseable: true,
      },
      metadata: [
        {name: 'keywords', content: 'physical ai, humanoid robotics, ros 2, gazebo, simulation, machine learning, robotics, vla models'},
        {name: 'og:title', content: 'Physical AI & Humanoid Robotics Textbook'},
        {name: 'og:description', content: 'Learn Physical AI, humanoid robotics, ROS 2, simulation, and vision-language-action models'},
        {name: 'og:type', content: 'website'},
        {name: 'twitter:card', content: 'summary_large_image'},
      ],
    }),
};

module.exports = config;
