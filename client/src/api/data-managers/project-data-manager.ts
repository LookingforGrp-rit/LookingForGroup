import {
  AddProjectMediumInput,
  AddProjectSocialInput,
  AddProjectTagInput,
  ApiResponse,
  CreateProjectImageInput,
  CreateProjectJobInput,
  CreateProjectMemberInput,
  SendProjectInviteInput,
  CreateProjectVideoInput,
  ProjectWithFollowers,
  UpdateProjectImageInput,
  UpdateProjectInput,
  UpdateProjectJobInput,
  UpdateProjectMemberInput,
  UpdateProjectSocialInput,
  UpdateProjectTagInput,
  UpdateProjectThumbnailInput,
  UpdateJobSkillInput,
  AddJobSkillInput,
  DeleteJobSkillInput,
  ProjectJob,
  UpdateMemberRequestInput,
} from "@looking-for-group/shared";
import {
  sendInvite,
  addPic,
  addProjectJob,
  addProjectMedium,
  addProjectSocial,
  addProjectTag,
  addVideo,
  deleteVideo as deleteVideoAPI,
  deleteMember as deleteMemberAPI,
  deletePic,
  deleteProjectJob,
  deleteProjectMedium,
  deleteProjectSocial,
  deleteProjectTag,
  deleteMemberRequest as deleteMemberRequestAPI,
  getByID,
  updateMember as updateMemberAPI,
  updateMemberRequest as updateMemberRequestAPI,
  updatePic,
  updateProject,
  updateProjectJob,
  updateProjectSocial,
  updateProjectTag,
  updateThumb,
  updateJobSkill,
  addJobSkill,
  deleteJobSkill,
} from "../projects";
import {
  CRUDRequest,
  ProjectChanges,
  ProjectChangesCreates,
  ProjectChangesDeletes,
  ProjectChangesUpdates,
} from "../../../types/types";

/**
 * The Data Manager holds all information about a project before it is updated on the server.
 * @param projectId The database id of the project whose data is being changed.
 * @returns Methods for editing a project.
 */
export const projectDataManager = async (projectId: number) => {
  /**
   * Pulls all project data from the server.
   * @returns The downloaded project
   */
  const downloadProject = async () => {
    const projectResponse = await getByID(projectId);
    if (projectResponse.error || !projectResponse.data) {
      throw new Error("Error fetching project " + projectResponse.error);
    }

    return projectResponse.data;
  };

  /**
   * Creates a new blank object for storing future changes.
   * @returns A {@link ProjectChanges} object with no changes.
   */
  const getEmptyChanges = () => {
    const emptyChanges: ProjectChanges = {
      create: {
        tags: [],
        projectImages: [],
        projectSocials: [],
        projectVideos: [],
        jobs: [],
        jobSkills: [],
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
            type: "canon",
            value: projectId,
          },
          data: {} as UpdateProjectThumbnailInput,
        },
        tags: [],
        projectImages: [],
        projectSocials: [],
        jobs: [],
        jobSkills: [],
        members: [],
        memberRequests: [],
      },
      delete: {
        tags: [],
        projectImages: [],
        projectSocials: [],
        projectVideos: [],
        jobs: [],
        jobSkills: [],
        members: [],
        mediums: [],
        memberRequests: [],
      },
    };

    return emptyChanges;
  };

  /**
   * the project in its current canonical state.
   */
  let savedProject: ProjectWithFollowers = await downloadProject();

  /**
   * the changes we are about to apply to the project.
   */
  let changes: ProjectChanges = getEmptyChanges();

  /**
   * an array used for applying canon jobId to job skills before they're created.
   */
  const jobIdArray: {localId: number, jobId: number}[] = [];

  /**
   * For each change, did it succeed on the server side?
   */
  type SuccessArray = {
    /**
     * The canon or local id of a change
     */
    id: number;

    /**
     * Was it successfully executed on the server?
     */
    succeeded: boolean;
  }[];

  /**
   * Pulls project from the server and loads it into {@link savedProject}
   */
  const reloadSavedProject = async () => {
    savedProject = await downloadProject();
  };

  /**
   * Accessor method for the {@link savedProject} object.
   * @returns The project data.
   */
  const getSavedProject = () => savedProject;

  /**
   * Resets {@link changes} object to empty
   */
  const resetChanges = () => {
    changes = getEmptyChanges();
  };

  /**
   * Uploads changes to the server, reloads the {@link savedProject}, and clears the {@link changes} object.
   * Attempts all changes, even if some error.
   * @throws Throws an error if any change failed. Error message includes the failed changes.
   * Failed changes do not return to the {@link changes} object.
   */
  const saveChanges = async () => {
    //console.log(changes);
    let errorMessage = "";

    // first delete all existing resources
    try {
      await saveDeletes(changes.delete);
    } catch (error) {
      errorMessage += (error as Error).message;
    }

    // then create any new resources
    try {
      await saveCreates(changes.create);
    } catch (error) {
      errorMessage += (error as Error).message;
    }

    // then perform updates on new and existing resources
    try {
      await saveUpdates(changes.update);
    } catch (error) {
      errorMessage += (error as Error).message;
    }

    // fetch new canonical data
    await reloadSavedProject();
    //console.log("New data: ");
    //console.log(savedProject);

    // clear changes object
    resetChanges();

    if (errorMessage != "") {
      throw new Error(`Some changes failed: ${errorMessage}. `);
    }
  };

  /**
   * Used by {@link saveChanges}. Performs all updates.
   * @param updates All the updates to be executed
   */
  const saveUpdates = async (updates: ProjectChangesUpdates) => {
    let errorMessage = "";

    // project fields
    try {
      await runAndCollectErrors<UpdateProjectInput>(
        "Updating project",
        [updates.fields],
        ({ data }) => updateProject(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project tags
    try {
      await runAndCollectErrors<UpdateProjectTagInput>(
        "Updating project tag",
        updates.tags,
        ({ id, data }) => updateProjectTag(projectId, id.value, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project jobs
    try {
      await runAndCollectErrors<UpdateProjectJobInput>(
        "Updating project job",
        updates.jobs,
        ({ id, data }) => updateProjectJob(projectId, id.value, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project members
    try {
      await runAndCollectErrors<UpdateProjectMemberInput>(
        "Updating project member",
        updates.members,
        ({ id, data }) => updateMemberAPI(projectId, id.value, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project images
    try {
      await runAndCollectErrors<UpdateProjectImageInput>(
        "Updating project image",
        updates.projectImages,
        ({ id, data }) => updatePic(projectId, id.value, data)
      );
    } catch (error) {
      // Don't fail completely. This should probably be reverted as AWS is set up
      console.warn("Skipped updating images (backend may be down):", (error as { message: string }).message);
    }

    // project thumbnails
    try {

      // Only update if there is a thumbnail
      if (updates.thumbnail && updates.thumbnail.data && updates.thumbnail.data.thumbnail !== undefined) {
        await runAndCollectErrors<UpdateProjectThumbnailInput>(
          "Updating project thumbnail",
          [updates.thumbnail],
          ({ data }) => updateThumb(projectId, data)
        );
      }

    } catch (error) {
      console.warn("Skipped updating images (backend may be down):", (error as { message: string }).message);
    }

    // project socials
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


    // job skills
    try {
      await runAndCollectErrors<UpdateJobSkillInput>(
        "Updating project social",
        updates.jobSkills,
        ({ id, data }) => updateJobSkill(projectId, id.value, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project member requests
    try {
      await runAndCollectErrors<UpdateMemberRequestInput>(
        "Updating project member requests",
        updates.memberRequests,
        ({ id, data }) => updateMemberRequestAPI(id.value, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    if (errorMessage != "") {
      throw new Error(`Some updates failed: ${errorMessage}. `);
    }
  };

  /**
   * Used by {@link saveChanges}. Performs all creates.
   * @param creates All the resources to be created
   */
  const saveCreates = async (creates: ProjectChangesCreates) => {
    let errorMessage = "";

    // project images
    try {
      await runAndCollectErrors<CreateProjectImageInput>(
        "Creating project image",
        creates.projectImages,
        async ({ id, data }) => {
          //all this is for thumbnail stuff
          const realImage = await addPic(projectId, data);
          if (
            realImage.data &&
            changes.update.thumbnail.data &&
            id.value === changes.update.thumbnail.data.thumbnail
          ) {
            changes.update.thumbnail.data.thumbnail = realImage.data.imageId;
          }
          return realImage;
        }
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project jobs
    try {
      await runAndCollectErrors<CreateProjectJobInput>(
        "Creating project job",
        creates.jobs,
        ({ data }) => addProjectJob(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project videos
    try {
      await runAndCollectErrors<CreateProjectVideoInput>(
        "Creating project video",
        creates.projectVideos,
        ({ data }) => addVideo(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project members
    try {
      await runAndCollectErrors<SendProjectInviteInput>(
        "Sending project invitation to prospective member ",
        creates.members,
        ({ data }) => sendInvite(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project mediums
    try {
      await runAndCollectErrors<AddProjectMediumInput>(
        "Adding project medium",
        creates.mediums,
        ({ data }) => addProjectMedium(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project tags
    try {
      await runAndCollectErrors<AddProjectTagInput>(
        "Adding project tag",
        creates.tags,
        ({ data }) => addProjectTag(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project socials
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

    // job skills
    try {
      for(const skill of changes.create.jobSkills){
      
      //inserting canon job ids into the skills after their associated jobs are created
      for(const ids of jobIdArray){
        if(skill.id.type === "local" && ids.localId === skill.id.value){
          skill.id.value = ids.jobId;
          skill.id.type = 'canon'
        }
      }
      }
      await runAndCollectErrors<AddJobSkillInput>(
        "Adding job skill",
        creates.jobSkills,
        ({ id, data }) => addJobSkill(projectId, id.value, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    if (errorMessage != "") {
      throw new Error(`Some creates failed: ${errorMessage}. `);
    }
  };

  /**
   * Used by {@link saveChanges}. Performs all deletes.
   * @param deletes All the resources to be deleted
   */
  const saveDeletes = async (deletes: ProjectChangesDeletes) => {
    let errorMessage = "";

    // project jobs
    try {
      await runAndCollectErrors<null>(
        "Deleting project job",
        deletes.jobs,
        ({ id }) => deleteProjectJob(projectId, id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project mediums
    try {
      await runAndCollectErrors<null>(
        "Deleting project medium",
        deletes.mediums,
        ({ id }) => deleteProjectMedium(projectId, id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project members
    try {
      await runAndCollectErrors<null>(
        "Deleting project member",
        deletes.members,
        ({ id }) => deleteMemberAPI(projectId, id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project images
    try {
      await runAndCollectErrors<null>(
        "Deleting project image",
        deletes.projectImages,
        ({ id }) => deletePic(projectId, id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project videos
    try {
      await runAndCollectErrors<null>(
        "Deleting project video",
        deletes.projectVideos,
        ({ id }) => deleteVideoAPI(projectId, id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project socials
    try {
      await runAndCollectErrors<null>(
        "Deleting project social",
        deletes.projectSocials,
        ({ id }) => deleteProjectSocial(projectId, id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project tags
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

    // job skills
    try {
      await runAndCollectErrors<DeleteJobSkillInput>(
        "Deleting job skill",
        deletes.jobSkills,
        ({ data }) => deleteJobSkill(projectId, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project member requests
    try {
      await runAndCollectErrors<null>(
        "Deleting project member requests",
        deletes.memberRequests,
        ({ id }) => deleteMemberRequestAPI(id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    if (errorMessage != "") {
      throw new Error(`Some deletes failed: ${errorMessage}. `);
    }
  };

  /**
   * Collects the ids of all the changes that failed on the server.
   * @param statuses Did this change succeed on the server?
   * @returns the ids of each failed change
   */
  const getErrorIds = (statuses: SuccessArray): number[] => {
    return statuses
      .filter(({ succeeded }) => succeeded === false)
      .map(({ id }) => id);
  };

  /**
   * Runs each request for a given action, even if some fail.
   * @param actionLabel Name of the action, such as "Updating project image..."
   * @param requests The API request data
   * @param action The API function that calls the endpoint using the request data
   * @throws Throws an error if any change failed
   */
  async function runAndCollectErrors<T>(
    actionLabel: string,
    requests: CRUDRequest<T>[],
    action: (request: CRUDRequest<T>) => Promise<ApiResponse>
  ): Promise<void> {
    const statuses: SuccessArray = [];

    // TODO can be ran simultaneously if saving takes too long
    // we haven't found this to be a problem.
    for (const request of requests) {
      const response = await action(request);
      if(request.data) {
        const jobSkills = (request.data as UpdateProjectJobInput).jobSkills
        if(jobSkills && jobSkills.length > 0 && request.id.type === "local"){
          jobIdArray.push({localId: request.id.value, jobId: (response.data as ProjectJob).jobId})
        }
      }
      statuses.push({
        id: request.id.value,
        succeeded: !response.error,
      });
    }

    const errors = getErrorIds(statuses);
    if (errors.length > 0) {
      throw new Error(
        `${actionLabel} failed for the following ids: ${errors.join(", ")}. `
      );
    }
  }

  /**
   * Adds a new tag to the project
   * @param tag The tag to be added
   */
  const addTag = (tag: CRUDRequest<AddProjectTagInput>) => {
    if (changes.create.tags.some(({ id }) => id.value === tag.id.value)) {
      changes.create.tags = [
        ...changes.create.tags.filter(({ id }) => id.value !== tag.id.value),
        tag,
      ];
      return;
    }

    changes.create.tags.push(tag);
  };
  /**
   * Adds a new skill to a project job
   * @param skill The skill to be added
   */
  const addProjectJobSkill = (skill: CRUDRequest<AddJobSkillInput>) => {

    changes.create.jobSkills.push(skill);
  };

  /**
   * Adds a new medium to the project
   * @param medium The medium to be added
   */
  const addMedium = (medium: CRUDRequest<AddProjectMediumInput>) => {
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

  /**
   * Adds a new social to the project
   * @param social The social to be added
   */
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

  /**
   * Uploads a new image to the project
   * @param image The image data
   */
  const createImage = (image: CRUDRequest<CreateProjectImageInput>) => {
    changes.create.projectImages.push(image);
  };

  /**
   * Adds a new video to the project
   * @param video The video to be created
   */
  const createVideo = (video: CRUDRequest<CreateProjectVideoInput>) => {
    if (
      changes.create.projectVideos.some(({ id }) => id.value === video.id.value)
    ) {
      changes.create.projectVideos = [
        ...changes.create.projectVideos.filter(
          ({ id }) => id.value !== video.id.value
        ),
        video,
      ];
      return;
    }
    changes.create.projectVideos.push(video);
  };

  /**
   * Adds a new member to a project
   * @param member The member to be added
   */
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

  /**
   * Creates a new job and adds it to the project
   * @param job The job to be created
   */
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

  /**
   * Updates the basic attributes of a project
   * @param fields The fields to be updated and their updates
   */
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

  /**
   * Updates an existing image of a project
   * @param image The image to be updated and its new data
   */
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

  /**
   * Updates an existing tag of a project
   * @param tag The tag to be updated and its new data
   */
  const updateTag = (tag: CRUDRequest<UpdateProjectTagInput>) => {
    let existingTagUpdate = changes.update.tags.find(
      ({ id }) => id.value === tag.id.value && id.type === tag.id.type
    );

    existingTagUpdate = {
      id: tag.id,
      data: {
        ...existingTagUpdate?.data,
        ...tag.data,
      },
    };

    changes.update.tags = [
      ...changes.update.tags.filter(
        ({ id }) =>
          !(
            id.value == existingTagUpdate.id.value &&
            id.type == existingTagUpdate.id.type
          )
      ),
      existingTagUpdate,
    ];
  };

  /**
   * Updates an existing job skill
   * @param skill The skill to be updated and its new data
   */
  const updateProjectJobSkill = (skill: CRUDRequest<UpdateJobSkillInput>) => {
    let existingSkillUpdate = changes.update.jobSkills.find(
      ({ id }) => id.value === skill.id.value && id.type === skill.id.type
    );

    existingSkillUpdate = {
      id: skill.id,
      data: {
        ...existingSkillUpdate?.data,
        ...skill.data,
      },
    };

    changes.update.jobSkills = [
      ...changes.update.jobSkills.filter(
        ({ id }) =>
          !(
            id.value == existingSkillUpdate.id.value &&
            id.type == existingSkillUpdate.id.type
          )
      ),
      existingSkillUpdate,
    ];
  };

  /**
   * Updates an existing social of a project
   * @param social The social to be updated and its new data
   */
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

  /**
   * Updates an existing job of a project
   * @param job The job to be updated and its new data
   */
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

  /**
   * Updates the thumbnail of a project
   * @param thumbnail The new data
   */
  const updateThumbnail = (
    thumbnail: CRUDRequest<UpdateProjectThumbnailInput>
  ) => {
    changes.update.thumbnail = {
      id: thumbnail.id,
      data: {
        thumbnail: thumbnail.data.thumbnail, //a thumbnail data sandwich
      },
    };
  };

  /**
   * Updates an existing member of a project
   * @param member The member to be updated and its new data
   */
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

  /**
   * Updates an existing member request of a project
   * @param request The request to be updated and its new data
   */
  const updateMemberRequest = (request: CRUDRequest<UpdateMemberRequestInput>) => {
    let existingRequestUpdate = changes.update.memberRequests.find(
      ({ id }) => id.value === request.id.value && id.type === request.id.type
    );

    existingRequestUpdate = {
      id: request.id,
      data: {
        ...existingRequestUpdate?.data,
        ...request.data,
      },
    };

    changes.update.memberRequests = [
      ...changes.update.memberRequests.filter(
        ({ id }) =>
          !(
            id.value == existingRequestUpdate.id.value &&
            id.type == existingRequestUpdate.id.type
          )
      ),
      existingRequestUpdate,
    ];
  };

  /**
   * Deletes an existing tag of a project
   * @param tag The tag to be deleted
   */
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

  /**
   * Deletes an existing image of a project
   * @param image The image to delete
   */
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

  /**
   * Removes an existing video from a project
   * @param video The video to delete
   */
  const deleteVideo = (video: CRUDRequest<null>) => {
    // if we were gonna create this video, don't
    if (
      video.id.type === "local" &&
      changes.create.projectVideos.some(({ id }) => id.value === video.id.value)
    ) {
      changes.create.projectVideos = changes.create.projectVideos.filter(
        ({ id }) => id.value !== video.id.value
      );
      return;
    }

    // otherwise, delete this video
    if (
      video.id.type === "canon" &&
      !changes.delete.projectVideos.some(({ id }) => id.value === video.id.value)
    ) {
      changes.delete.projectVideos.push(video);
    }
  };

  /**
   * Deletes an existing social of a project
   * @param social The social to delete
   */
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


  /**
   * Deletes an existing skill of a project job
   * @param skill The skill to delete
   */
  const deleteProjectJobSkill = (skill: CRUDRequest<DeleteJobSkillInput>) => {
    // if we were gonna update this skill, don't
    if (
      changes.update.jobSkills.some(
        ({ id }) => id.value === skill.id.value && id.type === skill.id.type
      )
    ) {
      changes.update.jobSkills = changes.update.jobSkills.filter(
        ({ id }) =>
          !(id.value === skill.id.value && id.type === skill.id.type)
      );
    }

    // if we were gonna create this skill, don't
    if (
      skill.id.type === "local" &&
      changes.create.projectSocials.some(
        ({ id }) => id.value === skill.id.value
      )
    ) {
      changes.create.jobSkills = changes.create.jobSkills.filter(
        ({ id }) => id.value !== skill.id.value
      );
      return;
    }

    // otherwise, delete this skill
    if (
      skill.id.type === "canon" &&
      !changes.delete.jobSkills.some(
        ({ id }) => id.value === skill.id.value
      )
    ) {
      changes.delete.jobSkills.push(skill);
    }
  };

  /**
   * Deletes an existing job of a project
   * @param job The job to delete
   */
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

  /**
   * Removes an existing member of a project
   * @param member The member to delete
   */
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

  /**
   * Removes an existing member request of a project
   * @param request The member request to delete
   */
  const deleteMemberRequest = (request: CRUDRequest<null>) => {
    // if we were gonna update this request, don't
    if (
      changes.update.memberRequests.some(
        ({ id }) => id.value === request.id.value && id.type === request.id.type
      )
    ) {
      changes.update.memberRequests = changes.update.memberRequests.filter(
        ({ id }) =>
          !(id.value === request.id.value && id.type === request.id.type)
      );
    }

    // otherwise, delete this member request
    if (
      request.id.type === "canon" &&
      !changes.delete.memberRequests.some(({ id }) => id.value === request.id.value)
    ) {
      changes.delete.memberRequests.push(request);
    }
  };

  /**
   * Removes an existing medium from a project
   * @param medium The medium to delete
   */
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
    addProjectJobSkill,
    updateProjectJobSkill,
    deleteProjectJobSkill,
    addMedium,
    addSocial,
    createImage,
    createMember,
    createJob,
    createVideo,
    updateFields,
    updateImage,
    updateTag,
    updateSocial,
    updateJob,
    updateMember,
    updateMemberRequest,
    updateThumbnail,
    deleteTag,
    deleteImage,
    deleteSocial,
    deleteVideo,
    deleteJob,
    deleteMember,
    deleteMemberRequest,
    deleteMedium,
    getSavedProject,
  };
};
