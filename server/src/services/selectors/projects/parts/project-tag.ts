import { TagSelector } from '#services/selectors/datasets/tag.ts';

export const ProjectTagSelector = Object.freeze({
  projectId: true,
  tagId: true,
  displayOrder: true,
  tag: {
    select: TagSelector,
  },
});
