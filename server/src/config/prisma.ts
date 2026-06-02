import { PrismaClient } from '#prisma-models/index.js';
import envConfig from './env.ts';

console.log('databaseUrl =', envConfig.databaseUrl);

const prisma = new PrismaClient();

export default prisma;
