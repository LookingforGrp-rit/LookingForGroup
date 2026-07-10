import type { ApiResponse, ProjectPreview, ProjectSortMethod } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { getBlocklistIdsByGidService } from '#services/me/blocklist/get-blocklist-ids-by-gid.ts';
import getService from '#services/projects/get-paginated-projects.ts';

//GET api/projects/paginated/:count/:id/:method
//gets 10 projects
const getPaginatedProjectsController = async (
  req: Request,
  res: Response,
): Promise<ApiResponse<ProjectPreview[]> | undefined> => {
  const count = parseInt(req.params.count as string);
  const projectId = parseInt(req.params.id as string);
  const method = req.params.method as ProjectSortMethod;
  const result = await getService(count, projectId, method);

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
      result.filter((project) => {
        return ids.includes(project.owner.userId);
      });
    }
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };

  res.status(200).json(resBody);
  return resBody;
};

export default getPaginatedProjectsController;
