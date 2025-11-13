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
  UpdateProjectThumbnailInput,
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
  updateThumb,
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
    const emptyChanges: ProjectChanges = {
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
          id: {
            type: "canon",
            value: projectId,
          },
          data: {},
        },
        thumbnail: {
          id: {
            type: 'canon',
            value: projectId
          },
          data: {} as UpdateProjectThumbnailInput
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

    return emptyChanges;
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
    console.log(changes);
    let errorMessage = "";

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

    try {
      await saveUpdates(changes.update);
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
        ({ id, data }) => updateProjectJob(projectId, id.value, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<UpdateProjectMemberInput>(
        "Updating project member",
        updates.members,
        ({ id, data }) => updateMemberAPI(projectId, id.value, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<UpdateProjectImageInput>(
        "Updating project image",
        updates.projectImages,
        ({ id, data }) => updatePic(projectId, id.value, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<UpdateProjectThumbnailInput>(
        "Updating project thumbnail",
        [updates.thumbnail],
        ({ data }) => updateThumb(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<UpdateProjectSocialInput>(
        "Updating project social",
        updates.projectSocials,
        ({ id, data }) => updateProjectSocial(projectId, id.value, data)
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
        async ({ id, data }) => { //all this is for thumbnail stuff
          const realImage = await addPic(projectId, data); 
          if(realImage.data && 
            changes.update.thumbnail.data && 
            id.value === changes.update.thumbnail.data.thumbnail){
              console.log("WE SHOULD NEVER GET HERE.")
            changes.update.thumbnail.data.thumbnail = realImage.data.imageId;
          }
          return realImage;
        }
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
        ({ id }) => deleteProjectJob(projectId, id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<null>(
        "Deleting project medium",
        deletes.mediums,
        ({ id }) => deleteProjectMedium(projectId, id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<null>(
        "Deleting project member",
        deletes.members,
        ({ id }) => deleteMemberAPI(projectId, id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<null>(
        "Deleting project image",
        deletes.projectImages,
        ({ id }) => deletePic(projectId, id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<null>(
        "Deleting project social",
        deletes.projectSocials,
        ({ id }) => deleteProjectSocial(projectId, id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    try {
      await runAndCollectErrors<null>(
        "Deleting project tag",
        deletes.tags,
        ({ id }) => deleteProjectTag(projectId, id.value)
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
      if(request.data && Object.keys(request.data as object).length > 0){ //please only run if you actually have data
      const response = await action(request);
      const succeeded = !response.error;
      statuses.push({
        id: request.id.value,
        succeeded,
      });
      }
    }

    const errors = getErrorIds(statuses);
    if (errors.length > 0) {
      throw new Error(
        `${actionLabel} failed for the following ids: ${errors.join(", ")}. `
      );
    }
  }

  const addTag = (tag: CRUDRequest<AddProjectTagsInput>) => {
    if (changes.create.tags.some(({ id }) => id.value === tag.id.value)) {
      changes.create.tags = [
        ...changes.create.tags.filter(({ id }) => id.value !== tag.id.value),
        tag,
      ];
      return;
    }

    changes.create.tags.push(tag);
  };

  const addMedium = (medium: CRUDRequest<AddProjectMediumsInput>) => {
    if (changes.create.mediums.some(({ id }) => id.value === medium.id.value)) {
      changes.create.mediums = [
        ...changes.create.mediums.filter(
          ({ id }) => id.value !== medium.id.value
        ),
        medium,
      ];
      return;
    }

    changes.create.mediums.push(medium);
  };

  const addSocial = (social: CRUDRequest<AddProjectSocialInput>) => {
    if (
      changes.create.projectSocials.some(
        ({ id }) => id.value === social.id.value
      )
    ) {
      changes.create.projectSocials = [
        ...changes.create.projectSocials.filter(
          ({ id }) => id.value !== social.id.value
        ),
        social,
      ];
      return;
    }

    changes.create.projectSocials.push(social);
  };

  const createImage = (image: CRUDRequest<CreateProjectImageInput>) => {
    if (
      changes.create.projectImages.some(({ id }) => id.value === image.id.value)
    ) {
      changes.create.projectImages = [
        ...changes.create.projectImages.filter(
          ({ id }) => id.value !== image.id.value
        ),
        image,
      ];
      return;
    }

    changes.create.projectImages.push(image);
  };

  const createMember = (member: CRUDRequest<CreateProjectMemberInput>) => {
    if (changes.create.members.some(({ id }) => id.value === member.id.value)) {
      changes.create.members = [
        ...changes.create.members.filter(
          ({ id }) => id.value !== member.id.value
        ),
        member,
      ];
      return;
    }

    changes.create.members.push(member);
  };

  const createJob = (job: CRUDRequest<CreateProjectJobInput>) => {
    if (changes.create.jobs.some(({ id }) => id.value === job.id.value)) {
      changes.create.jobs = [
        ...changes.create.jobs.filter(({ id }) => id.value !== job.id.value),
        job,
      ];
      return;
    }

    changes.create.jobs.push(job);
  };

  const updateFields = (fields: CRUDRequest<UpdateProjectInput>) => {
    changes.update.fields = {
      id: {
        type: "canon",
        value: projectId,
      },
      data: {
        ...changes.update.fields.data,
        ...fields.data,
      },
    };
  };

  const updateImage = (image: CRUDRequest<UpdateProjectImageInput>) => {
    let existingImageUpdate = changes.update.projectImages.find(
      ({ id }) => id.value === image.id.value && id.type === image.id.type
    );

    existingImageUpdate = {
      id: image.id,
      data: {
        ...existingImageUpdate?.data,
        ...image.data,
      },
    };

    changes.update.projectImages = [
      ...changes.update.projectImages.filter(
        ({ id }) =>
          !(
            id.value == existingImageUpdate.id.value &&
            id.type == existingImageUpdate.id.type
          )
      ),
      existingImageUpdate,
    ];
  };

  const updateSocial = (social: CRUDRequest<UpdateProjectSocialInput>) => {
    let existingSocialUpdate = changes.update.projectSocials.find(
      ({ id }) => id.value === social.id.value && id.type === social.id.type
    );

    existingSocialUpdate = {
      id: social.id,
      data: {
        ...existingSocialUpdate?.data,
        ...social.data,
      },
    };

    changes.update.projectSocials = [
      ...changes.update.projectSocials.filter(
        ({ id }) =>
          !(
            id.value == existingSocialUpdate.id.value &&
            id.type == existingSocialUpdate.id.type
          )
      ),
      existingSocialUpdate,
    ];
  };

  const updateJob = (job: CRUDRequest<UpdateProjectJobInput>) => {
    let existingJobUpdate = changes.update.jobs.find(
      ({ id }) => id.value === job.id.value && id.type === job.id.type
    );

    existingJobUpdate = {
      id: job.id,
      data: {
        ...existingJobUpdate?.data,
        ...job.data,
      },
    };

    changes.update.jobs = [
      ...changes.update.jobs.filter(
        ({ id }) =>
          !(
            id.value == existingJobUpdate.id.value &&
            id.type == existingJobUpdate.id.type
          )
      ),
      existingJobUpdate,
    ];
  };

  const updateThumbnail = (thumbnail: CRUDRequest<UpdateProjectThumbnailInput>) => {
    changes.update.thumbnail = {
      id: thumbnail.id,
      data: {
        thumbnail: thumbnail.data.thumbnail //a thumbnail data sandwich
      }
    }
  }

  const updateMember = (member: CRUDRequest<UpdateProjectMemberInput>) => {
    let existingMemberUpdate = changes.update.members.find(
      ({ id }) => id.value === member.id.value && id.type === member.id.type
    );

    existingMemberUpdate = {
      id: member.id,
      data: {
        ...existingMemberUpdate?.data,
        ...member.data,
      },
    };

    changes.update.members = [
      ...changes.update.members.filter(
        ({ id }) =>
          !(
            id.value == existingMemberUpdate.id.value &&
            id.type == existingMemberUpdate.id.type
          )
      ),
      existingMemberUpdate,
    ];
  };

  const deleteTag = (tag: CRUDRequest<null>) => {
    // if we were gonna create this tag, don't
    if (changes.create.tags.some(({ id }) => id.value === tag.id.value)) {
      changes.create.tags = changes.create.tags.filter(
        ({ id }) => id.value !== tag.id.value
      );
      return;
    }

    // otherwise, delete this tag
    if (!changes.delete.tags.some(({ id }) => id.value === tag.id.value)) {
      changes.delete.tags.push(tag);
    }
  };

  const deleteImage = (image: CRUDRequest<null>) => {
    // if we were gonna update this image, don't
    if (
      changes.update.projectImages.some(
        ({ id }) => id.value === image.id.value && id.type === image.id.type
      )
    ) {
      changes.update.projectImages = changes.update.projectImages.filter(
        ({ id }) => !(id.value === image.id.value && id.type === image.id.type)
      );
    }

    // if we were gonna create this image, don't
    if (
      image.id.type === "local" &&
      changes.create.projectImages.some(({ id }) => id.value === image.id.value)
    ) {
      changes.create.projectImages = changes.create.projectImages.filter(
        ({ id }) => id.value !== image.id.value
      );
      return;
    }

    // otherwise, delete this image
    if (
      image.id.type === "canon" &&
      !changes.delete.projectImages.some(
        ({ id }) => id.value === image.id.value
      )
    ) {
      changes.delete.projectImages.push(image);
    }
  };

  const deleteSocial = (social: CRUDRequest<null>) => {
    // if we were gonna update this social, don't
    if (
      changes.update.projectSocials.some(
        ({ id }) => id.value === social.id.value && id.type === social.id.type
      )
    ) {
      changes.update.projectSocials = changes.update.projectSocials.filter(
        ({ id }) =>
          !(id.value === social.id.value && id.type === social.id.type)
      );
    }

    // if we were gonna create this social, don't
    if (
      social.id.type === "local" &&
      changes.create.projectSocials.some(
        ({ id }) => id.value === social.id.value
      )
    ) {
      changes.create.projectSocials = changes.create.projectSocials.filter(
        ({ id }) => id.value !== social.id.value
      );
      return;
    }

    // otherwise, delete this socials
    if (
      social.id.type === "canon" &&
      !changes.delete.projectSocials.some(
        ({ id }) => id.value === social.id.value
      )
    ) {
      changes.delete.projectSocials.push(social);
    }
  };

  const deleteJob = (job: CRUDRequest<null>) => {
    // if we were gonna update this job, don't
    if (
      changes.update.jobs.some(
        ({ id }) => id.value === job.id.value && id.type === job.id.type
      )
    ) {
      changes.update.jobs = changes.update.jobs.filter(
        ({ id }) => !(id.value === job.id.value && id.type === job.id.type)
      );
    }

    // if we were gonna create this job, don't
    if (
      job.id.type === "local" &&
      changes.create.jobs.some(({ id }) => id.value === job.id.value)
    ) {
      changes.create.jobs = changes.create.jobs.filter(
        ({ id }) => !(id.value === job.id.value && id.type === job.id.type)
      );
      return;
    }

    // otherwise, delete this job
    if (
      job.id.type === "canon" &&
      !changes.delete.jobs.some(({ id }) => id.value === job.id.value)
    ) {
      changes.delete.jobs.push(job);
    }
  };

  const deleteMember = (member: CRUDRequest<null>) => {
    // if we were gonna update this member, don't
    if (
      changes.update.members.some(
        ({ id }) => id.value === member.id.value && id.type === member.id.type
      )
    ) {
      changes.update.members = changes.update.members.filter(
        ({ id }) =>
          !(id.value === member.id.value && id.type === member.id.type)
      );
    }

    // if we were gonna create this member, don't
    if (
      member.id.type === "local" &&
      changes.create.members.some(({ id }) => id.value === member.id.value)
    ) {
      changes.create.members = changes.create.members.filter(
        ({ id }) => id.value !== member.id.value
      );
      return;
    }

    // otherwise, delete this member
    if (
      member.id.type === "canon" &&
      !changes.delete.members.some(({ id }) => id.value === member.id.value)
    ) {
      changes.delete.members.push(member);
    }
  };

  const deleteMedium = (medium: CRUDRequest<null>) => {
    // if we were gonna add this medium, don't
    if (changes.create.mediums.some(({ id }) => id.value === medium.id.value)) {
      changes.create.mediums = changes.create.mediums.filter(
        ({ id }) => id.value !== medium.id.value
      );
      return;
    }

    // otherwise, delete this medium
    if (
      !changes.delete.mediums.some(({ id }) => id.value === medium.id.value)
    ) {
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
    updateThumbnail,
    deleteTag,
    deleteImage,
    deleteSocial,
    deleteJob,
    deleteMember,
    deleteMedium,
    getSavedProject,
  };
};
