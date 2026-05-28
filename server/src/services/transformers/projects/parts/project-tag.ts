import type { ProjectTag } from '@looking-for-group/shared';
import { transformTag } from '#services/transformers/datasets/tag.ts';

//map to shared type
export const transformProjectTag = (
  projectId: number,
  // tag: ProjectTag
  {
    label,
    tagId,
    type,
    displayOrder,
  }: Pick<ProjectTag, 'label' | 'tagId' | 'type' | 'displayOrder'>,
): ProjectTag => {
  return {
    apiUrl: `/api/projects/${projectId.toString()}/tags/${tagId.toString()}`,
    ...transformTag({ label: label, tagId: tagId, type: type }),
    displayOrder: displayOrder,
  };
};
