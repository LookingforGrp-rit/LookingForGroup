import type {
  AcademicYear,
  ApiResponse,
  FilterRequest,
  UserFilters,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import { UsersAcademicYear } from '#prisma-models/index.js';
import { getAllUsersService } from '#services/users/get-all-users.ts';

//get all users
export const getAllUsers = async (req: FilterRequest, res: Response): Promise<void> => {
  const restriction = req.query.strictness as 'any' | 'all';
  const filters = {
    mentor: req.query.mentor === 'true',
    designer: req.query.designer === 'true',
    developer: req.query.developer === 'true',
    skills: (req.query.skills as string).split(',').map((val) => parseInt(val)),
    majors: (req.query.majors as string).split(',').map((val) => parseInt(val)),
    academicYear: (req.query.academicYear as string).split(','),
    socials: (req.query.socials as string).split(',').map((val) => parseInt(val)),
  } as UserFilters;

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
  }

  const years = filters.academicYear as string[];

  if (filters.academicYear !== undefined) {
    years.forEach((year) => {
      if (!Object.values(UsersAcademicYear).includes(year as AcademicYear)) {
        const resBody: ApiResponse = {
          status: 400,
          error: 'Invalid academic year(s)',
          data: null,
        };
        res.status(400).json(resBody);
      }
    });
  }

  const result = await getAllUsersService(filters, restriction);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};
