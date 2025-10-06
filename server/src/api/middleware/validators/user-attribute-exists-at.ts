import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import { type NextFunction, type Request, type Response } from 'express';
import prisma from '#config/prisma.ts';

export const authenticated = (
  controller: (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => void | Promise<void>,
) =>
  controller as unknown as (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void | Promise<void>;

type ParameterLocation = 'path' | 'body';
type Attribute = 'social' | 'skill' | 'major';

export const userAttributeExistsAt = (
  attribute: Attribute,
  type: ParameterLocation,
  key: string,
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
        error: `Invalid user ${attribute} ID`,
        data: null,
      };
      res.status(400).json(resBody);
      return;
    }

    const rawUserId = req.currentUser;

    const userId = parseInt(rawUserId);

    if (isNaN(userId)) {
      const resBody: ApiResponse = {
        status: 400,
        error: `Invalid user ID`,
        data: null,
      };
      res.status(400).json(resBody);
      return;
    }

    try {
      const attributeQuery = await getAttributeById(userId, attributeId, attribute);

      if (!attributeQuery) {
        const resBody: ApiResponse = {
          status: 404,
          error: `User ${attribute} not found`,
          data: null,
        };
        res.status(404).json(resBody);
        return;
      }
    } catch (error) {
      console.error(`error in user ${attribute} exists at: ${JSON.stringify(error)}`);
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

const getAttributeById = async (userId: number, attributeId: number, attribute: Attribute) => {
  switch (attribute) {
    case 'social':
      return await prisma.userSocials.findUnique({
        where: {
          userId_websiteId: {
            userId,
            websiteId: attributeId,
          },
        },
      });
    case 'skill':
      return await prisma.userSkills.findUnique({
        where: {
          userId_skillId: {
            userId,
            skillId: attributeId,
          },
        },
      });
    case 'major':
      return await prisma.users.findUnique({
        where: {
          userId,
          majors: {
            some: {
              majorId: attributeId,
            },
          },
        },
      });
  }
};
