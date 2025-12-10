// --- Imports ---
import { useCallback, useEffect, useState, useContext } from "react";
import {
  CreateProjectImageInput,
  ProjectImage,
} from "@looking-for-group/shared";
import { PopupButton, PopupContent, Popup, PopupContext } from "../../Popup";
import { ProjectImageUploader } from "../../ImageUploader";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
import { PendingProject, PendingProjectImage } from "@looking-for-group/client";
import { FileImage } from "../../FileImage";
import placeholder from "../../../images/project_temp.png";
import { ThemeIcon } from "../../ThemeIcon";

let projectAfterMediaChanges: PendingProject;

let localIdIncrement = 0;

type MediaTabProps = {
  dataManager: Awaited<ReturnType<typeof projectDataManager>>;
  projectData: PendingProject;
  saveProject?: () => Promise<void>;
  updatePendingProject: (updatedPendingProject: PendingProject) => void;
  failCheck: boolean;
};

// Convert string to File
const stringToFile = async (s: string) => {

  // Note: This seems imperfect. lastModified value might get changed
  // which affects the entire comparison of File to File. The checks later
  // go around this limitation. 

  const fileResponse = await fetch(s);
  const fileBlob = await fileResponse.blob();
  return new File([fileBlob], s, { type: fileBlob.type });
}

/**
 * Allows users to add and drop media images to display for their project, 
 * as well as displays various other attributes for the project.
 * @param dataManager data manager
 * @param projectData current project data
 * @param saveProject save project changes
 * @param updatePendingProject set modified project
 * @param failCheck indicates if data validation has failed 
 * @returns JSX Element - Main component that renders media tab interface
 */

// --- Component ---
export const MediaTab = ({
  dataManager,
  projectData,
  saveProject,
  updatePendingProject,
  failCheck,
}: MediaTabProps) => {

  // An array for tracking the comparison of images and the thumbnail
  // Without this, thumbnail status cannot be checked synchronously
  //but now it can! because i've put the entire project image into the thumbnail you can just check that directly
  //no more roundabout silliness
  //const [comparedIndices, setComparedIndices] = useState<boolean[]>([]);

  const [imageError, setImageError] = useState<string | null>(null);

  const { setOpen: closeOuterPopup } = useContext(PopupContext);

  projectAfterMediaChanges = structuredClone(projectData);
  const projectId = projectData.projectId!;

  // Initial load
  useEffect(() => {
    const initializeImages = async () => {
      // if only one image or no thumbnail, set thumbnail
      if ((projectAfterMediaChanges.projectImages.length === 1 && projectAfterMediaChanges.projectImages[0].image) || !projectAfterMediaChanges.thumbnail) {
        // if image is a string, create file
        if (typeof projectAfterMediaChanges.projectImages[0].image === 'string') {
          const file = await stringToFile(projectAfterMediaChanges.projectImages[0].image);

          // set thumbnail
          projectAfterMediaChanges = {
            ...projectAfterMediaChanges,
            thumbnail: {
              localId: 1,
              image: file,
              altText: "project thumbnail",
            },
          }
        }
        else {
          // set thumbnail
          projectAfterMediaChanges = {
            ...projectAfterMediaChanges,
            thumbnail: {
              localId: 1,
              image: projectAfterMediaChanges.projectImages[0].image,
              altText: "project thumbnail",
            },
          }
        }
      }
    }
    initializeImages();
  });

  // Checks whether a valid image has been uploaded and modifies modifiedProject
  const handleImageUpload = useCallback(async () => {
    // Get image in input element
    const imageUploader = document.getElementById(
      "image-uploader"
    ) as HTMLInputElement;
    if (!imageUploader?.files?.length) return;

    const file = imageUploader.files[0];
    if (!["image/jpeg", "image/png"].includes(file.type)) return;

    if (!projectId) return;

    // Check if it is a duplicate image
    for (const image of projectAfterMediaChanges.projectImages) {
      if (typeof image.image === 'string') {
        // convert to file
        const imageFile = await stringToFile(image.image);
        // compare
        if (file.name === imageFile.name && file.size === imageFile.size && file.webkitRelativePath === imageFile.webkitRelativePath) {
          // TODO: add error to show users cannot add duplicate image
          setImageError("*Sorry, no duplicate images here!*")
          return;
        }
      } else {
        if (file.name === image.image?.name && file.size === image.image?.size && file.webkitRelativePath === image.image?.webkitRelativePath) {
          // TODO: add error to show users cannot add duplicate image
           setImageError("*Sorry, no duplicate images here!*")
          return;
        }
      }
    }

    setImageError(null);

    // Uploading image to backend
    try {
      const fullImg = {
        image: file,
        altText: "project image", //does this imageUploader.alt thing work how i expect it to //it did not!
      } as CreateProjectImageInput;

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

      // If only image, set as thumbnail
      //this will always be localId, it's using the recently created image
      if (projectAfterMediaChanges.projectImages.length === 1) {
        // Update dataManager
        const thumbObj = {
            localId: ++localIdIncrement,
            image: fullImg.image,
            altText: fullImg.altText,
        } as PendingProjectImage;
        dataManager.updateThumbnail({
          id: {
            value: projectId,
            type: "canon",
          },
          data: {
            thumbnail: thumbObj.localId ?? ++localIdIncrement
          }
        });
        // Update project data
        projectAfterMediaChanges = {
          ...projectAfterMediaChanges,
          thumbnail: thumbObj,
        };
      }

    } catch (err) {
      console.error(err);
    }

    imageUploader.value = "";
  }, [dataManager, projectId, updatePendingProject]);

  // Checks whether the thumbnail has been modified and updates modifiedProject
  const handleThumbnailChange = useCallback(
    async (projectImage: ProjectImage | PendingProjectImage) => {
      if (!projectId) return;
      

      const thumbId = typeof projectImage.image === 'string'  
          ? (projectImage as ProjectImage).imageId //canon id since the project image already exists
          : (projectImage as PendingProjectImage).localId ?? ++localIdIncrement; //pending project id for new images

      //pendingprojectimage uses a file, projectimage uses a string
      //so this exists to get the different pieces of the projectImage 
      //if it's a string, make it a project image
      if (typeof projectImage.image === 'string'){
      
      dataManager.updateThumbnail({
        id: {
          value: projectId,
          type: "canon",
        },
        data: { 
          thumbnail: thumbId
        },
      });
        projectAfterMediaChanges = {
          ...projectAfterMediaChanges,
          thumbnail: projectImage
        }
      }
      //if it's not, set it as the canon project image
      else {
        const imageFile = projectImage.image;
      dataManager.updateThumbnail({
        id: {
          value: projectId,
          type: "canon",
        },
        data: { 
          thumbnail: thumbId
        },
      });
      projectAfterMediaChanges = {
        ...projectAfterMediaChanges,
        thumbnail: {
          localId: thumbId,
          image: imageFile,
          altText: "project thumbnail",
        },
      }
      }

      updatePendingProject(projectAfterMediaChanges);
    },
    [dataManager, projectId, updatePendingProject]
  );

  // Removes image from page
  const handleImageDelete = useCallback(
    async (projectImage: ProjectImage | PendingProjectImage) => {
      if (!projectId) return;

      let updateThumbnail = false;

      // check if image is thumbnail
      if (projectAfterMediaChanges.thumbnail === projectImage || 
        ("imageId" in projectImage && projectAfterMediaChanges.thumbnailId === projectImage.imageId) ||
      ("localId" in projectImage && projectAfterMediaChanges.thumbnailId === projectImage.localId)) {
        // update after image is deleted and projectImages is updated
        updateThumbnail = true;
      }

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
      }

      // delete local image
      else {
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
      }

      // update thumbnail if there is an image to set it to
      if (updateThumbnail && projectAfterMediaChanges.projectImages.length >= 1) {

        // Handle string type
        if (typeof projectAfterMediaChanges.projectImages[0].image === 'string') {
          const image = projectAfterMediaChanges.projectImages[0];
          const thumbId = (projectAfterMediaChanges.projectImages[0] as ProjectImage).imageId

          // Update dataManager
          dataManager.updateThumbnail({
            id: {
              value: projectId,
              type: "canon",
            },
            data: {
              thumbnail: thumbId,
            }
          });

          // Update project data
          projectAfterMediaChanges = {
            ...projectAfterMediaChanges,
            thumbnail: image,
          };
        }

        // Handle File type
        else {
          const image = projectAfterMediaChanges.projectImages[0].image as File;
          const thumbId = (projectImage as PendingProjectImage).localId ?? ++localIdIncrement

          // Update dataManager
          dataManager.updateThumbnail({
            id: {
              value: projectId,
              type: "canon",
            },
            data: {
              thumbnail: thumbId,
            }
          });

          // Update project data
          projectAfterMediaChanges = {
            ...projectAfterMediaChanges,
            thumbnail: {
              localId: thumbId,
              image: image,
              altText: "project thumbnail",
            },
          };
        }  
      }

      // update hooks
      updatePendingProject(projectAfterMediaChanges);
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

      {/* Display warning upon duplicate image */}
      {imageError && (
        <div id="invalid-input-error">
          <p>{imageError}</p>
        </div>
      )}

      <div id="project-editor-image-ui">
        {projectAfterMediaChanges.projectImages?.map((projectImage) => (
          <div
            className="project-editor-image-container"
            key={
              (projectImage as ProjectImage).imageId ??
              "pending-" + (projectImage as PendingProjectImage).localId
            }
          >
            {/* Present image from database or local storage */}
            {(projectImage as ProjectImage).imageId ? (
              <img
                src={(projectImage as ProjectImage).image}
                alt={(projectImage as ProjectImage).altText}
                onError={(e) => {
                  const profileImg = e.target as HTMLImageElement;
                  profileImg.src = placeholder;
                }}
              />
            ) : (
              <FileImage
                file={(projectImage as PendingProjectImage).image!}
                alt={
                  (projectImage as PendingProjectImage).altText ??
                  ""
                }
              />
            )}

            {/* Add thumbnail star if it is a thumbnail */}
            {/* it checks against the image itself now */}
            {projectAfterMediaChanges.thumbnail?.image === projectImage.image && (
              <ThemeIcon
                id="star"
                className="star filled-star"
                width={26}
                height={26}
                ariaLabel="star"
              />
            )}

            {/* Hover element */}
            <div className="project-image-hover">
              {projectAfterMediaChanges.thumbnail === projectImage || 
        ("imageId" in projectImage && projectAfterMediaChanges.thumbnailId === projectImage.imageId) ||
      ("localId" in projectImage && projectAfterMediaChanges.thumbnailId === projectImage.localId) ?
                <ThemeIcon
                  id="star"
                  className="star filled-star"
                  width={26}
                  height={26}
                  ariaLabel="thumbnail"
                /> :
                <ThemeIcon
                  id="star"
                  className="star empty-star"
                  width={26}
                  height={26}
                  ariaLabel="change thumbnail"
                  onClick={() => handleThumbnailChange(projectImage)}
                />
              }

              {/* Delete icon */}
              <ThemeIcon
                id="trash"
                className="mono-stroke-invert delete-image"
                width={22}
                height={22}
                ariaLabel="delete"
                onClick={() => handleImageDelete(projectImage)}
              />
            </div>
          </div>
        ))}

        {/* Image uploader */}
        <div id="project-editor-add-image">
          <ProjectImageUploader onFileSelected={handleImageUpload} />
        </div>
      </div>

      {/* Save button */}
      <div id="general-save-info">
              <Popup>
                <PopupButton
                  buttonId="project-editor-save"
                  doNotClose={() => failCheck}
                >
                  Save Changes
                </PopupButton>
                  <PopupContent useClose={false}>
                    <div id="confirm-editor-save-text">Are you sure you want to save all changes?</div>
                  <div id="confirm-editor-save">
                 <PopupButton callback={saveProject} closeParent={closeOuterPopup} buttonId="project-editor-save">
                   Confirm
                 </PopupButton>
                 <PopupButton buttonId="team-edit-member-cancel-button" >
                   Cancel
                 </PopupButton>
                 </div>
                  </PopupContent>
              </Popup>
      </div>
    </div>
  );
};
