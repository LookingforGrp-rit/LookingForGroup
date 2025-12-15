import {
  AddUserMajorInput,
  AddUserSkillsInput,
  AddUserSocialInput,
  ApiResponse,
  MePrivate,
  UpdateUserInput,
  UpdateUserProjectVisibilityInput,
  UpdateUserSkillInput,
  UpdateUserSocialInput,
} from "@looking-for-group/shared";
import {
  CRUDRequest,
  UserChanges,
  UserChangesCreates,
  UserChangesDeletes,
  UserChangesUpdates,
} from "../../../types/types";
import {
  addUserMajor,
  addUserSkill,
  addUserSocial,
  deleteUserMajor,
  deleteUserSkill,
  deleteUserSocial,
  editUser,
  getCurrentAccount,
  updateProjectVisibility as APIUpdateProjectVisibility,
  updateUserSkill,
  updateUserSocial,
} from "../users";

/**
 * The Data Manager holds all information about a user before it is updated on the server.
 * @returns Methods for editing a user.
 */
export const userDataManager = async () => {
  /**
   * Pulls all user data from the server.
   * @returns The downloaded user
   */
  const downloadUser = async () => {
    const projectResponse = await getCurrentAccount();
    if (projectResponse.error || !projectResponse.data) {
      throw new Error("Error fetching project " + projectResponse.error);
    }

    return projectResponse.data;
  };

  /**
   * Creates a new blank object for storing future changes.
   * @returns A {@link UserChanges} object with no changes.
   */
  const getEmptyChanges = async () => {
    const savedUser = await downloadUser();
    const emptyChanges: UserChanges = {
      create: {
        majors: [],
        skills: [],
        socials: [],
      },
      update: {
        fields: {
          id: {
            type: "canon",
            value: savedUser.userId,
          },
          data: {},
        },
        skills: [],
        socials: [],
        projectVisibilities: [],
      },
      delete: {
        majors: [],
        skills: [],
        socials: [],
      },
    };

    return emptyChanges;
  };

  let savedUser: MePrivate = await downloadUser();
  let changes: UserChanges = await getEmptyChanges();
  type SuccessArray = {
    id: number;
    succeeded: boolean;
  }[];

  /**
   * Pulls user from the server and loads it into savedUser
   */
  const reloadSavedUser = async () => {
    savedUser = await downloadUser();
  };

  /**
   * Accessor method for the {@link savedUser} object.
   * @returns The user data.
   */
  const getSavedUser = () => savedUser;

  /**
   * Resets {@link changes} object to empty
   */
  const resetChanges = async () => {
    changes = await getEmptyChanges();
  };

  /**
   * Uploads changes to the server, reloads the {@link savedUser}, and clears the {@link changes} object.
   * Attempts all changes, even if some error.
   * @throws Throws an error if any change failed. Error message includes the failed changes.
   * Failed changes do not return to the {@link changes} object.
   */
  const saveChanges = async () => {
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
    await reloadSavedUser();

    // clear changes object
    await resetChanges();

    if (errorMessage != "") {
      throw new Error(`Some changes failed: ${errorMessage}. `);
    }
  };

  /**
   * Used by {@link saveChanges}. Performs all updates.
   * @param updates All the updates to be executed
   */
  const saveUpdates = async (updates: UserChangesUpdates) => {
    let errorMessage = "";

    // fields
    try {
      await runAndCollectErrors<UpdateUserInput>(
        "Updating user",
        [updates.fields],
        ({ data }) => editUser(data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // project visibilities
    try {
      await runAndCollectErrors<UpdateUserProjectVisibilityInput>(
        "Updating project visibility",
        updates.projectVisibilities,
        ({ id, data }) => APIUpdateProjectVisibility(id.value, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // skills
    try {
      await runAndCollectErrors<UpdateUserSkillInput>(
        "Updating user skill",
        updates.skills,
        ({ id, data }) => updateUserSkill(id.value, data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // socials
    try {
      await runAndCollectErrors<UpdateUserSocialInput>(
        "Updating user social",
        updates.socials,
        ({ id, data }) => updateUserSocial(id.value, data)
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
  const saveCreates = async (creates: UserChangesCreates) => {
    let errorMessage = "";

    // majors
    try {
      await runAndCollectErrors<AddUserMajorInput>(
        "Adding user major",
        creates.majors,
        ({ data }) => addUserMajor(data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // skills
    try {
      await runAndCollectErrors<AddUserSkillsInput>(
        "Adding user skill",
        creates.skills,
        ({ data }) => addUserSkill(data)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // socials
    try {
      await runAndCollectErrors<AddUserSocialInput>(
        "Adding user social",
        creates.socials,
        ({ data }) => addUserSocial(data)
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
  const saveDeletes = async (deletes: UserChangesDeletes) => {
    let errorMessage = "";

    // majors
    try {
      await runAndCollectErrors<null>(
        "Deleting user major",
        deletes.majors,
        ({ id }) => deleteUserMajor(id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // skills
    try {
      await runAndCollectErrors<null>(
        "Deleting user skill",
        deletes.skills,
        ({ id }) => deleteUserSkill(id.value)
      );
    } catch (error) {
      errorMessage += (error as { message: string }).message;
    }

    // socials
    try {
      await runAndCollectErrors<null>(
        "Deleting user social",
        deletes.socials,
        ({ id }) => deleteUserSocial(id.value)
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
  const getErrorIds = (statuses: SuccessArray): (number | string)[] => {
    return statuses
      .filter(({ succeeded }) => succeeded === false)
      .map(({ id }) => id);
  };

  /**
   * Runs each request for a given action, even if some fail.
   * @param actionLabel Name of the action, such as "Updating user social..."
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
      const succeeded = !response.error;
      statuses.push({
        id: request.id.value,
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

  /**
   * Adds a new major to a user
   * @param major The major to be added
   */
  const addMajor = (major: CRUDRequest<AddUserMajorInput>) => {
    if (changes.create.majors.some(({ id }) => id.value === major.id.value)) {
      changes.create.majors = [
        ...changes.create.majors.filter(
          ({ id }) => id.value !== major.id.value
        ),
        major,
      ];
      return;
    }

    changes.create.majors.push(major);
  };

  /**
   * Adds a new skill to a user
   * @param skill The skill to be added
   */
  const addSkill = (skill: CRUDRequest<AddUserSkillsInput>) => {
    if (changes.create.skills.some(({ id }) => id.value === skill.id.value)) {
      changes.create.skills = [
        ...changes.create.skills.filter(
          ({ id }) => id.value !== skill.id.value
        ),
        skill,
      ];
      return;
    }

    changes.create.skills.push(skill);
  };

  /**
   * Adds a new social link to a user
   * @param social The social to be added
   */
  const addSocial = (social: CRUDRequest<AddUserSocialInput>) => {
    if (changes.create.socials.some(({ id }) => id.value === social.id.value)) {
      changes.create.socials = [
        ...changes.create.socials.filter(
          ({ id }) => id.value !== social.id.value
        ),
        social,
      ];
      return;
    }

    changes.create.socials.push(social);
  };

  /**
   * Updates the basic info for a user
   * @param fields The fields and their updated values
   */
  const updateFields = (fields: CRUDRequest<UpdateUserInput>) => {
    changes.update.fields = {
      id: {
        type: "canon",
        value: savedUser.userId,
      },
      data: {
        ...changes.update.fields.data,
        ...fields.data,
      },
    };
  };

  /**
   * Update whether a project is hidden on a user's profile
   * @param visibility The project to be changed and its new visibility
   */
  const updateProjectVisibility = (
    visibility: CRUDRequest<UpdateUserProjectVisibilityInput>
  ) => {
    let existingVisibilityUpdate = changes.update.projectVisibilities.find(
      ({ id }) =>
        id.value === visibility.id.value && id.type === visibility.id.type
    );

    existingVisibilityUpdate = {
      id: visibility.id,
      data: {
        ...existingVisibilityUpdate?.data,
        ...visibility.data,
      },
    };

    changes.update.projectVisibilities = [
      ...changes.update.projectVisibilities.filter(
        ({ id }) =>
          !(
            id.value == existingVisibilityUpdate.id.value &&
            id.type == existingVisibilityUpdate.id.type
          )
      ),
      existingVisibilityUpdate,
    ];
  };

  /**
   * Updates an existing skill of a user
   * @param skill The skill to be updated and its new data
   */
  const updateSkill = (skill: CRUDRequest<UpdateUserSkillInput>) => {
    let existingSkillUpdate = changes.update.skills.find(
      ({ id }) => id.value === skill.id.value && id.type === skill.id.type
    );

    existingSkillUpdate = {
      id: skill.id,
      data: {
        ...existingSkillUpdate?.data,
        ...skill.data,
      },
    };

    changes.update.skills = [
      ...changes.update.skills.filter(
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
   * Updates an existing social for a user
   * @param social The social to be updated and its new data
   */
  const updateSocial = (social: CRUDRequest<UpdateUserSocialInput>) => {
    let existingSocialUpdate = changes.update.socials.find(
      ({ id }) => id.value === social.id.value && id.type === social.id.type
    );

    existingSocialUpdate = {
      id: social.id,
      data: {
        ...existingSocialUpdate?.data,
        ...social.data,
      },
    };

    changes.update.socials = [
      ...changes.update.socials.filter(
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
   * Removes an existing major from a user
   * @param major The major to be removed
   */
  const deleteMajor = (major: CRUDRequest<null>) => {
    // if we were gonna create this major, don't
    if (
      major.id.type === "local" &&
      changes.create.majors.some(({ id }) => id.value === major.id.value)
    ) {
      changes.create.majors = changes.create.majors.filter(
        ({ id }) => id.value !== major.id.value
      );
      return;
    }

    // otherwise, delete this major
    if (
      major.id.type === "canon" &&
      !changes.delete.majors.some(({ id }) => id.value === major.id.value)
    ) {
      changes.delete.majors.push(major);
    }
  };

  /**
   * Deletes an existing skill from a user
   * @param skill The skill to be deleted
   */
  const deleteSkill = (skill: CRUDRequest<null>) => {
    // if we were gonna update this skill, don't
    if (
      changes.update.skills.some(
        ({ id }) => id.value === skill.id.value && id.type === skill.id.type
      )
    ) {
      changes.update.skills = changes.update.skills.filter(
        ({ id }) => !(id.value === skill.id.value && id.type === skill.id.type)
      );
    }

    // if we were gonna create this skill, don't
    if (
      skill.id.type === "local" &&
      changes.create.skills.some(({ id }) => id.value === skill.id.value)
    ) {
      changes.create.skills = changes.create.skills.filter(
        ({ id }) => id.value !== skill.id.value
      );
      return;
    }

    // otherwise, delete this skill
    if (
      skill.id.type === "canon" &&
      !changes.delete.skills.some(({ id }) => id.value === skill.id.value)
    ) {
      changes.delete.skills.push(skill);
    }
  };

  /**
   * Deletes an existing social from a user
   * @param social The social to be deleted
   */
  const deleteSocial = (social: CRUDRequest<null>) => {
    // if we were gonna update this social, don't
    if (
      changes.update.socials.some(
        ({ id }) => id.value === social.id.value && id.type === social.id.type
      )
    ) {
      changes.update.socials = changes.update.socials.filter(
        ({ id }) =>
          !(id.value === social.id.value && id.type === social.id.type)
      );
    }

    // if we were gonna create this social, don't
    if (
      social.id.type === "local" &&
      changes.create.socials.some(({ id }) => id.value === social.id.value)
    ) {
      changes.create.socials = changes.create.socials.filter(
        ({ id }) => id.value !== social.id.value
      );
      return;
    }

    // otherwise, delete this social
    if (
      social.id.type === "canon" &&
      !changes.delete.socials.some(({ id }) => id.value === social.id.value)
    ) {
      changes.delete.socials.push(social);
    }
  };

  return {
    saveChanges,
    addMajor,
    addSkill,
    addSocial,
    updateFields,
    updateProjectVisibility,
    updateSkill,
    updateSocial,
    deleteMajor,
    deleteSkill,
    deleteSocial,
    getSavedUser,
  };
};
