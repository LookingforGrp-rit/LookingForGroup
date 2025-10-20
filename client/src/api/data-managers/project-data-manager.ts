import {
  AddProjectMediumsInput,
  AddProjectSocialInput,
  AddProjectTagsInput,
  ApiResponse,
  CreateProjectImageInput,
  CreateProjectJobInput,
  CreateProjectMemberInput,
  ProjectWithFollowers,
  UpdateProjectImageInput,
  UpdateProjectInput,
  UpdateProjectJobInput,
  UpdateProjectMemberInput,
  UpdateProjectSocialInput,
} from "@looking-for-group/shared";
import {
  addMember,
  addPic,
  addProjectJob,
  addProjectMedium,
  addProjectSocial,
  addProjectTag,
  deleteMember as deleteMemberAPI,
  deletePic,
  deleteProjectJob,
  deleteProjectMedium,
  deleteProjectSocial,
  deleteProjectTag,
  getByID,
  updateMember as updateMemberAPI,
  updatePic,
  updateProject,
  updateProjectJob,
  updateProjectSocial,
} from "../projects";
import {
  CRUDRequest,
  ProjectChanges,
  ProjectChangesCreates,
  ProjectChangesDeletes,
  ProjectChangesUpdates,
} from "../../../types/types";

export const projectDataManager = async (projectId: number) => {
  const downloadProject = async () => {
    const projectResponse = await getByID(projectId);
    if (projectResponse.error || !projectResponse.data) {
      throw new Error("Error fetching project " + projectResponse.error);
    }

    return projectResponse.data;
  };

  const getEmptyChanges = () => {
    return {
      create: {
        tags: [],
        projectImages: [],
        projectSocials: [],
        jobs: [],
        members: [],
        mediums: [],
      },
      update: {
        fields: {
          id: projectId,
          data: {},
        },
        projectImages: [],
        projectSocials: [],
        jobs: [],
        members: [],
      },
      delete: {
        tags: [],
        projectImages: [],
        projectSocials: [],
        jobs: [],
        members: [],
        mediums: [],
      },
    };
  };

  let savedProject: ProjectWithFollowers = await downloadProject();
  let changes: ProjectChanges = getEmptyChanges();
  type SuccessArray = {
    id: number;
    succeeded: boolean;
  }[];

  /**
   * Pulls project from the server and loads it into savedProject
   */
  const reloadSavedProject = async () => {
    savedProject = await downloadProject();
  };

  const getSavedProject = () => savedProject;

  /**
   * Resets changes object to empty
   */
  const resetChanges = () => {
    changes = getEmptyChanges();
  };

  /**
   * Uploads changes to the server, reloads the savedProject, and clears the changes object
   * @throws {Error} Throws an error if any change failed. Includes the failed changes.
   */
  const saveChanges = async () => {
    let errorMessage = "";

    try {
      await saveUpdates(changes.update);
    } catch (error) {
      errorMessage += (error as Error).message;
    }

    try {
      await saveDeletes(changes.delete);
    } catch (error) {
      errorMessage += (error as Error).message;
    }

    try {
      await saveCreates(changes.create);
    } catch (error) {
      errorMessage += (error as Error).message;
    }

    await reloadSavedProject();
    resetChanges();

    if (errorMessage != "") {
      throw new Error(`Some changes failed: ${errorMessage}. `);
    }
  };

  // used by saveChanges
  const saveUpdates = async (updates: ProjectChangesUpdates) => {
    let errorMessage = "";

    try {
      await runAndCollectErrors<UpdateProjectInput>(
        "Updating project",
        [updates.fields],
        ({ data }) => updateProject(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<UpdateProjectJobInput>(
        "Updating project job",
        updates.jobs,
        ({ id, data }) => updateProjectJob(projectId, id, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<UpdateProjectMemberInput>(
        "Updating project member",
        updates.members,
        ({ id, data }) => updateMemberAPI(projectId, id, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<UpdateProjectImageInput>(
        "Updating project image",
        updates.projectImages,
        ({ id, data }) => updatePic(projectId, id, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<UpdateProjectSocialInput>(
        "Updating project social",
        updates.projectSocials,
        ({ id, data }) => updateProjectSocial(projectId, id, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    if (errorMessage != "") {
      throw new Error(`Some updates failed: ${errorMessage}. `);
    }
  };

  // used by saveChanges
  const saveCreates = async (creates: ProjectChangesCreates) => {
    let errorMessage = "";

    try {
      await runAndCollectErrors<CreateProjectImageInput>(
        "Creating project image",
        creates.projectImages,
        ({ data }) => addPic(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<CreateProjectJobInput>(
        "Creating project job",
        creates.jobs,
        ({ data }) => addProjectJob(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<CreateProjectMemberInput>(
        "Creating project member",
        creates.members,
        ({ data }) => addMember(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<AddProjectMediumsInput>(
        "Adding project medium",
        creates.mediums,
        ({ data }) => addProjectMedium(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<AddProjectTagsInput>(
        "Adding project tag",
        creates.tags,
        ({ data }) => addProjectTag(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<AddProjectSocialInput>(
        "Adding project social",
        creates.projectSocials,
        ({ data }) => addProjectSocial(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    if (errorMessage != "") {
      throw new Error(`Some creates failed: ${errorMessage}. `);
    }
  };

  // used by saveChanges
  const saveDeletes = async (deletes: ProjectChangesDeletes) => {
    let errorMessage = "";

    try {
      await runAndCollectErrors<null>(
        "Deleting project job",
        deletes.jobs,
        ({ id }) => deleteProjectJob(projectId, id)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<null>(
        "Deleting project medium",
        deletes.mediums,
        ({ id }) => deleteProjectMedium(projectId, id)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<null>(
        "Deleting project member",
        deletes.members,
        ({ id }) => deleteMemberAPI(projectId, id)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<null>(
        "Deleting project image",
        deletes.projectImages,
        ({ id }) => deletePic(projectId, id)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<null>(
        "Deleting project social",
        deletes.projectSocials,
        ({ id }) => deleteProjectSocial(projectId, id)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<null>(
        "Deleting project tag",
        deletes.tags,
        ({ id }) => deleteProjectTag(projectId, id)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    if (errorMessage != "") {
      throw new Error(`Some deletes failed: ${errorMessage}. `);
    }
  };

  const getErrorIds = (statuses: SuccessArray): (number | string)[] => {
    return statuses
      .filter(({ succeeded }) => succeeded === false)
      .map(({ id }) => id);
  };

  async function runAndCollectErrors<T>(
    actionLabel: string,
    requests: CRUDRequest<T>[],
    action: (request: CRUDRequest<T>) => Promise<ApiResponse>
  ): Promise<void> {
    const statuses: SuccessArray = [];

    // TODO can be ran simultaneously if saving takes too long
    for (const request of requests) {
      const succeeded = !!(await action(request));
      statuses.push({
        id: request.id,
        succeeded,
      });
    }

    const errors = getErrorIds(statuses);
    if (errors.length > 0) {
      throw new Error(
        `${actionLabel} failed for the following ids: ${errors.join(", ")}. `
      );
    }
  }

  const addTag = (tag: CRUDRequest<AddProjectTagsInput>) => {
    if (changes.create.tags.some(({ id }) => id === tag.id)) {
      changes.create.tags = [
        ...changes.create.tags.filter(({ id }) => id !== tag.id),
        tag,
      ];
      return;
    }

    changes.create.tags.push(tag);
  };

  const addMedium = (medium: CRUDRequest<AddProjectMediumsInput>) => {
    if (changes.create.mediums.some(({ id }) => id === medium.id)) {
      changes.create.mediums = [
        ...changes.create.mediums.filter(({ id }) => id !== medium.id),
        medium,
      ];
      return;
    }

    changes.create.mediums.push(medium);
  };

  const addSocial = (social: CRUDRequest<AddProjectSocialInput>) => {
    if (changes.create.projectSocials.some(({ id }) => id === social.id)) {
      changes.create.projectSocials = [
        ...changes.create.projectSocials.filter(({ id }) => id !== social.id),
        social,
      ];
      return;
    }

    changes.create.projectSocials.push(social);
  };

  const createImage = (image: CRUDRequest<CreateProjectImageInput>) => {
    if (changes.create.projectImages.some(({ id }) => id === image.id)) {
      changes.create.projectImages = [
        ...changes.create.projectImages.filter(({ id }) => id !== image.id),
        image,
      ];
      return;
    }

    changes.create.projectImages.push(image);
  };

  const createMember = (member: CRUDRequest<CreateProjectMemberInput>) => {
    if (changes.create.members.some(({ id }) => id === member.id)) {
      changes.create.members = [
        ...changes.create.members.filter(({ id }) => id !== member.id),
        member,
      ];
      return;
    }

    changes.create.members.push(member);
  };

  const createJob = (job: CRUDRequest<CreateProjectJobInput>) => {
    if (changes.create.jobs.some(({ id }) => id === job.id)) {
      changes.create.jobs = [
        ...changes.create.jobs.filter(({ id }) => id !== job.id),
        job,
      ];
      return;
    }

    changes.create.jobs.push(job);
  };

  const updateFields = (fields: CRUDRequest<UpdateProjectInput>) => {
    changes.update.fields = {
      ...changes.update.fields,
      ...fields,
    };
  };

  const updateImage = (image: CRUDRequest<UpdateProjectImageInput>) => {
    let existingImageUpdate = changes.update.projectImages.find(
      ({ id }) => id === image.id
    );

    existingImageUpdate = {
      id: image.id,
      data: {
        ...existingImageUpdate?.data,
        ...image,
      },
    };

    changes.update.projectImages = [
      ...changes.update.projectImages.filter(
        ({ id }) => id !== existingImageUpdate.id
      ),
      existingImageUpdate,
    ];
  };

  const updateSocial = (social: CRUDRequest<UpdateProjectSocialInput>) => {
    let existingSocialUpdate = changes.update.projectSocials.find(
      ({ id }) => id === social.id
    );

    existingSocialUpdate = {
      id: social.id,
      data: {
        ...existingSocialUpdate?.data,
        ...social,
      },
    };

    changes.update.projectSocials = [
      ...changes.update.projectSocials.filter(
        ({ id }) => id !== existingSocialUpdate.id
      ),
      existingSocialUpdate,
    ];
  };

  const updateJob = (job: CRUDRequest<UpdateProjectJobInput>) => {
    let existingJobUpdate = changes.update.jobs.find(({ id }) => id === job.id);

    existingJobUpdate = {
      id: job.id,
      data: {
        ...existingJobUpdate?.data,
        ...job,
      },
    };

    changes.update.jobs = [
      ...changes.update.jobs.filter(({ id }) => id !== existingJobUpdate.id),
      existingJobUpdate,
    ];
  };

  const updateMember = (member: CRUDRequest<UpdateProjectMemberInput>) => {
    let existingMemberUpdate = changes.update.members.find(
      ({ id }) => id === member.id
    );

    existingMemberUpdate = {
      id: member.id,
      data: {
        ...existingMemberUpdate?.data,
        ...member,
      },
    };

    changes.update.members = [
      ...changes.update.members.filter(
        ({ id }) => id !== existingMemberUpdate.id
      ),
      existingMemberUpdate,
    ];
  };

  const deleteTag = (tag: CRUDRequest<null>) => {
    if (changes.create.tags.some(({ id }) => id === tag.id)) {
      changes.create.tags = changes.create.tags.filter(
        ({ id }) => id !== tag.id
      );
      return;
    }

    if (!changes.delete.tags.some(({ id }) => id === tag.id)) {
      changes.delete.tags.push(tag);
    }
  };

  const deleteImage = (image: CRUDRequest<null>) => {
    if (changes.create.projectImages.some(({ id }) => id === image.id)) {
      changes.create.projectImages = changes.create.projectImages.filter(
        ({ id }) => id !== image.id
      );
      return;
    }

    if (changes.update.projectImages.some(({ id }) => id === image.id)) {
      changes.update.projectImages = changes.update.projectImages.filter(
        ({ id }) => id !== image.id
      );
      return;
    }

    if (!changes.delete.projectImages.some(({ id }) => id === image.id)) {
      changes.delete.projectImages.push(image);
    }
  };

  const deleteSocial = (social: CRUDRequest<null>) => {
    if (changes.create.projectSocials.some(({ id }) => id === social.id)) {
      changes.create.projectSocials = changes.create.projectSocials.filter(
        ({ id }) => id !== social.id
      );
      return;
    }

    if (changes.update.projectSocials.some(({ id }) => id === social.id)) {
      changes.update.projectSocials = changes.update.projectSocials.filter(
        ({ id }) => id !== social.id
      );
      return;
    }

    if (!changes.delete.projectSocials.some(({ id }) => id === social.id)) {
      changes.delete.projectSocials.push(social);
    }
  };

  const deleteJob = (job: CRUDRequest<null>) => {
    if (changes.create.jobs.some(({ id }) => id === job.id)) {
      changes.create.jobs = changes.create.jobs.filter(
        ({ id }) => id !== job.id
      );
      return;
    }

    if (changes.update.jobs.some(({ id }) => id === job.id)) {
      changes.update.jobs = changes.update.jobs.filter(
        ({ id }) => id !== job.id
      );
      return;
    }

    if (!changes.delete.jobs.some(({ id }) => id === job.id)) {
      changes.delete.jobs.push(job);
    }
  };

  const deleteMember = (member: CRUDRequest<null>) => {
    if (changes.create.members.some(({ id }) => id === member.id)) {
      changes.create.members = changes.create.members.filter(
        ({ id }) => id !== member.id
      );
      return;
    }

    if (changes.update.members.some(({ id }) => id === member.id)) {
      changes.update.members = changes.update.members.filter(
        ({ id }) => id !== member.id
      );
      return;
    }

    if (!changes.delete.members.some(({ id }) => id === member.id)) {
      changes.delete.members.push(member);
    }
  };

  const deleteMedium = (medium: CRUDRequest<null>) => {
    if (changes.create.mediums.some(({ id }) => id === medium.id)) {
      changes.create.mediums = changes.create.mediums.filter(
        ({ id }) => id !== medium.id
      );
      return;
    }

    if (!changes.delete.mediums.some(({ id }) => id === medium.id)) {
      changes.delete.mediums.push(medium);
    }
  };

  return {
    saveChanges,
    addTag,
    addMedium,
    addSocial,
    createImage,
    createMember,
    createJob,
    updateFields,
    updateImage,
    updateSocial,
    updateJob,
    updateMember,
    deleteTag,
    deleteImage,
    deleteSocial,
    deleteJob,
    deleteMember,
    deleteMedium,
    getSavedProject,
  };
};
