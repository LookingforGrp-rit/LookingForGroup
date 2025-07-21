import { defineProject } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

export default defineProject({
  test: {
    environment: 'node',
  },
});
