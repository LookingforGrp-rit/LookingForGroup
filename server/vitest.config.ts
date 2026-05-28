import { defineProject } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

export default defineProject({
  test: {
    environment: 'node',
  },
  server: {
    proxy: {
      '/me': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/projects': 'http://localhost:3000',
      '/datasets': 'http://localhost:3000',
      '/images': 'http://localhost:3000',
      '/mod': 'http://localhost:3000',
    },
  },
});
