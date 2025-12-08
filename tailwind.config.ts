import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
  ],
  theme: {
    extend: {
      colors: {
        // Admin colors
        admin: {
          primary: '#b91c1c',
          secondary: '#991b1b',
          accent: '#dc2626',
        },
        // Employee colors
        employee: {
          primary: '#1e3a8a',
          secondary: '#1e40af',
          accent: '#2563eb',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
