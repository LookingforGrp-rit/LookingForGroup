// --- Imports ---
import { useCallback, useEffect, useState, useContext, useRef } from "react";
import {
  CreateProjectImageInput,
  ProjectImage,
  ProjectWithFollowers,
  UpdateProjectImageInput,
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
  unmodifiedProject: ProjectWithFollowers;
  saveProject?: () => Promise<void>;
  updatePendingProject: (updatedPendingProject: PendingProject) => void;
  saveable: boolean;
  failCheck: boolean;
  message: string;
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
  unmodifiedProject,
  saveProject,
  updatePendingProject,
  saveable,
  failCheck,
  message,
}: MediaTabProps) => {

  // An array for tracking the comparison of images and the thumbnail
  // Without this, thumbnail status cannot be checked synchronously
  //but now it can! because i've put the entire project image into the thumbnail you can just check that directly
  //no more roundabout silliness
  //const [comparedIndices, setComparedIndices] = useState<boolean[]>([]);

  const [imageError, setImageError] = useState<string | null>(null);

  const { setOpen: closeOuterPopup } = useContext(PopupContext);

  const [zoom, setZoom] = useState(100);
  const [dX, setDX] = useState(0);
  const [dY, setDY] = useState(0);

  const [cropImg, setCropImg] = useState<ProjectImage | PendingProjectImage>();

  const tempImage = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const inputX = useRef<HTMLInputElement>(null);
  const inputY = useRef<HTMLInputElement>(null);
  const inputZoom = useRef<HTMLInputElement>(null);
  const fileReader = new FileReader();

  projectAfterMediaChanges = structuredClone(projectData);
  const projectId = projectData.projectId!;

  // Initial load
  useEffect(() => {
    const initializeImages = async () => {
      // if only one image or no thumbnail, set thumbnail
      if (projectAfterMediaChanges.projectImages.length >= 1 && !projectAfterMediaChanges.thumbnail) {
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
    tempImage.current?.addEventListener("load", updateCanvas);
    fileReader.onload = () => setCropImg({...cropImg, image: fileReader.result} as PendingProjectImage);
    fileReader.onerror = () => setCropImg({...cropImg, image: placeholder} as ProjectImage);
  }, [tempImage, dX, dY, zoom, cropImg, fileReader, placeholder, setCropImg]);

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
        const imageFile = await stringToFile((image as PendingProjectImage).image?.name as string);
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

      // If only image, set as thumbnail
      //this will always be localId, it's using the recently created image
      if (!projectAfterMediaChanges.thumbnail || projectAfterMediaChanges.projectImages.length == 1) {
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
            thumbnail: thumbObj.localId as number
          }
        });
        // Update project data
        projectAfterMediaChanges = {
          ...projectAfterMediaChanges,
          thumbnail: thumbObj,
        };
      }
      // TODO: check if image needs to be cropped at all
      await updatePendingProject(projectAfterMediaChanges);
      setCropImg({...fullImg, localId: localId});
      fileReader.readAsDataURL(fullImg.image);
    } catch (err) {
      console.error(err);
    }

    imageUploader.value = "";
  }, [dataManager, projectId, updatePendingProject, setCropImg, fileReader, tempImage, cropImg]);
  /**
   * updates the canvas element for cropping images
   */
  const updateCanvas = useCallback(() => {
    const ctx = canvas.current?.getContext("2d");
    ctx?.clearRect(0, 0, canvas.current?.width as number, canvas.current?.height as number);
    if (tempImage.current && canvas.current)
    ctx?.drawImage(
      tempImage.current, 
      dX, dY,
      tempImage.current.width / 100 * zoom, tempImage.current.height / 100 * zoom);
  }, [tempImage, dX, dY, zoom, canvas]);

  const UpdateImage = useCallback(
    async () => canvas.current?.toBlob((blob) => {
      const indexToUpdate = projectAfterMediaChanges.projectImages.length - 1;
      const newFile = new File([blob as Blob], (projectAfterMediaChanges.projectImages[indexToUpdate] as PendingProjectImage).image?.name as string);
      const newImg = {
        image: newFile,
        altText: cropImg?.altText
      } as CreateProjectImageInput
      const localId = ++localIdIncrement;
      handleImageDelete(projectAfterMediaChanges.projectImages[indexToUpdate]);
      dataManager.createImage({
        id: {
          value: localId,
          type: "local",
        },
        data: newImg,
      });
      projectAfterMediaChanges = {
        ...projectAfterMediaChanges,
        projectImages: [
          ...projectAfterMediaChanges.projectImages,
          {
            localId,
            ...newImg
          },
        ],
      };
      updatePendingProject(projectAfterMediaChanges);
      setCropImg(undefined);
      }, "images/png", 1)
  , [canvas, cropImg, updatePendingProject, projectAfterMediaChanges]);

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
    <Popup startOpen={true}>
    {cropImg !== undefined ?
    <PopupContent confirmation={true} callback={() => setCropImg(undefined)}>
      <div className="project-crop">
        <label id="project-crop-header">Crop image for thumbnail usage</label>
        <canvas ref={canvas} id="canvas" width={1600} height={900}></canvas>
        <img ref={tempImage} id="test12" src={cropImg?.image as string} alt={cropImg?.altText as string} />
        <div id="zoom-row">
          <input 
            type="range" ref={inputZoom}
            id="zoom" name="zoom" 
            onChange={() => {
              setZoom(inputZoom.current?.valueAsNumber as number);
              updateCanvas();
            }}
            min={1} max={1000}
            defaultValue={zoom}/>
          <label className="slider-text" htmlFor="zoom">Zoom</label>
        </div>
        <div id="xTrans-row">
          <input 
            type="range" ref={inputX}
            id="xTrans" name="xTrans" 
            onChange={() => {
              setDX(inputX.current?.valueAsNumber as number);
              updateCanvas();
            }}
            min={canvas.current ? -canvas.current.width: -100} 
            max={canvas.current ?  canvas.current.width:  100}
            defaultValue={dX}/>
          <label className="slider-text" htmlFor="xtrans">Xpos</label>
        </div>
        <div id="yTrans-row">
          <input  
            type="range" ref={inputY}
            id="yTrans" name="yTrans" 
            onChange={() => {
              setDY(inputY.current?.valueAsNumber as number);
              updateCanvas();
            }}
            min={canvas.current ? -canvas.current.height: -100} 
            max={canvas.current ?  canvas.current.height:  100}
            defaultValue={dY}/>
          <label className="slider-text" htmlFor="yTrans">Ypos</label>
        </div>
        <div className="project-crop-extra-info">
          Crop Image to fit the site's 16:9 ratio, or skip. Not cropping may cause the image to display in other places.
        </div>
        <div className="confirm-project-crop">
          {/* TODO: impliment saving the cropped image */}
          <PopupButton buttonId="project-crop-save" callback={UpdateImage} doNotClose={() => true}>Crop Image</PopupButton>
          <PopupButton buttonId="project-crop-cancel" callback={() => setCropImg(undefined)}className="project-info-buttons" doNotClose={() => true}>Skip</PopupButton>
        </div>
      </div>
    </PopupContent> : "" }
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

      <label style={{marginTop: "10px"}}>Project Videos</label>
      <div className="project-editor-extra-info">
        Provide YouTube video links to have them be embedded on your project page
      </div>
      <div id="project-editor-image-ui">
        <div id="project-editor-add-image">
          <div id="project-image-uploader" className="drop-area">
            <div id="img-view" className="project-uploader">
              {/* <!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}
              <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 448 512">
                <path d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z" fill='var(--neutral-gray)'/>
              </svg>
              <p className="project-editor-extra-info">Click here to add a video</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div id="general-save-info">
        <Popup>
          {saveable ? "" :
          <div id="invalid-input-error" className={"save-error-msg-general"}>
            <p>*{message}*</p>
          </div>}
          <PopupButton
            buttonId="project-editor-save"
            doNotClose={() => failCheck}
            disabled={!saveable}
            className={!saveable ? "disabled" : ""}
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
    </Popup>
  );
};
