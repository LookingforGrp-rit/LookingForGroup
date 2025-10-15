// --- Imports ---
import { useCallback, useEffect, useState } from "react";
import { addPic, deletePic } from "../../../api/projects";
import { ProjectDetail, ProjectImage } from "@looking-for-group/shared";
import { PopupButton } from "../../Popup";
import { ProjectImageUploader } from "../../ImageUploader";

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

// --- Default Project ---
const defaultProject: ProjectDetail = {
  audience: "",
  description: "",
  hook: "",
  images: [],
  jobs: [],
  members: [],
  projectId: -1,
  projectTypes: [],
  purpose: "",
  socials: [],
  status: "",
  tags: [],
  thumbnail: "",
  title: "",
  userId: -1,
};


// --- Variables ---
type MediaTabProps = {
  projectData?: ProjectDetail;
  setProjectData?: (data: ProjectDetail) => void;
  saveProject?: () => void;
  failCheck: boolean;
}

// --- Component ---
export const MediaTab = ({
  projectData = defaultProject,
  setProjectData = () => {},
  saveProject = () => {},
  failCheck,
}: MediaTabProps) => {

  // --- Hooks ---
  // tracking project modifications
  const [modifiedProject, setModifiedProject] = useState<ProjectDetail>(projectData);

  // Update data when data is changed
  useEffect(() => {
    setModifiedProject(projectData);
  }, [projectData]);

  // Update parent state when data is changed
  useEffect(() => {
    setProjectData(modifiedProject);
  }, [modifiedProject, setProjectData]);

  // Handle image upload
  const handleImageUpload = useCallback( async () => {

    // Get image in input element
    const imageUploader = document.getElementById('image-uploader') as HTMLInputElement;
    if (!imageUploader?.files?.length) return;

    const file = imageUploader.files[0];
    if(!['image/jpeg', 'image/png'].includes(file.type)) return;

    if (!modifiedProject.projectId) return;

    // Uploading image to backend
    try {
      // #FIXME missing alt text
      const response = await addPic(modifiedProject.projectId, file);
      if(response.status === 200 && response.data) {
        const newImage: ProjectImage = response.data;
        
        setModifiedProject({
          ...modifiedProject,
          projectImages: [...modifiedProject.projectImages, newImage],
        });
      }
    } catch (err) { console.error(err); }

    imageUploader.value = '';
  }, [modifiedProject]);

  // Handle new thumbnail
  const handleThumbnailChange = useCallback(async (image: string) => {
    if (!modifiedProject.projectId) return;
    const newThumbnail = modifiedProject.thumbnail === image ? '' : image;
    try {
      await updateThumbnail(modifiedProject.projectId, newThumbnail as any);
      setModifiedProject({ ...modifiedProject, thumbnail: newThumbnail });
    } catch (err) { console.error(err); }
  }, [modifiedProject]);

  // Handle image deletion
  const handleImageDelete = useCallback(async (image: ProjectImage ) => {
    if (!modifiedProject.projectId) return;

    try {
      await deletePic(modifiedProject.projectId, image.image);
      setModifiedProject({
        ...modifiedProject,
        images: modifiedProject.images.filter((i) => i !== image),
        thumbnail: modifiedProject.thumbnail === image.image ? '' : modifiedProject.thumbnail,
      });
    } catch (err) { console.error(err); }
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
            const src = image.image.startsWith('blob') ? image.image : `${API_BASE}/images/projects/${image.image}`;
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