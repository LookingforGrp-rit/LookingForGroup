import type { AcademicYear, ApiResponse, FilterRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { UsersAcademicYear } from '#prisma-models/index.js';
import { getAllUsersService } from '#services/users/get-all-users.ts';

//get all users
export const getAllUsers = async (req: FilterRequest, res: Response): Promise<void> => {
  //so essentially
  const filters = {} as FilterRequest;

  //going through and parsing/validating the results
  if (req.query.strictness) {
    //if there's strictness and there's only one thing in the query,
    //then they tried to pass in strictness with no filters
    if (Object.entries(req.query as object).length === 1) {
      const resBody: ApiResponse = {
        status: 400,
        error: 'Do not pass in strictness without any filters',
        data: null,
      };
      res.status(400).json(resBody);
    }
    filters.strictness = req.query.strictness as 'any' | 'all';
  }
  if (req.query.mentor) {
    filters.mentor = req.query.mentor === 'true';
  }
  if (req.query.deisgner) {
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
  if (req.query.academicYear) {
    filters.academicYear = (req.query.academicYear as string).split(',');
  }
  if (req.query.socials) {
    filters.socials = (req.query.socials as string).split(',').map((val) => parseInt(val));
  }

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

  const result = await getAllUsersService(filters);

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
