// --- Imports ---
import { useCallback, useEffect, useState } from "react";
import { ProjectImageUploader } from "../../ImageUploader";
import { PopupButton } from "../../Popup";

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

// --- Interfaces ---
interface Image {
  id: number;
  image: string;
  position: number;
}

interface ProjectData {
  audience: string;
  description: string;
  hook: string;
  images: Image[];
  jobs: { titleId: number; jobTitle: string; description: string; availability: string; location: string; duration: string; compensation: string; }[];
  members: { firstName: string, lastName: string, jobTitle: string, profileImage: string, userId: number}[];
  projectId?: number;
  projectTypes: { id: number, projectType: string}[];
  purpose: string;
  socials: { id: number, url: string }[];
  status: string;
  tags: { id: number, position: number, tag: string, type: string}[];
  thumbnail: string;
  title: string;
  userId?: number;
}

type MediaTabProps = {
  projectData?: ProjectData;
  setProjectData?: (data: ProjectData) => void;
  saveProject?: () => void;
  failCheck: boolean;
}

// --- Variables ---
// Default project value
const defaultProject: ProjectData = {
  audience: '',
  description: '',
  hook: '',
  images: [],
  jobs: [],
  members: [],
  projectId: -1,
  projectTypes: [],
  purpose: '',
  socials: [],
  status: '',
  tags: [],
  thumbnail: '',
  title: '',
};

// --- Component ---
export const MediaTab = ({
  projectData = defaultProject,
  setProjectData = () => {},
  saveProject = () => {},
  failCheck,
}: MediaTabProps) => {

  // --- Hooks ---
  // tracking project modifications
  const [modifiedProject, setModifiedProject] = useState<ProjectData>(projectData);

  // Update data when data is changed
  useEffect(() => {
    setModifiedProject(projectData);
  }, [projectData]);

  // Update parent state when data is changed
  useEffect(() => {
    setProjectData(modifiedProject);
  }, [modifiedProject, setProjectData]);

  // Handle image upload
  const handleImageUpload = useCallback(() => {

    // Get image in input element
    const imageUploader = document.getElementById('image-uploader') as HTMLInputElement;
    if (imageUploader && imageUploader.files && imageUploader.files.length > 0) {
      // Check for valid image type
      if (!(imageUploader.files[0].type === 'image/jpeg' || imageUploader.files[0].type === 'image/png')) {
        // Do not keep file, invalid
        // This checks against "All Files" in file search, since "accepts" attribute is not perfect
        return;
      }

      const imgLink = URL.createObjectURL(imageUploader.files[0]);

      // Add the new image to the project
      setModifiedProject({
        ...modifiedProject,
        images: [
          ...modifiedProject.images,
          { id: modifiedProject.images.length + 1, image: imgLink, position: modifiedProject.images.length + 1 },
        ],
      });

      // reset, allowing same file to be selected multiple times in a row
      imageUploader.value = '';
    }
  }, [modifiedProject]);

  // Handle new thumbnail
  const handleThumbnailChange = useCallback((image: string) => {
    // Remove thumbnail
    if (modifiedProject.thumbnail === image) {
      // Clear thumbnail entry
      setModifiedProject({
        ...modifiedProject,
        thumbnail: '',
      });
      return;
    }

    // Add thumbnail
    setModifiedProject({
      ...modifiedProject,
      thumbnail: image,
    });

  }, [modifiedProject]);

  // Handle image deletion
  const handleImageDelete = useCallback((image: Image) => {
    //Remove from project
    setModifiedProject({
      ...modifiedProject,
      images: modifiedProject.images.filter((i) => i !== image)
    });
  }, [modifiedProject]);

  // --- Complete component ---
  return (
    <div id="project-editor-media">
      <label>Project Images</label>
      <div className="project-editor-extra-info">
        Upload images that showcase your project. Select one image to be used as the main
        thumbnail on the project's discover card.
      </div>
      <div id="project-editor-image-ui">
        {
          modifiedProject.images?.map((image) => {
            let src; // get image source
            if (image.image.startsWith('blob')){
              // temporary image, not uploaded
              src = image.image;
            }
            else {
              // image is uploaded, can find in directorys
              src = `${API_BASE}/images/projects/${image.image}`;
            }
            return (
              <div className='project-editor-image-container' key={image.image}>
                <img src={src} alt="project images" />
                {
                  modifiedProject.thumbnail === image.image &&
                  <img src="/images/icons/star-filled.svg" alt="star" className="star-filled"></img>
                }
                <div className="project-image-hover">
                  <button
                    id={ modifiedProject.thumbnail === image.image ? "selected-thumbnail" : ""}
                    className={ modifiedProject.thumbnail === image.image ? "star-filled" : "star"}
                    onClick={() => handleThumbnailChange(image.image)}
                  >
                    <img src={ modifiedProject.thumbnail === image.image ? "/images/icons/star-filled.svg" : "/images/icons/star.svg"} alt="star"></img>
                  </button>
                  <button className="delete-image" onClick={() => handleImageDelete(image)}>
                    <img src="/images/icons/delete-black.svg" alt="trash"></img>
                  </button>
                </div>
              </div>
            );
          })
        }
        <div id="project-editor-add-image">
          <ProjectImageUploader onFileSelected={handleImageUpload} />
        </div>
      </div>
      <div id="general-save-info">
        <PopupButton buttonId="project-editor-save" callback={saveProject} doNotClose={() => !failCheck}>
          Save Changes
        </PopupButton>
      </div>
    </div>
  );
};