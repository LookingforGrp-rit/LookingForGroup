import type { ProjectTag } from '@looking-for-group/shared';
import { transformTag } from '#services/transformers/datasets/tag.ts';

//map to shared type
export const transformProjectTag = (
  projectId: number,
  tag: Pick<ProjectTag, 'category' | 'displayOrder' | 'tagId' | 'label' | 'type'>,
): ProjectTag => {
  return {
    apiUrl: `/api/projects/${projectId.toString()}/tags/${tag.tagId.toString()}`,
    ...transformTag(tag),
    displayOrder: tag.displayOrder,
  };
};
