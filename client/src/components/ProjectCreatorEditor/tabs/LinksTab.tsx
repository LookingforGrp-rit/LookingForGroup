// --- Imports ---
import { useEffect, useState, useContext, useMemo } from "react";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { PopupButton, PopupContent, Popup, PopupContext } from "../../Popup";
import { DeleteProjectButton } from "../DeleteProjectButton";
import { ProjectSocial, ProjectWithFollowers, Social, UserDetail } from "@looking-for-group/shared";
import { Input } from "../../Input";
import { getSocials, getUsersById } from "../../../api/users";
import { ThemeIcon } from "../../ThemeIcon";
import { Pending, PendingProject } from "../../../../types/types";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
import { BaseSocialUrl } from "@looking-for-group/shared/enums";

// --- Variables ---
type LinksTabProps = {
  dataManager?: Awaited<ReturnType<typeof projectDataManager>>;
  projectData: PendingProject;
  unmodifiedProject: ProjectWithFollowers;
  updatePendingProject: (updatedPendingProject: PendingProject) => void;
  setErrorLinks?: (error: string) => void;
  saveProject?: () => void;
  saveable: boolean;
  failCheck: boolean;
  updateFailCheck: boolean;
  message: string;
  currentUser: UserDetail;
  isSaving: boolean;
}

let localIdIncrement = 0;
let projectAfterLinkChanges: PendingProject;

/**
 * The LinksTab component allows users to view, add, update, and remove social media links associated with a project. 
 * It supports dynamic selection from a predefined list of social platforms and entry of corresponding URLs. 
 * It synchronizes changes with the parent component and reports validation errors as needed.
 * @param dataManager data manager 
 * @param projectData current project data
 * @param updatePendingProject set modified project
 * @param setErrorLinks set error message for links validation
 * @param saveProject save project changes
 * @param failCheck indicates if data validation has failed 
 * @returns JSX Element - Renders the Social Links tab UI, handles social input logic, synchronizes from data with parent state
 */

// --- Component ---
export const LinksTab = ({
  dataManager,
  projectData,
  unmodifiedProject,
  updatePendingProject,
  setErrorLinks = () => { },
  saveProject = () => { },
  saveable,
  failCheck,
  updateFailCheck,
  message,
  currentUser,
  isSaving,
}: LinksTabProps) => {

  projectAfterLinkChanges = structuredClone(projectData);

  // --- Hooks --- 
  // List of available social platforms fetched from the backend
  const [allSocials, setAllSocials] = useState<Social[]>([]);
  // Tracks input validation or other link
  const [error] = useState('');
  // project owner details with social links
  const [projectOwner, setProjectOwner] = useState<UserDetail | null>(null);

  const { setOpen: closeOuterPopup } = useContext(PopupContext);

  const [confirm, setConfirm] = useState(false);

  // Checks if the current project socials differ in any way from the unmodified original data
  const isLinksUnsaved = useMemo(() => {
    const currentLinks = projectData?.projectSocials || [];
    const originalLinks = unmodifiedProject?.projectSocials || [];

    if (currentLinks.length !== originalLinks.length) return true;

    // Check each link entirely
    return currentLinks.some((current, index) => {
      const original = originalLinks[index];
      if (!original)
        return true;

      return (
        current.label !== original.label ||
        current.alias !== original.alias ||
        current.url !== original.url ||
        current.websiteId !== original.websiteId
      );
    });
  }, [projectData?.projectSocials, unmodifiedProject?.projectSocials]);

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
      else {
        setProjectOwner(currentUser);
      }
    };
    fetchProjectOwner();
  }, [projectData?.owner?.userId, currentUser, setProjectOwner]);

  const handleDeleteSocial = (index: number) => {
    const targetSocial = (projectData.projectSocials || [])[index];
    if (!targetSocial) return;

    const filteredSocials = (projectData.projectSocials || []).filter((_, i) => i !== index);
    updatePendingProject({ ...projectData, projectSocials: filteredSocials });
  };

  // Helper for handling changes to alias or url
  const handleSocialChange = (
    index: number,
    field: 'alias' | 'url',
    value: string,
    baseUrl: string
  ) => {
    // Copy socials array
    const socials = [...(projectData.projectSocials || [])];
    const oldSocial = socials[index];
    if (!oldSocial) return;

    // Create updated social object
    let updatedSocial = { ...oldSocial };
    if (field === 'alias') {
      updatedSocial.alias = value;
    } else if (field === 'url') {
      updatedSocial.url = baseUrl + value;
    }
    socials[index] = updatedSocial;

    updatePendingProject({ ...projectData, projectSocials: socials });

    // Check if the updated social has alias, websiteId, and url, and if dataManager is available
    if (!updatedSocial.id || !updatedSocial.alias || !updatedSocial.url || !updatedSocial.websiteId || !dataManager) return;

    // Validation for both fields
    const hasAlias = updatedSocial.alias.trim() !== '';
    const hasUrl = updatedSocial.url.trim() !== baseUrl;
    if (!hasAlias || !hasUrl) return;

    // Determine if local or canon
    if ('localId' in updatedSocial && updatedSocial.localId) {
      // Local: addSocial
      dataManager.addSocial({
        id: { type: 'local', value: updatedSocial.localId },
        data: { alias: updatedSocial.alias, url: updatedSocial.url, websiteId: updatedSocial.websiteId }
      });
    } else if (updatedSocial.id) {
      // Canon: updateSocial
      dataManager.updateSocial({
        id: { type: 'canon', value: updatedSocial.id },
        data: { alias: updatedSocial.alias, url: updatedSocial.url, websiteId: updatedSocial.websiteId }
      });
    }
  };


  const handleCleanAndSave = () => {
    const tempSocials = [...(projectData.projectSocials || [])];
    const cleanedSocials: Pending<ProjectSocial>[] = [];

    tempSocials.forEach((social) => {
      const base = BaseSocialUrl[social.label as keyof typeof BaseSocialUrl] || '';
      // It is considered empty if it equals the base URL, or contains nothing/spaces
      const isEmpty = !social.url || social.url === base || social.url.trim() === '';

      if (isEmpty) {
        // Delete on backend
        if ("localId" in social) {
          dataManager?.deleteSocial({
            id: { type: 'local', value: social.localId as number },
            data: null
          });
        } else if (social.id) {
          dataManager?.deleteSocial({
            id: { type: 'canon', value: social.id },
            data: null
          });
        }
      } else {
        cleanedSocials.push(social as Pending<ProjectSocial>);
      }
    });

    // Frontend delete
    updatePendingProject({
      ...projectData,
      projectSocials: cleanedSocials
    });

    saveProject();
  };

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

      <div className="editor-header">
        Project Social Links
        {isLinksUnsaved && (
          <span className="unsaved-indicator">
            (Unsaved)
          </span>
        )}
      </div>
      <div className="editor-extra-info">
        Provide the links to pages you wish to include on your project page.
      </div>
      <div className='error'>{error}</div>

      <div id="editor-link-list">
        {/* Social URL inputs */}
        {projectAfterLinkChanges.projectSocials && projectAfterLinkChanges.projectSocials.map((social, index) => {
          const url = BaseSocialUrl[social.label as keyof typeof BaseSocialUrl];

          return (
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

                    projectAfterLinkChanges = {
                      ...projectAfterLinkChanges,
                      projectSocials: tempSocials
                    };

                    updatePendingProject(projectAfterLinkChanges);
                  }}
                  // Hide duplicates, but always show other
                  options={allSocials ? allSocials
                    // .filter(website => {
                    //   if (website.label === 'Other') return true;
                    //   if (website.label === social.label) return true; // Show currently selected platform
                    //   // Hide platforms already selected in other rows
                    //   return !(projectAfterLinkChanges.projectSocials || []).some(
                    //     s => s.label === website.label
                    //   );
                    // })
                    .map(website => {
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
                    }) : []
                  }
                />
              </Select>
              <Input
                type="single"
                id="alias-input"
                style={{
                  opacity: !social.label ? 0.4 : 1,
                  cursor: !social.label ? 'not-allowed' : 'text'
                }}
                disabled={!social.label} // Disable textbox until site category selected
                placeholder={'Label'}
                value={social.alias || ''}
                maxLength={45}
                onChange={(e) => handleSocialChange(index, 'alias', e.target.value, url)}
              />
              {url && (<div id="base-url">{url}</div>)}
              <Input
                type="single"
                id="url-input"
                style={{
                  opacity: !social.label ? 0.4 : 1,
                  cursor: !social.label ? 'not-allowed' : 'text'
                }}
                disabled={!social.label} // Disable textbox until site category selected
                placeholder={url === '' || !social.label ? "URL" : 'Username'}
                value={social.url && social.label ? social.url.substring(url.length) : ''}
                onChange={(e) => handleSocialChange(index, 'url', e.target.value, url)}
              />
              <div id="clear-all-trash-row">
                <button
                  type="button"
                  className="delete-position-button-alt button-reset"
                  onClick={() => handleDeleteSocial(index)}
                  title="Remove social link"
                >
                  <div id="clear-all-trash-row">
                    <ThemeIcon
                      id="trash"
                      width={18}
                      height={18}
                      ariaLabel="Delete position"
                    />
                  </div>
                </button>
              </div>
            </div>
          );
        })}
        <div id="add-link-container">
          <button id="profile-editor-add-link"
            onClick={() => {
              updatePendingProject({
                ...projectAfterLinkChanges,
                projectSocials: [...projectAfterLinkChanges.projectSocials || [], {
                  id: 0,
                  label: '',
                  url: '',
                  alias: '',
                  apiUrl: "",
                  websiteId: 0,
                  localId: ++localIdIncrement
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
        <div className="editor-save-actions">
          <Popup>
            {saveable ? "" :
              <div id="invalid-input-error" className={"save-error-msg-general"}>
                <p>*{message}*</p>
              </div>}
            {
              // Switches out the save button for a loading icon if the project is saving
              isSaving ?
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
                <div id="confirm-editor-save-text">
                  Are you sure you want to save all changes?
                  {projectData.approved &&
                    <p id="unapproved-warning">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      Saving changes to the General, Media, or Links tabs will unapprove your project and require you to submit it for review again before it can be approved.
                    </p>
                  }
                </div>
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
        </div>
      </div>
    </div>
  );
};