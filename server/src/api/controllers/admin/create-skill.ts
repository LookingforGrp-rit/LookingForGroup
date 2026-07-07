import type {
  ApiResponse,
  AuthenticatedRequest,
  CreateSkillInput,
  SkillCategory,
  SkillType,
} from '@looking-for-group/shared/types.d.ts';
import type { Response } from 'express';
import { createSkillService } from '#services/admin/create-skill.ts';

const createSkill = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  type CreateSkillBody = {
    label?: string;
    type?: SkillType;
    category?: SkillCategory;
  };
  const res: ApiResponse = { status: 0 };

  // verifying input
  const body = request.body as CreateSkillBody;
  if (!body.label || !body.type || !body.category) {
    res.status = 400;
    res.error = `The body does not contain the following properties: `;
    res.error += `${!body.label ? 'label, ' : ''} `;
    res.error += `${!body.type ? 'type, ' : ''} `;
    res.error += `${!body.category ? 'category, ' : ''}, `;

    response.status(res.status).json(res);
    return;
  }

  const result = await createSkillService(body as CreateSkillInput);

  if (result === 'INTERNAL_ERROR') {
    res.status = 500;
    res.error = 'There was an internal error';
  } else if (result === 'CONFLICT') {
    res.status = 409;
    res.error = 'Skill labels must not be duplicates.';
  } else {
    res.status = 200;
    res.data = result;
  }

  response.status(res.status).json(res);
};

export default createSkill;
