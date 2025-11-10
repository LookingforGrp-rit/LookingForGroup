// --- Imports ---
import { useEffect, useState } from "react";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { PopupButton } from "../../Popup";
import { AddProjectSocialInput, Social, UserDetail } from "@looking-for-group/shared";
import { Input } from "../../Input";
import { getSocials, getUsersById } from "../../../api/users";
import { ThemeIcon } from "../../ThemeIcon";
import { PendingProject } from "../../../../types/types";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";

// --- Variables ---
type LinksTabProps = {
  dataManager: Awaited<ReturnType<typeof projectDataManager>>;
  projectData: PendingProject;
  updatePendingProject: (updatedPendingProject: PendingProject) => void;
  setErrorLinks?: (error: string) => void;
  saveProject?: () => void;
  failCheck: boolean;
  isNewProject?: boolean;
}

let projectAfterLinkChanges: PendingProject;

// --- Component ---
export const LinksTab = ({
  dataManager,
  projectData,
  updatePendingProject,
  setErrorLinks = () => {},
  saveProject = () => {},
  failCheck,
  //isNewProject = false
}: LinksTabProps) => {

projectAfterLinkChanges = structuredClone(projectData);

  // --- Hooks --- 
  // complete list of socials
  const [allSocials, setAllSocials] = useState<Social[]>([]);
  // sets error when adding a link to the project
  const [error] = useState('');
  // project owner details with social links
  const [projectOwner, setProjectOwner] = useState<UserDetail | null>(null);

  // Update data when data is changed
  useEffect(() => {
    updatePendingProject(projectAfterLinkChanges || {} as PendingProject);
  }, [updatePendingProject]);


  // Update parent state with error message
  useEffect(() => {
    setErrorLinks(error);
  }, [error, setErrorLinks]);

  // Get social option data
  useEffect(() => {
    const getAllSocials = async () => {
      const response = await getSocials();

      // Reorder so 'Other' is last
      if (response.data) {
        const otherIndex = response.data.findIndex(s => s.label === 'Other');
        if (otherIndex > -1) {
          const other = response.data.splice(otherIndex, 1)[0];
          response.data.push(other);
        }
      setAllSocials(response.data);
      }

    };
    getAllSocials();
  }, []);

  // Fetch project owner details to get their social links
  useEffect(() => {
    const fetchProjectOwner = async () => {
      if (projectData?.owner?.userId) {
        try {
          const response = await getUsersById(projectData.owner.userId.toString());
          if (response?.data) {
            setProjectOwner(response.data);
          }
        } catch (err) {
          console.error("Error fetching project owner details:", err);
        }
      }
    };
    fetchProjectOwner();
  }, [projectData?.owner?.userId]);

  // --- Complete component ---
  return (
    // TODO: refactor styles for project and profile editor
    <div id="editor-links">
      {/* Contact Information Section */}
      {projectOwner && (
        <div id="editor-contact-info">
          <div className="editor-header">Contact Project Owner</div>
          <div className="editor-extra-info">
            Connect with {projectOwner.firstName} {projectOwner.lastName} through their social profiles.
          </div>
          
          {/* User Social Links */}
          {projectOwner.socials && projectOwner.socials.length > 0 ? (
            <div className="contact-socials-grid">
              {projectOwner.socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-link"
                  title={`Contact via ${social.label}`}
                >
                  <ThemeIcon
                    width={20}
                    height={20}
                    id={
                      social.label === 'Other' ? 'link' :
                      social.label === 'Twitter' ? 'x' :
                      social.label.toLowerCase()
                    }
                    className="mono-fill"
                    ariaLabel={social.label}
                  />
                  <span>{social.label}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="no-contact-info">
              No contact information available for this project owner.
            </div>
          )}
        </div>
      )}

      <div className="editor-header">Project Social Links</div>
      <div className="editor-extra-info">
        Provide the links to pages you wish to include on your project page.
      </div>
      <div className='error'>{error}</div>

      <div id="editor-link-list">
        {/* Social URL inputs */}
        { projectAfterLinkChanges.projectSocials && projectAfterLinkChanges.projectSocials.map((social, index) => (
          <div className="editor-link-item" key={index}>
            {/* Social type dropdown */}
            <Select>
              <SelectButton
                placeholder='Select'
                initialVal={social.label ? social.label : undefined}
                className='link-select'
                type={"input"}
              />
              <SelectOptions
                callback={(e) => {
                  const selectedLabel = (e.target as HTMLInputElement).value;
                  const selectedSocial = allSocials.find(s => s.label === selectedLabel);
                  
                  const tempSocials = projectAfterLinkChanges.projectSocials;
                  tempSocials[index].label = selectedLabel;
                  tempSocials[index].websiteId = selectedSocial?.websiteId || 0;
                  if(selectedSocial){

                  dataManager.addSocial({
                    id: {
                      value: selectedSocial?.websiteId,
                      type: 'canon'
                    },
                    data: tempSocials[index] as AddProjectSocialInput
                  })
                  }

                  projectAfterLinkChanges = {
                    ...projectAfterLinkChanges,
                    projectSocials: tempSocials
                  }
                  updatePendingProject(projectAfterLinkChanges);
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
              value={social.url ? social.url : ''}
              onChange={(e) => {
                // TODO: Implement some sort of security check for URLs.
                // Could be as simple as checking the URL matches the social media
                // But since 'Other' is an option, might be good to just find some
                // external list of suspicious sites and make sure it's not one of those.
                const tempSocials = [...projectAfterLinkChanges.projectSocials];
                tempSocials[index].url = e.target.value;
                updatePendingProject({ ...projectAfterLinkChanges, projectSocials: tempSocials });
              }}
              onClick={(e) => {(e.target as HTMLElement).closest('.editor-link-item')?.remove();}}
            />
          </div>
        ))}
        <div id="add-link-container">
          <button id="profile-editor-add-link"
            onClick={() => {
              updatePendingProject({
                ...projectAfterLinkChanges,
                projectSocials: [...projectAfterLinkChanges.projectSocials || [], {
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
        <PopupButton buttonId="project-editor-save" callback={saveProject} doNotClose={() => failCheck}>
          Save Changes
        </PopupButton>
      </div>
    </div>
  );
};