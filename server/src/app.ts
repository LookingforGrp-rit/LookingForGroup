import SwaggerParser from '@apidevtools/swagger-parser';
import express, { type Request, type Response } from 'express';
import morgan from 'morgan';
import envConfig from '#config/env.ts';
import datasetsRouter from '#routes/datasets.ts';
import imagesRouter from '#routes/images.ts';
import meRouter from '#routes/me.ts';
import modRouter from '#routes/mod.ts';
import projectsRouter from '#routes/projects.ts';
import usersRouter from '#routes/users.ts';

const app = express();

app.use(morgan(envConfig.env === 'development' ? 'dev' : 'tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (envConfig.env === 'development') {
  // Dynamic imports are used here because swagger packages are dev dependencies, which would cause crashes when imported in production.
  const swaggerUi = (await import('swagger-ui-express')).default;
  const doc = await SwaggerParser.bundle('./docs/swagger.yaml');

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(doc));
}

app.use('/datasets', datasetsRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);
app.use('/me', meRouter);
app.use('/images', imagesRouter);
app.use('/mod', modRouter);

app.get('', (_req: Request, res: Response) => {
  res.json({ message: 'You Reached The Looking For Group API' });
});

export default app;
