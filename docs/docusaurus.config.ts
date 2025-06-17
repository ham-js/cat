import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '@ham-js/cat',
  tagline: 'A JavaScript library for all things related to computer aided transceivers',
  favicon: 'img/favicon.ico',
  url: 'https://ham-js.github.io',
  baseUrl: '/cat',
  organizationName: 'ham-js',
  projectName: 'cat',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  plugins: ['docusaurus-plugin-sass'],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/ham-js/cat/tree/main/docs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: '@ham-js/cat',
      logo: {
        alt: '@ham-js/cat logo',
        src: 'img/logo.png',
      },
      items: [
        {to: '/docs/getting-started', label: 'Getting Started'},
        {to: '/docs/playground', label: 'Playground'},
        {to: "/docs/supported-devices", label: 'Supported Devices'},
        {to: '/docs/contributing', label: 'Contributing'},
        {to: '/docs/api', label: 'API'},
        {to: '/docs/glossary', label: 'Glossary'},
        {
          href: 'https://github.com/ham-js/cat',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {},
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
