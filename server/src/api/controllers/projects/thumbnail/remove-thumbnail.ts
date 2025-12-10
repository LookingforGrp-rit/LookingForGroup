import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { removeThumbnailService } from '#services/projects/thumbnail/remove-thumbnail.ts';

//POST api/projects/{id}/thumbnail
//removes the thumbnail from a project
//this does not remove the associated project image from the database, there's a separate route for that
//that route will automatically handle disconnecting the thumbnail image if it's selected for deletion
//all this does is disconnect the thumbnail image from its status as thumbnail
//in case you wanted to just not have one for whatever reason
//you liked the frogs and wanted to keep them i guess
const removeThumbnail = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);

  const result = await removeThumbnailService(projectId);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Image not found',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }
  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default removeThumbnail;
