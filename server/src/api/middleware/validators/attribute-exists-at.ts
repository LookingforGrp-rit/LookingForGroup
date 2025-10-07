import type { ApiResponse } from '@looking-for-group/shared';
import { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import prisma from '#config/prisma.ts';

type ParameterLocation = 'path' | 'body';
type Attribute = 'role' | 'social' | 'skill' | 'medium' | 'major' | 'tag';

export const attributeExistsAt = (
  attribute: Attribute,
  type: ParameterLocation,
  key: string,
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let rawAttributeId;

    switch (type) {
      case 'path':
        rawAttributeId = req.params[key];
        break;
      case 'body':
        rawAttributeId = (req.body as Record<string, unknown>)[key] as string;
        break;
    }

    const attributeId = parseInt(rawAttributeId);

    if (isNaN(attributeId)) {
      const resBody: ApiResponse = {
        status: 400,
        error: `Invalid ${attribute} ID`,
        data: null,
      };
      res.status(400).json(resBody);
      return;
    }

    try {
      const attributeQuery = await getAttributeById(attributeId, attribute);

      if (!attributeQuery) {
        const resBody: ApiResponse = {
          status: 404,
          error: `${attribute} not found`,
          data: null,
        };
        res.status(404).json(resBody);
        return;
      }
    } catch (error) {
      console.error(`error in ${attribute} exists at: ${JSON.stringify(error)}`);
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

const getAttributeById = async (id: number, attribute: Attribute) => {
  switch (attribute) {
    case 'major':
      return await prisma.majors.findUnique({
        where: { majorId: id },
      });
    case 'medium':
      return await prisma.mediums.findUnique({
        where: { mediumId: id },
      });
    case 'role':
      return await prisma.roles.findUnique({
        where: { roleId: id },
      });
    case 'skill':
      return await prisma.skills.findUnique({
        where: { skillId: id },
      });
    case 'social':
      return await prisma.socials.findUnique({
        where: { websiteId: id },
      });
    case 'tag':
      return await prisma.tags.findUnique({
        where: { tagId: id },
      });
  }
};
