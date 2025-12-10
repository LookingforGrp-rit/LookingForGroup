import type { AuthenticatedRequest, UpdateProjectInput } from '@looking-for-group/shared';
import type { Response } from 'express';
import updateProjectService from '#services/projects/update-proj.ts';

//PATCH api/projects/{id}
//updates a project's info
const updateProjectsController = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const updates = req.body as Omit<UpdateProjectInput, 'thumbnail'>;
  const projectId = parseInt(req.params.id);

  const updateFields = ['title', 'hook', 'description', 'purpose', 'status', 'audience'];

  //validate update fields
  const invalid = Object.keys(updates).filter((field) => !updateFields.includes(field));

  if (invalid.length > 0) {
    res.status(400).json({ message: `Invalid fields: ${JSON.stringify(invalid)}` });
    return;
  }

  const result = await updateProjectService(projectId, updates);

  if (result === 'NOT_FOUND') {
    res.status(404).json({ message: 'Project not found' });
    return;
  }
  if (result === 'INTERNAL_ERROR') {
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }

  res.status(200).json(result);
};

export default updateProjectsController;
