// --- Imports ---
import { useCallback, useEffect, useState, useContext } from "react";
import {
  CreateProjectImageInput,
  CreateProjectVideoInput,
  ProjectImage,
  ProjectVideo,
  ProjectWithFollowers,
} from "@looking-for-group/shared";
import { PopupContext } from "../../Popup";
import { DeleteProjectButton } from "../DeleteProjectButton";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
import { PendingProject, PendingProjectImage } from "@looking-for-group/client";
import { getVideos } from "../../../api/projects";
import { getYouTubeEmbedURL } from "../../../functions/parseYoutube";
import ImageVideoDisplay from "../../ImageVideoDisplay";

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
  // failCheck,
  // updateFailCheck,
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
      if(!unmodifiedProject.projectId) return;
      const res = await getVideos(unmodifiedProject.projectId);
      if (res.data) {
        setVideos(res.data);
      }
      else {
        setVideos(projectAfterMediaChanges.projectVideos);
      }
    }

    fetchVideos();
  }, [unmodifiedProject.projectId]);

  // Checks whether a valid image has been uploaded and modifies modifiedProject
  const handleImageUpload = useCallback(async (file: File, altText?: string) => {
    if (!["image/jpeg", "image/png"].includes(file.type)) return;
    else if (file.size > 2000000) {
      setImageError("File too large! (max: 2mb)");
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
        altText: altText ?? "Project Image",
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

  const handleAddVideo = useCallback((newVideo: ProjectVideo) => {
    if (!newVideo.title.trim() || !newVideo.videoUrl.trim()) return;
    if (!getYouTubeEmbedURL(newVideo.videoUrl)) return;

    const localId = ++localIdIncrement;

    const newVideoData: CreateProjectVideoInput = {
      title: newVideo.title,
      videoUrl: newVideo.videoUrl,
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
  }, [dataManager, setVideos]);

  const handleDeleteVideo = useCallback((video: ProjectVideo) => {
    // Delete it
    dataManager?.deleteVideo({
      id: {
        value: video.videoId,
        type: video.apiUrl ? "canon" : "local"
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
    <>
      <ImageVideoDisplay<ProjectImage | PendingProjectImage, ProjectVideo>
        thumbnail={projectAfterMediaChanges.thumbnail as ProjectImage | PendingProjectImage}
        images={projectAfterMediaChanges.projectImages}
        videos={videos ?? projectAfterMediaChanges.projectVideos}
        saveable={saveable}
        message={message}
        handleThumbnailChange={handleThumbnailChange}
        handleImageDelete={handleImageDelete}
        handleImageUpload={handleImageUpload}
        handleDeleteVideo={handleDeleteVideo}
        handleAddVideo={handleAddVideo}
        closeOuterPopup={closeOuterPopup}
        saveProject={saveProject}
        isSaving={isSaving}
        imageError={imageError as string}
      />
      {
        // Hides the delete project button if the project is currently saving
        isSaving ?
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
    </>
  );
};
