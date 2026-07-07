import type {
  ApiResponse,
  AuthenticatedRequest,
  EditTagInput,
  TagCategory,
  TagType,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import { editTagService } from '#services/admin/edit-tag.ts';

const editTag = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  type EditTagBody = {
    label?: string;
    type?: TagType;
    category?: TagCategory;
  };
  const res: ApiResponse = { status: 0 };
  const body = request.body as EditTagBody;
  const id = parseInt(request.params.id as string);
  const input: EditTagInput = {
    tagId: id,
    label: body.label === '' ? undefined : body.label,
    type: !body.type ? undefined : body.type,
    category: !body.category ? undefined : body.category,
  };

  const result = await editTagService(input);

  if (result === 'INTERNAL_ERROR') {
    res.status = 500;
    res.error = 'There was an internal error';
  } else if (result === 'NOT_FOUND') {
    res.status = 404;
    res.error = 'Could not find tag';
  } else if (result === 'CONFLICT') {
    res.status = 409;
    res.error = 'Tag labels must not be duplicates.';
  } else {
    res.status = 200;
    res.data = result;
  }

  response.status(res.status).json(res);
};

export default editTag;
