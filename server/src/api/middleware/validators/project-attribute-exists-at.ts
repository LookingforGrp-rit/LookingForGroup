import type { ApiResponse } from '@looking-for-group/shared';
import { type NextFunction, type Request, type Response } from 'express';
import prisma from '#config/prisma.ts';

type ParameterLocation = 'path' | 'body';
type Attribute = 'tag' | 'image' | 'social' | 'job' | 'member' | 'medium';

type ParameterInput = {
  type: ParameterLocation;
  key: string;
};

export const projectAttributeExistsAt = (
  attributeLabel: Attribute,
  project: ParameterInput,
  attribute: ParameterInput,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let rawAttributeId;

    switch (attribute.type) {
      case 'path':
        rawAttributeId = req.params[attribute.key];
        break;
      case 'body':
        rawAttributeId = (req.body as Record<string, unknown>)[attribute.key] as string;
        break;
    }

    const attributeId = parseInt(rawAttributeId);

    if (isNaN(attributeId)) {
      const resBody: ApiResponse = {
        status: 400,
        error: `Invalid user ${attributeLabel} ID`,
        data: null,
      };
      res.status(400).json(resBody);
      return;
    }

    let rawProjectId;

    switch (project.type) {
      case 'path':
        rawProjectId = req.params[project.key];
        break;
      case 'body':
        rawProjectId = (req.body as Record<string, unknown>)[project.key] as string;
        break;
    }

    const projectId = parseInt(rawProjectId);

    if (isNaN(projectId)) {
      const resBody: ApiResponse = {
        status: 400,
        error: `Invalid project ID`,
        data: null,
      };
      res.status(400).json(resBody);
      return;
    }

    try {
      const attributeQuery = await getAttributeById(projectId, attributeId, attributeLabel);

      if (!attributeQuery) {
        const resBody: ApiResponse = {
          status: 404,
          error: `Project ${attributeLabel} not found`,
          data: null,
        };
        res.status(404).json(resBody);
        return;
      }
    } catch (error) {
      console.error(`error in project ${attributeLabel} exists at: ${JSON.stringify(error)}`);
      const resBody: ApiResponse = {
        status: 500,
        error: 'Internal Server Error',
        data: null,
      };
      res.status(500).json(resBody);
      return;
    }

    next();
  };
};

const getAttributeById = async (projectId: number, attributeId: number, attribute: Attribute) => {
  switch (attribute) {
    case 'social':
      return await prisma.projectSocials.findUnique({
        where: {
          projectId_websiteId: {
            projectId,
            websiteId: attributeId,
          },
        },
      });
    case 'image':
      return await prisma.projectImages.findUnique({
        where: {
          projectId,
          imageId: attributeId,
        },
      });
    case 'job':
      return await prisma.jobs.findUnique({
        where: {
          projectId,
          jobId: attributeId,
        },
      });
    case 'medium':
      return await prisma.projects.findUnique({
        where: {
          projectId,
          mediums: {
            some: {
              mediumId: attributeId,
            },
          },
        },
      });
    case 'member':
      return await prisma.projects.findUnique({
        where: {
          projectId,
          members: {
            some: {
              userId: attributeId,
            },
          },
        },
      });
    case 'tag':
      return await prisma.projects.findUnique({
        where: {
          projectId,
          tags: {
            some: {
              tagId: attributeId,
            },
          },
        },
      });
  }
};
