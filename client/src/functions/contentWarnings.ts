import { Tag } from "@looking-for-group/shared";

/**
 * The tag type that marks a project as carrying a content warning.
 * Matches the "Content Warning" member of the shared TagType union.
 */
export const CONTENT_WARNING_TAG_TYPE: Tag["type"] = "Content Warning";

/**
 * Minimal shape needed to decide whether a project carries a content warning.
 * Kept structural so this works for ProjectPreview, ProjectDetail, and
 * ProjectWithFollowers alike.
 */
type TaggedProject = { tags?: Pick<Tag, "type">[] | null };

/**
 * True if the project has at least one "Content Warning" tag.
 */
export const hasContentWarning = (project: TaggedProject): boolean =>
  project.tags?.some((tag) => tag.type === CONTENT_WARNING_TAG_TYPE) ?? false;

/**
 * Removes content-warning projects from a list when the viewer has enabled the
 * "block content warnings" account setting.
 *
 * Returns the list unchanged when the setting is off or unknown, so callers can
 * apply it unconditionally without branching.
 */
export const filterContentWarnings = <T extends TaggedProject>(
  projects: T[],
  blockContentWarnings: boolean | undefined
): T[] =>
  blockContentWarnings
    ? projects.filter((project) => !hasContentWarning(project))
    : projects;
