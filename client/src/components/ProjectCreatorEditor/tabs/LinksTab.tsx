// --- Imports ---
import { useEffect, useState } from "react";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { PopupButton } from "../../Popup";
import { ProjectDetail, Social } from "@looking-for-group/shared";
import { Input } from "../../Input";
import { getSocials } from "../../../api/users";
import { ThemeIcon } from "../../ThemeIcon";

// --- Variables ---
type LinksTabProps = {
  projectData?: ProjectDetail;
  setProjectData?: (data: ProjectDetail) => void;
  setErrorLinks?: (error: string) => void;
  saveProject?: () => void;
  failCheck: boolean;
  isNewProject?: boolean;
}

// --- Component ---
export const LinksTab = ({
  projectData,
  setProjectData = () => {},
  setErrorLinks = () => {},
  saveProject = () => {},
  failCheck,
  isNewProject = false
}: LinksTabProps) => {
  // --- Hooks --- 
  // tracking project modifications
  const [modifiedProject, setModifiedProject] = useState<ProjectDetail>(projectData || {} as ProjectDetail);
  // complete list of socials
  const [allSocials, setAllSocials] = useState<Social[]>([]);
  // sets error when adding a link to the project
  const [error] = useState('');

  // Update data when data is changed
  useEffect(() => {
    setModifiedProject(projectData || {} as ProjectDetail);
  }, [projectData]);

  // Update parent state with new project data
  useEffect(() => {
    setProjectData(modifiedProject);
  }, [modifiedProject, setProjectData]);

  // Update parent state with error message
  useEffect(() => {
    setErrorLinks(error);
  }, [error, setErrorLinks]);

  // Get social option data
  useEffect(() => {
    const getAllSocials = async () => {
      const response = await getSocials();

      // Reorder so 'Other' is last
      if (response?.data) {
        const otherIndex = response.data.findIndex(s => s.label === 'Other');
        if (otherIndex > -1) {
          const other = response.data.splice(otherIndex, 1)[0];
          response.data.push(other);
        }
      }

      setAllSocials(response.data!);
    };
    getAllSocials();
  }, []);

  // --- Complete component ---
  return (
    // TODO: refactor styles for project and profile editor
    <div id="editor-links">
      <div className="editor-header">Social Links</div>
      <div className="editor-extra-info">
        Provide the links to pages you wish to include on your page.
      </div>
      <div className='error'>{error}</div>

      <div id="editor-link-list">
        {/* Social URL inputs */}
        { modifiedProject.projectSocials && modifiedProject.projectSocials.map((social, index) => (
          <div className="editor-link-item" key={index}>
            {/* Social type dropdown */}
            <Select>
              <SelectButton
                placeholder='Select'
                initialVal={
                  social.label !== '' && <>
                    <ThemeIcon
                      width={20}
                      height={20}
                      id={
                        social.label === 'Other' ? 'link' :
                        // TODO: revisit twitter/x label
                        social.label === 'Twitter' ? 'x' :
                        social.label.toLowerCase()
                      }
                      className={'mono-fill'}
                      ariaLabel={social.label}
                    />
                    {social.label}
                  </>
                }
                className='link-select'
                type={"input"}
              />
              <SelectOptions
                callback={(e) => {
                  const selectedLabel = (e.target as HTMLInputElement).value;
                  const selectedSocial = allSocials.find(s => s.label === selectedLabel);
                  
                  const tempSocials = [...modifiedProject.projectSocials];
                  tempSocials[index].label = selectedLabel;
                  tempSocials[index].websiteId = selectedSocial?.websiteId || 0;
                  setModifiedProject({ ...modifiedProject, projectSocials: tempSocials });
                }}
                options={allSocials ? allSocials.map(website => {
                  return {
                    markup:
                    <>
                      <ThemeIcon
                        width={20}
                        height={20}
                        id={
                          website.label === 'Other' ? 'link' :
                          // TODO: revisit twitter/x label
                          website.label === 'Twitter' ? 'x' :
                          website.label.toLowerCase()
                        }
                        className={'mono-fill'}
                        ariaLabel={website.label}
                      />
                      {website.label}
                    </>,
                    value: website.label,
                    disabled: false,
                  };
                }) : []}
              />
            </Select>
            {/* Social URL input */}
            <Input
              type="link"
              placeholder="URL"
              value={social.url}
              onChange={(e) => {
                // TODO: Implement some sort of security check for URLs.
                // Could be as simple as checking the URL matches the social media
                // But since 'Other' is an option, might be good to just find some
                // external list of suspicious sites and make sure it's not one of those.
                const tempSocials = [...modifiedProject.projectSocials];
                tempSocials[index].url = e.target.value;
                setModifiedProject({ ...modifiedProject, projectSocials: tempSocials });
              }}
              onClick={(e) => {(e.target as HTMLElement).closest('.editor-link-item')?.remove();}}
            />
          </div>
        ))}
        <div id="add-link-container">
          <button id="profile-editor-add-link"
            onClick={() => {
              setModifiedProject({
                ...modifiedProject,
                projectSocials: [...modifiedProject.projectSocials || [], {
                  label: '',
                  url: '',
                  apiUrl: "",
                  websiteId: 0
                }]
              });
            }}>
            <i className="fa fa-plus" />
            <p>Add social profile</p>
          </button>
        </div>
      </div>
      <div id="link-save-info">
        <PopupButton buttonId="project-editor-save" callback={saveProject} doNotClose={() => !failCheck}>
          Save Changes
        </PopupButton>
      </div>
    </div>
  );
};