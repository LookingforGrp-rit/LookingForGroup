import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import session, { type CookieOptions } from 'express-session';
import morgan from 'morgan';
import envConfig from '#config/env.ts';
import prisma from '#config/prisma.ts';
import googleRouter from '#routes/authentication.ts';
import datasetsRouter from '#routes/datasets.ts';
import imagesRouter from '#routes/images.ts';
import meRouter from '#routes/me.ts';
import modRouter from '#routes/mod.ts';
import projectsRouter from '#routes/projects.ts';
import usersRouter from '#routes/users.ts';

const app = express();

app.use(
  // See express session documentation to understand what any of it means.
  session({
    secret: process.env.EXPRESS_SESSION_SECRET || 'declaration of independence',
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000 /* every 2 minutes */,
    }),
    cookie: function (): CookieOptions {
      return {
        httpOnly: true,
        secure: envConfig.env === 'production',
        //30 minutes * 60 seconds/minute * 1000ms/second
        maxAge: 30 * 60 * 1000,
        sameSite: true,
      };
    },
  }),
);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan(envConfig.env === 'development' ? 'dev' : 'tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (envConfig.env === 'development') {
  // Dynamic imports are used here because swagger packages are dev dependencies, which would cause crashes when imported in production.
  const swaggerParser = (await import('@apidevtools/swagger-parser')).default;
  const swaggerUi = (await import('swagger-ui-express')).default;
  const doc = await swaggerParser.bundle('./docs/swagger.yaml');

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(doc));
}

//app.get(new RegExp("[\\s\\S]/*"), (_req: Request, res: Response) => {
//  console.log(`Received request ${_req.ip}`);
//});

app.use('/datasets', datasetsRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);
app.use('/me', meRouter);
app.use('/images', imagesRouter);
app.use('/mod', modRouter);
app.use('/google-login', googleRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientBuildPath = path.join(__dirname, '../../client/build');

if (envConfig.env === 'production') {
  app.use(express.static(clientBuildPath));

  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}
// app.get('/', (_req: Request, res: Response) => {
//   res.json({ message: 'You Reached The Looking For Group API' });
// });

export default app;
