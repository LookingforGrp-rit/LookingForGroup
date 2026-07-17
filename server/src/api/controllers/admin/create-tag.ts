import type {
  ApiResponse,
  AuthenticatedRequest,
  CreateTagInput,
  TagCategory,
  TagType,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import { createTagService } from '#services/admin/create-tag.ts';

const createTag = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  type CreateTagBody = {
    label?: string;
    type?: TagType;
    category?: TagCategory;
  };
  const res: ApiResponse = { status: 0 };

  // verifying input
  const body = request.body as CreateTagBody;
  if (!body.label || !body.type || !body.category) {
    res.status = 400;
    res.error = `The body does not contain the following properties: `;
    res.error += `${!body.label ? 'label, ' : ''} `;
    res.error += `${!body.type ? 'type, ' : ''} `;
    res.error += `${!body.category ? 'category, ' : ''}, `;

    response.status(res.status).json(res);
    return;
  }

  const result = await createTagService(body as CreateTagInput);

  if (result === 'INTERNAL_ERROR') {
    res.status = 500;
    res.error = 'There was an internal error';
  } else if (result === 'CONFLICT') {
    res.status = 409;
    res.error = 'Tag labels must not be duplicates.';
  } else {
    res.status = 200;
    res.data = result;
  }

  response.status(res.status).json(res);
};

export default createTag;
