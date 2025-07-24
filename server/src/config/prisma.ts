import { PrismaClient } from '#prisma-models/index.js';
import envConfig from './env.ts';

const prisma = new PrismaClient({ datasourceUrl: envConfig.databaseUrl });

export default prisma;
