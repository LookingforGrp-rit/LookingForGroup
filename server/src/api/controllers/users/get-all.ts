import type {
  RitStatus,
  ApiResponse,
  FilterRequest,
  UserSortMethod,
} from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { UsersRitStatus } from '#prisma-models/index.js';
import { getBlocklistIdsByGidService } from '#services/me/blocklist/get-blocklist-ids-by-gid.ts';
import { getAllUsersService } from '#services/users/get-all-users.ts';

//GET api/users
//get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const filters = {} as FilterRequest;

  //going through and parsing/validating the results
  //i feel like there's an easier way to do this...
  if (req.query.strictness) {
    //validate first
    if (req.query.strictness !== 'any' && req.query.strictness !== 'all') {
      const resBody: ApiResponse = {
        status: 400,
        error: 'Invalid strictness',
        data: null,
      };
      res.status(400).json(resBody);
      return;
    } else {
      //if there's strictness and there's only one thing in the query,
      //then they tried to pass in strictness with no filters
      //so i 400 them
      if (Object.entries(req.query as object).length === 1) {
        const resBody: ApiResponse = {
          status: 400,
          error: 'Strictness provided without filters',
          data: null,
        };
        res.status(400).json(resBody);
        return;
      }
      filters.strictness = req.query.strictness;
    }
  }
  if (req.query.designer) {
    filters.designer = req.query.designer === 'true';
  }
  if (req.query.developer) {
    filters.developer = req.query.developer === 'true';
  }
  if (req.query.skills) {
    filters.skills = (req.query.skills as string).split(',').map((val) => parseInt(val));
  }
  if (req.query.majors) {
    filters.majors = (req.query.majors as string).split(',').map((val) => parseInt(val));
  }
  if (req.query.ritStatus) {
    filters.ritStatus = (req.query.ritStatus as string).split(',');
  }
  if (req.query.socials) {
    filters.socials = (req.query.socials as string).split(',').map((val) => parseInt(val));
  }

  //NaN checks for the things that need numbers
  if (
    filters.skills?.includes(NaN) ||
    filters.majors?.includes(NaN) ||
    filters.socials?.includes(NaN)
  ) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid filters',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  //ritStatus checks using UsersRitStatus
  const ritStatuses = filters.ritStatus as string[];
  if (filters.ritStatus !== undefined) {
    ritStatuses.forEach((status) => {
      if (!Object.values(UsersRitStatus).includes(status as RitStatus)) {
        const resBody: ApiResponse = {
          status: 400,
          error: 'Invalid RIT status(es)',
          data: null,
        };
        res.status(400).json(resBody);
        return;
      }
    });
  }

  //if there's more than one thing in the query and there isn't strictness,
  //then they tried to pass in filters with no strictness
  //so i 400 them
  if (Object.entries(filters).length >= 1 && !Object.keys(filters).includes('strictness')) {
    if (Object.entries(req.query as object).length === 1) {
      const resBody: ApiResponse = {
        status: 400,
        error: 'No strictness provided for filters',
        data: null,
      };
      res.status(400).json(resBody);
      return;
    }
  }

  //Add sort method
  const sortMethod = req.params.method as UserSortMethod;
  //send it over
  let result = await getAllUsersService(filters, sortMethod);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  // filtering out blocked users
  const userGid = req.session.gid;
  if (userGid) {
    const ids = await getBlocklistIdsByGidService(userGid);
    if (ids !== 'INTERNAL_ERROR') {
      result = result.filter((user) => {
        return !ids.includes(user.userId);
      });
    }
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};
