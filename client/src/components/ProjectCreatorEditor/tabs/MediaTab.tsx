// --- Imports ---
import { useCallback } from "react";
import {
  CreateProjectImageInput,
  ProjectImage,
} from "@looking-for-group/shared";
import { PopupButton } from "../../Popup";
import { ProjectImageUploader } from "../../ImageUploader";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
import { PendingProject, PendingProjectImage } from "@looking-for-group/client";
import { FileImage } from "../../FileImage";
import placeholder from "../../../images/project_temp.png";

let projectAfterMediaChanges: PendingProject;

let localIdIncrement = 0;

// --- Variables ---
type MediaTabProps = {
  dataManager: Awaited<ReturnType<typeof projectDataManager>>;
  projectData: PendingProject;
  saveProject?: () => void;
  updatePendingProject: (updatedPendingProject: PendingProject) => void;
  failCheck: boolean;
};

// --- Component ---
export const MediaTab = ({
  dataManager,
  projectData,
  saveProject = () => {},
  updatePendingProject,
  failCheck,
}: MediaTabProps) => {
  // --- Hooks ---
  // tracking project modifications
  // const [projectAfterMediaChanges, setModifiedProject] =
  //   useState<ProjectDetail>(projectData);

  // // Update data when data is changed
  // useEffect(() => {
  //   setModifiedProject(projectData);
  // }, [projectData]);

  // // Update parent state when data is changed
  // useEffect(() => {
  //   setProjectData(projectAfterMediaChanges);
  // }, [projectAfterMediaChanges, setProjectData]);

  projectAfterMediaChanges = structuredClone(projectData);
  const projectId = projectData.projectId!;

  // Handle image upload
  const handleImageUpload = useCallback(async () => {
    // Get image in input element
    const imageUploader = document.getElementById(
      "image-uploader"
    ) as HTMLInputElement;
    if (!imageUploader?.files?.length) return;

    const file = imageUploader.files[0];
    if (!["image/jpeg", "image/png"].includes(file.type)) return;

    if (!projectId) return;

    // Uploading image to backend
    try {
      const fullImg = {
        image: file,
        // altText: imageUploader.alt, //it looks like this is where the text would go?
        altText: "A project image", // FIXME there is no way for users to enter alt text
      } as CreateProjectImageInput;

      console.log(fullImg);

      const localId = ++localIdIncrement;

      dataManager.createImage({
        id: {
          value: localId,
          type: "local",
        },
        data: fullImg,
      });

      projectAfterMediaChanges = {
        ...projectAfterMediaChanges,
        projectImages: [
          ...projectAfterMediaChanges.projectImages,
          {
            localId,
            ...fullImg,
          },
        ],
      };

      updatePendingProject(projectAfterMediaChanges);
    } catch (err) {
      console.error(err);
    }

    imageUploader.value = "";
  }, [dataManager, projectId, updatePendingProject]);

  // Handle new thumbnail
  const handleThumbnailChange = useCallback(
    async (projectImage: ProjectImage | PendingProjectImage) => {
      //updateProject has to take a file
      if (!projectId) return;
      let imageFile: File;
      if ((projectImage as ProjectImage).imageId) {
        const response = await fetch((projectImage as ProjectImage).image);
        if (!response.ok) return;

        const blob = await response.blob();
        imageFile = new File([blob], projectImage.image as string);
      } else {
        if ((projectImage as PendingProjectImage).image === null) return;
        imageFile = projectImage.image as File;
      }

      dataManager.updateFields({
        id: {
          value: projectId,
          type: "canon",
        },
        data: {
          thumbnail: imageFile,
        },
      });

      projectAfterMediaChanges = {
        ...projectAfterMediaChanges,
        thumbnail: {
          localId:
            (projectImage as PendingProjectImage).localId ?? ++localIdIncrement,
          image: imageFile,
          altText: "project thumbnail",
        },
      };

      updatePendingProject(projectAfterMediaChanges);
    },
    [dataManager, projectId, updatePendingProject]
  );

  // Handle image deletion
  const handleImageDelete = useCallback(
    async (projectImage: ProjectImage | PendingProjectImage) => {
      if (!projectId) return;

      // delete server image
      if ((projectImage as ProjectImage).imageId) {
        dataManager.deleteImage({
          id: {
            value: (projectImage as ProjectImage).imageId,
            type: "canon",
          },
          data: null,
        });

        projectAfterMediaChanges.projectImages =
          projectAfterMediaChanges.projectImages.filter(
            (image) =>
              (image as ProjectImage).imageId !==
              (projectImage as ProjectImage).imageId
          );

        updatePendingProject(projectAfterMediaChanges);
        return;
      }

      // delete local image
      if ((projectImage as PendingProjectImage).localId) {
        dataManager.deleteImage({
          id: {
            value: (projectImage as PendingProjectImage).localId!,
            type: "local",
          },
          data: null,
        });

        projectAfterMediaChanges.projectImages =
          projectAfterMediaChanges.projectImages.filter(
            (image) =>
              (image as PendingProjectImage).localId !==
              (projectImage as PendingProjectImage).localId
          );

        updatePendingProject(projectAfterMediaChanges);
        return;
      }
    },
    [dataManager, projectId, updatePendingProject]
  );

  // --- Complete component ---
  return (
    <div id="project-editor-media">
      <label>Project Images</label>
      <div className="project-editor-extra-info">
        Upload images that showcase your project. Select one image to be used as
        the main thumbnail on the project's discover card.
      </div>
      <div id="project-editor-image-ui">
        {projectAfterMediaChanges.projectImages?.map((projectImage) => {
          let image;
          if (!projectImage.image) {
            image = <></>;
          } else if ((projectImage as ProjectImage).imageId) {
            image = (
              <img
                src={(projectImage as ProjectImage).image}
                alt={(projectImage as ProjectImage).altText}
                onError={(e) => {
                  const profileImg = e.target as HTMLImageElement;
                  profileImg.src = placeholder;
                }}
              />
            );
          } else {
            image = (
              <FileImage
                file={(projectImage as PendingProjectImage).image!}
                alt={
                  (projectImage as PendingProjectImage).altText ??
                  "new project image"
                }
              />
            );
          }

          return (
            <div
              className="project-editor-image-container"
              key={
                (projectImage as ProjectImage).imageId ??
                "pending-" + (projectImage as PendingProjectImage).localId
              }
            >
              {image}
              {projectAfterMediaChanges.thumbnail === projectImage.image && (
                <img
                  src="/images/icons/star-filled.svg"
                  alt="star"
                  className="star-filled"
                ></img>
              )}
              <div className="project-image-hover">
                <button
                  id={
                    projectAfterMediaChanges.thumbnail === projectImage.image
                      ? "selected-thumbnail"
                      : ""
                  }
                  className={
                    projectAfterMediaChanges.thumbnail === projectImage.image
                      ? "star-filled"
                      : "star"
                  }
                  onClick={() => handleThumbnailChange(projectImage)}
                >
                  <img
                    src={
                      projectAfterMediaChanges.thumbnail ===
                        projectImage.image ||
                      (
                        projectAfterMediaChanges.thumbnail as PendingProjectImage
                      )?.localId ===
                        (projectImage as PendingProjectImage)?.localId
                        ? "/images/icons/star-filled.svg"
                        : "/images/icons/star.svg"
                    }
                    alt="star"
                  ></img>
                </button>
                <button
                  className="delete-image"
                  onClick={() => handleImageDelete(projectImage)}
                >
                  <img src="/images/icons/delete-black.svg" alt="trash"></img>
                </button>
              </div>
            </div>
          );
        })}
        <div id="project-editor-add-image">
          <ProjectImageUploader onFileSelected={handleImageUpload} />
        </div>
      </div>
      <div id="general-save-info">
        <PopupButton
          buttonId="project-editor-save"
          callback={saveProject}
          doNotClose={() => !failCheck}
        >
          Save Changes
        </PopupButton>
      </div>
    </div>
  );
};
