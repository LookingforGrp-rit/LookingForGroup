// --- Imports ---
import { useCallback, useEffect, useState, useContext } from "react";
import {
  CreateProjectImageInput,
  CreateProjectVideoInput,
  ProjectImage,
  ProjectVideo,
  ProjectWithFollowers,
} from "@looking-for-group/shared";
import { PopupButton, PopupContent, Popup, PopupContext } from "../../Popup";
import { DeleteProjectButton } from "../DeleteProjectButton";
import { ProjectImageUploader } from "../../ImageUploader";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
import { PendingProject, PendingProjectImage } from "@looking-for-group/client";
import { FileImage } from "../../FileImage";
import placeholder from "../../../images/project_temp.png";
import { ThemeIcon } from "../../ThemeIcon";
import { getVideos } from "../../../api/projects";
import { getYouTubeEmbedURL } from "../../../functions/parseYoutube";

let projectAfterMediaChanges: PendingProject;

let localIdIncrement = 0;

type MediaTabProps = {
  dataManager?: Awaited<ReturnType<typeof projectDataManager>>;
  projectData: PendingProject;
  unmodifiedProject: ProjectWithFollowers;
  saveProject?: () => Promise<void>;
  updatePendingProject: (updatedPendingProject: PendingProject) => void;
  saveable: boolean;
  failCheck: boolean;
  updateFailCheck: boolean;
  message: string;
  isSaving : boolean;
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
  updateFailCheck,
  message,
  isSaving,
}: MediaTabProps) => {

  // An array for tracking the comparison of images and the thumbnail
  // Without this, thumbnail status cannot be checked synchronously
  //but now it can! because i've put the entire project image into the thumbnail you can just check that directly
  //no more roundabout silliness
  //const [comparedIndices, setComparedIndices] = useState<boolean[]>([]);

  const [imageError, setImageError] = useState<string | null>(null);

  const { setOpen: closeOuterPopup } = useContext(PopupContext);

  const [videos, setVideos] = useState<ProjectVideo[]>();
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [videoPopupOpen, setVideoPopupOpen] = useState(false);

  const [confirm, setConfirm] = useState(false);

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
  }, []);

  useEffect(() => {
    async function fetchVideos() {
      const res = await getVideos(unmodifiedProject.projectId);
      if (res.data) {
        setVideos(res.data);
      }
      else {
        setVideos(projectAfterMediaChanges.projectVideos as ProjectVideo[]);
      }
    }

    fetchVideos();
  }, [unmodifiedProject.projectId]);

  // Checks whether a valid image has been uploaded and modifies modifiedProject
  const handleImageUpload = useCallback(async (file: File) => {
    if (!["image/jpeg", "image/png"].includes(file.type)) return;
    else if (file.size > 2000000) {
      setImageError("File too large");
      return;
    }

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
        altText: "project image",
      } as CreateProjectImageInput;

      const localId = ++localIdIncrement;

      dataManager?.createImage({
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
        dataManager?.updateThumbnail({
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
      await updatePendingProject(projectAfterMediaChanges);
    } catch (err) {
      console.error(err);
    }
  }, [dataManager, projectId, updatePendingProject]);

  const handleAddVideo = useCallback(() => {
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;
    if (!getYouTubeEmbedURL(newVideoUrl)) return;

    const localId = ++localIdIncrement;

    const newVideoData: CreateProjectVideoInput = {
      title: newVideoTitle,
      videoUrl: newVideoUrl,
    };

    // Create it
    dataManager?.createVideo({
      id: { value: localId, type: "local" },
      data: newVideoData
    });

    projectAfterMediaChanges = {
      ...projectAfterMediaChanges,
      projectVideos: [
        ...projectAfterMediaChanges.projectVideos as ProjectVideo[],
        {
          videoId: localId,
          videoUrl: newVideoData.videoUrl,
          position: projectAfterMediaChanges.projectVideos?.length as number,
          title: newVideoData.title,
          apiUrl: ""
        }
      ]
    }

    // Update UI immediately
    const pendingVideo = { videoId: localId, isLocal: true, ...newVideoData };
    setVideos((prev) => (prev ? [...prev, pendingVideo as any] : [pendingVideo as any]));

    updatePendingProject(projectAfterMediaChanges);
    // Clear inputes
    setNewVideoTitle("");
    setNewVideoUrl("");
  }, [newVideoTitle, newVideoUrl, dataManager, setVideos]);

  const handleDeleteVideo = useCallback((video: any) => {
    // Delete it
    dataManager?.deleteVideo({
      id: {
        value: video.videoId,
        type: video.isLocal ? "local" : "canon"
      },
      data: null
    });

    projectAfterMediaChanges.projectVideos =
      (projectAfterMediaChanges.projectVideos as ProjectVideo[]).filter(
        (projectVideo) =>
          (video as ProjectVideo).videoId !==
          (projectVideo)?.videoId
      );

    updatePendingProject(projectAfterMediaChanges);
    // Remove from current UI
    setVideos((prev) => (prev || []).filter((v: any) => v.videoId !== video.videoId));
  }, [dataManager, setVideos]);

  // Checks whether the thumbnail has been modified and updates modifiedProject
  const handleThumbnailChange = useCallback(
    async (projectImage: ProjectImage | PendingProjectImage) => {
      //if (!projectId) return;


      const thumbId = typeof projectImage.image === 'string'
        ? (projectImage as ProjectImage).imageId //canon id since the project image already exists
        : (projectImage as PendingProjectImage).localId ?? ++localIdIncrement; //pending project id for new images

      //pendingprojectimage uses a file, projectimage uses a string
      //so this exists to get the different pieces of the projectImage 
      //if it's a string, make it a project image
      if (typeof projectImage.image === 'string') {

        dataManager?.updateThumbnail({
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
        dataManager?.updateThumbnail({
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
        dataManager?.deleteImage({
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
        dataManager?.deleteImage({
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
          dataManager?.updateThumbnail({
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
          dataManager?.updateThumbnail({
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
        Upload images that showcase your project. Star an image for it to be used as
        this project's thumbnail on the Discover and My Projects pages.
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

      <label>Project Videos</label>
      <div className="project-editor-extra-info">
        Link YouTube videos to be embedded on your project page.
      </div>

      <div id="project-editor-image-ui">
        {videos?.map((video: any) => {
          const embedUrl = getYouTubeEmbedURL(video.videoUrl);

          return (
            <div
              className="project-editor-image-container"
              key={video.videoId}
            >
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
                ></iframe>
              ) : (
                <div style={{ padding: "15px" }}>
                  <p style={{ fontWeight: "bold", margin: "0 0 5px 0" }}>{video.title}</p>
                  <p style={{ fontSize: "0.8em", wordBreak: "break-all", margin: 0, opacity: 0.7 }}>{video.url}</p>
                </div>
              )}

              {/* Delete Overlay */}
              <div className="project-video-hover">
                <ThemeIcon
                  id="trash"
                  className="mono-stroke-invert delete-video"
                  width={22}
                  height={22}
                  ariaLabel="delete"
                  onClick={() => handleDeleteVideo(video)}
                />
              </div>
            </div>
          );
        })}

        {videoPopupOpen
          ?
          <div className="add-video">
            <div className="add-video-form">
              <div>
                <label className="add-video-title">Video Title</label>
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="e.g., Gameplay Trailer"
                  className="add-video-input"
                />
              </div>
              <div>
                <label className="add-video-title">YouTube URL</label>
                <input
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="add-video-input"
                />
              </div>
            </div>

            <div className="confirm-deny-btns">
              <button
                className="confirm-btn"
                onClick={() => {
                  handleAddVideo();
                  setVideoPopupOpen(false);
                }}
              >
                Add Video
              </button>
              <button
                className="deny-btn"
                onClick={() => {
                  setNewVideoTitle("");
                  setNewVideoUrl("");
                  setVideoPopupOpen(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
          :
          <div id="project-editor-add-image">
            <button id="project-video-uploader" className="drop-area" onClick={() => setVideoPopupOpen(!videoPopupOpen)}>
              <div id="img-view" className="project-uploader">
                <svg xmlns="http://www.w3.org/2000/svg" width={38} height={39} viewBox="0 0 448 512">
                  <path d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z" fill="var(--neutral-gray)" />
                </svg>
                <p className="project-editor-extra-info">Click here to add a new video</p>
              </div>
            </button>
          </div>
        }
      </div>

      {/* Save button */}
      <div id="general-save-info">
        <div className="editor-save-actions">
          <Popup>
            {saveable ? "" :
              <div id="invalid-input-error" className={"save-error-msg-general"}>
                <p>*{message}*</p>
              </div>}
              {isSaving ? 
                (
                  // Currently Saving
                  <div className='spinning-loader'></div>
                ) : (
                  // Save is complete or hasn't been pressed
                  <PopupButton
                  buttonId="project-editor-save"
                  callback={() => {
                    // Incomplete form: still clickable so the save validation runs,
                    // shows the error, and auto-scrolls to the first missing field.
                    if (!saveable) saveProject?.();
                    else setConfirm(true);
                  }}
                >
                  Save Changes
                </PopupButton>
              )
            }
            
            {confirm ?
              <PopupContent useClose={false} callback={() => setConfirm(false)}>
                <div id="confirm-editor-save-text">Are you sure you want to save all changes?</div>
                <div id="confirm-editor-save">
                  <PopupButton callback={saveProject} closeParent={closeOuterPopup} buttonId="project-editor-save">
                    Confirm
                  </PopupButton>
                  <PopupButton buttonId="team-edit-member-cancel-button" >
                    Cancel
                  </PopupButton>
                </div>
              </PopupContent> : "" 
            }
          </Popup>

          {isSaving ?
            (
              // Just here for blank space and to prevent 
              // accidental deletion while a project is saving
              ""
            ) : (
              <DeleteProjectButton
                projectID={unmodifiedProject.projectId}
                projectTitle={unmodifiedProject.title}
              />
            )
          }
        </div>
      </div>
    </div>
  );
};
