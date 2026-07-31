import { useState } from "react";
import { GalleryImage, GalleryVideo, PendingGalleryImage, ProjectImage, ProjectVideo } from "@looking-for-group/shared";
import { PendingProjectImage } from "../../types/types";
import placeholder from "../../src/images/lfrog.png";
import { FileImage } from "./FileImage";
import { ThemeIcon } from "./ThemeIcon";
import { ProjectImageUploader } from "./ImageUploader";
import { getYouTubeEmbedURL } from "../functions/parseYoutube";
import { Popup, PopupButton, PopupContent } from "./Popup";

interface ImageVideoDisplayProps<Image, Video> {
  thumbnail?: ProjectImage | PendingProjectImage,

  images: Image[],
  videos: Video[],

  saveable: boolean,
  message: string,

  handleThumbnailChange?: (image: ProjectImage | PendingProjectImage) => void,
  handleImageDelete: ((image: Image) => void),
  handleImageUpload: (file: File, altText?: string) => void,

  handleDeleteVideo: (video: Video) => void,
  handleAddVideo: (video: Video) => void,

  closeOuterPopup?: (b: boolean) => void,

  saveProject?: () => void,
  isSaving?: boolean,
  imageError: string,
}

//copied from MediaTab.tsx, now is used in 2 places, both MediaTab.tsx and Profile.tsx

const ImageVideoDisplay = <Image extends (ProjectImage | PendingProjectImage) | (GalleryImage | PendingGalleryImage), Video extends ProjectVideo | GalleryVideo>({
  thumbnail,
  images,
  videos,

  saveable,
  message,

  handleThumbnailChange,
  handleImageDelete,
  handleImageUpload,

  handleDeleteVideo,
  handleAddVideo,

  closeOuterPopup,

  saveProject,
  isSaving,
  imageError,
}: ImageVideoDisplayProps<Image, Video>) => {

  const [videoPopupOpen, setVideoPopupOpen] = useState(false);

  const [newVideo, setNewVideo] = useState<Video>({} as Video);
 
  const [confirm, setConfirm] = useState(false);

  return (
    <div id="project-editor-media">
      <label>{thumbnail ? "Project" : "Gallery"} Images</label>
      <div className="project-editor-extra-info">
        Upload images for showcasing. {thumbnail ? `Star an image for it to be used as
        this project's thumbnail on the Discover and My Projects pages.` : ""}
      </div>

      {/* Display warning upon duplicate image */}
      {imageError && (
        <div id="invalid-input-error">
          <p>{imageError}</p>
        </div>
      )}

      <div id="project-editor-image-ui">
        {images?.map((projectImage) => (
          <div
            className="project-editor-image-container"
            key={
              (projectImage as ProjectImage).imageId ?? (projectImage as GalleryImage).galleryImageId ??
              "pending-" + (projectImage as PendingProjectImage | PendingGalleryImage).localId
            }
          >
            {/* Present image from database or local storage */}
            {(projectImage as ProjectImage).imageId || (projectImage as GalleryImage).galleryImageId ? (
              <img
                src={projectImage.image as string}
                alt={projectImage.altText}
                onError={(e) => {
                  const profileImg = e.target as HTMLImageElement;
                  profileImg.src = placeholder;
                }}
              />
            ) : (
              <FileImage
                file={projectImage.image as File}
                alt={
                  projectImage.altText ??
                  ""
                }
              />
            )}

            {/* Add thumbnail star if it is a thumbnail */}
            {/* it checks against the image itself now */}
            {thumbnail?.image === projectImage.image && (
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
              {thumbnail ?
                thumbnail === projectImage ||
                  ("imageId" in projectImage && (thumbnail as ProjectImage).imageId === projectImage.imageId) ||
                  ("localId" in projectImage && (thumbnail as ProjectImage).imageId === projectImage.localId) ?
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
                    onClick={() => handleThumbnailChange?.(projectImage as ProjectImage | PendingProjectImage)}
                  />
              : "" }

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

      <label>{thumbnail ? "Project" : "Gallery"} Videos</label>
      <div className="project-editor-extra-info">
        Link YouTube videos to be embedded.
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
                  value={newVideo?.title}
                  onChange={(e) => {
                    let video = newVideo;
                    video.title = e.target.value;
                    setNewVideo(video);
                  }}
                  placeholder="e.g., Gameplay Trailer"
                  className="add-video-input"
                />
              </div>
              <div>
                <label className="add-video-title">YouTube URL</label>
                <input
                  type="text"
                  value={newVideo?.videoUrl}
                  onChange={(e) => {
                    let video = newVideo;
                    video.videoUrl = e.target.value;
                    setNewVideo(video);
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="add-video-input"
                />
              </div>
            </div>

            <div className="confirm-deny-btns">
              <button
                className="confirm-btn"
                onClick={() => {
                  handleAddVideo(newVideo);
                  setVideoPopupOpen(false);
                }}
              >
                Add Video
              </button>
              <button
                className="deny-btn"
                onClick={() => {
                  setNewVideo({} as Video);
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

      {/* Save button */ saveProject ?
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
                      if (!saveable) saveProject();
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
          </div>
        </div>
      : ""}
    </div>
  );
}

export default ImageVideoDisplay;