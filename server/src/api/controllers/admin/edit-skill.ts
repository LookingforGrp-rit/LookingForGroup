import type {
  ApiResponse,
  AuthenticatedRequest,
  EditSkillInput,
  SkillCategory,
  SkillType,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import { editSkillService } from '#services/admin/edit-skill.ts';

const editSkill = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  type EditSkillBody = {
    label?: string;
    type?: SkillType;
    category?: SkillCategory;
  };
  const res: ApiResponse = { status: 0 };
  const body = request.body as EditSkillBody;
  const id = parseInt(request.params.id as string);
  const input: EditSkillInput = {
    skillId: id,
    label: body.label,
    type: body.type,
    category: body.category,
  };

  const result = await editSkillService(input);

  if (result === 'INTERNAL_ERROR') {
    res.status = 500;
    res.error = 'There was an internal error';
  } else if (result === 'NOT_FOUND') {
    res.status = 404;
    res.error = 'Could not find skill';
  } else {
    res.status = 200;
    res.data = result;
  }

  response.status(res.status).json(res);
};

export default editSkill;
