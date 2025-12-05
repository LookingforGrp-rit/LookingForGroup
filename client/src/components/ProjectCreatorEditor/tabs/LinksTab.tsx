// --- Imports ---
import { useEffect, useState, useContext } from "react";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { PopupButton, PopupContent, Popup, PopupContext } from "../../Popup";
import { AddProjectSocialInput, ProjectSocial, Social, UserDetail } from "@looking-for-group/shared";
import { Input } from "../../Input";
import { getSocials, getUsersById } from "../../../api/users";
import { ThemeIcon } from "../../ThemeIcon";
import { Pending, PendingProject } from "../../../../types/types";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
import { BaseSocialUrl } from "@looking-for-group/shared/enums";

// --- Variables ---
type LinksTabProps = {
  dataManager: Awaited<ReturnType<typeof projectDataManager>>;
  projectData: PendingProject;
  updatePendingProject: (updatedPendingProject: PendingProject) => void;
  setErrorLinks?: (error: string) => void;
  saveProject?: () => void;
  failCheck: boolean;
}

let localIdIncrement = 0;
let projectAfterLinkChanges: PendingProject;

// --- Component ---
export const LinksTab = ({
  dataManager,
  projectData,
  updatePendingProject,
  setErrorLinks = () => {},
  saveProject = () => {},
  failCheck,
}: LinksTabProps) => {

projectAfterLinkChanges = structuredClone(projectData);

  // --- Hooks --- 
  // complete list of socials
  const [allSocials, setAllSocials] = useState<Social[]>([]);
  // sets error when adding a link to the project
  const [error] = useState('');
  // project owner details with social links
  const [projectOwner, setProjectOwner] = useState<UserDetail | null>(null);

  const { setOpen: closeOuterPopup } = useContext(PopupContext);

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
          const response = await getUsersById(projectData.owner.userId);
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
                initialVal={social.label ? //silence linter, it works how it should
                  <>
                      <ThemeIcon
                        width={20}
                        height={20}
                        id={
                          social.label === 'Other' ? 'link' :
                          social.label.toLowerCase()
                        }
                        className={'mono-fill'}
                        ariaLabel={social.label}
                      />
                      {social.label}
                  </> as unknown as string //this is how i've silenced the linter
                  : undefined}
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
                  (tempSocials[index] as Pending<ProjectSocial>).localId = ++localIdIncrement; //lol it never had a local id
                  if(selectedSocial && "localId" in social){ //so it only tries to add newly added ones

                  dataManager.addSocial({
                    id: {
                      value: (tempSocials[index] as Pending<ProjectSocial>).localId ?? ++localIdIncrement,
                      type: 'local'
                    },
                    data: tempSocials[index] as AddProjectSocialInput
                  })
                  projectAfterLinkChanges = {
                    ...projectAfterLinkChanges,
                    projectSocials: tempSocials
                  }
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
            {/* Social URL input 
              /* NOTICE: there is a bit of a bug here 
              /* if you type in the url field before selecting a media label, it won't take your input
              /* (this is a temporary fix because it would've crashed otherwise)*/}
            <div id="base-url">{BaseSocialUrl[social.label as keyof typeof BaseSocialUrl]}</div>
            <Input
              type={BaseSocialUrl[social.label as keyof typeof BaseSocialUrl] === '' || !social.label ? "link" : "single"}
              placeholder={BaseSocialUrl[social.label as keyof typeof BaseSocialUrl] === '' || !social.label ? "URL" : 'Username'}
              value={social.url && social.label ? social.url.substring(BaseSocialUrl[social.label as keyof typeof BaseSocialUrl].length) : ''}
              onChange={(e) => {
                // TODO: Implement some sort of security check for URLs.
                // Could be as simple as checking the URL matches the social media
                // But since 'Other' is an option, might be good to just find some
                // external list of suspicious sites and make sure it's not one of those.
                const tempSocials = projectAfterLinkChanges.projectSocials;
                tempSocials[index].url = BaseSocialUrl[social.label as keyof typeof BaseSocialUrl] + e.target.value;

                if("localId" in social){
                dataManager.addSocial({
                  id: {
                    type: "local",
                    value: social.localId ?? ++localIdIncrement
                  },
                  data: tempSocials[index] as AddProjectSocialInput
                })
                }
                else{
                dataManager.updateSocial({
                  id: {
                    type: "canon",
                    value: social.websiteId
                  },
                  data: {
                    url: tempSocials[index].url
                  }
                })
                }
                updatePendingProject({ ...projectAfterLinkChanges, projectSocials: tempSocials });
              }}
              onClick={() => {
                if(!("localId" in social)){

                dataManager.deleteSocial({
                  id: {
                    type: 'canon',
                    value: social.websiteId
                  },
                  data: null
                });
                projectAfterLinkChanges.projectSocials = 
                  projectAfterLinkChanges.projectSocials.filter(
                            (soc) =>
                              social.websiteId !==
                              soc.websiteId
                          ); //get it outta here
                updatePendingProject(projectAfterLinkChanges)
                }
              }}
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
            }}
            >
            <i className="fa fa-plus" />
            <p>Add social profile</p>
          </button>
        </div>
      </div>
      <div id="link-save-info">
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