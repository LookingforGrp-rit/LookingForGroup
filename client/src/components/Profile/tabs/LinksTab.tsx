import React, { useState, useEffect } from "react";
import { getSocials } from "../../../api/users";
import {
  Social,
  AddUserSocialInput,
  MePrivate
} from "@looking-for-group/shared";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { ThemeIcon } from "../../ThemeIcon";
import { Input } from "../../Input";
import { userDataManager } from "../../../api/data-managers/user-data-manager";
import { PendingUserProfile, PendingUserSocial } from "../../../../types/types";
import { BaseSocialUrl } from "@looking-for-group/shared/enums";


//will be extremely similar if not identical to project profiles
interface LinksTabProps {
  profile: PendingUserProfile;
  unmodifiedProfile: MePrivate;
  dataManager: Awaited<ReturnType<typeof userDataManager>>;
  updatePendingProfile: (profileData: PendingUserProfile) => void;
}

let localIdIncrement = 0;
let profileAfterLinkChanges: PendingUserProfile;

/**
 * Profile Links tab. Displays editable social links UI.
 * It fetches user data on load, allows adding/removing/editing of links, and syncs changes with the state for re-rendering.
 * @param dataManager Handles data changes to save changes later.
 * @param profile Temporary profile data.
 * @param updatePendingProfile Updates profile data.
 * @param unmodifiedProfile A copy of the profile before any changes
 * @returns JSX Element
 */
export const LinksTab: React.FC<LinksTabProps> = ({
  dataManager,
  profile,
  unmodifiedProfile,
  updatePendingProfile,
}) => {

  profileAfterLinkChanges = structuredClone(profile);

  // complete list of socials
  const [allSocials, setAllSocials] = useState<Social[]>([]);


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

  const handleDeleteSocial = (index: number) => {
    const targetSocial = (profile.socials || [])[index];
    if (!targetSocial) return;

    if ("localId" in targetSocial) {
      dataManager.deleteSocial({
        id: { type: "local", value: targetSocial.localId as number },
        data: null,
      });
    } else if (targetSocial.websiteId) {
      dataManager.deleteSocial({
        id: { type: 'canon', value: targetSocial.websiteId },
        data: null
      });
    }

    const filteredSocials = (profile.socials || []).filter((_, i) => i !== index);
    updatePendingProfile({ ...profile, socials: filteredSocials });
  };

  // Otherwise render the editable profile socials UI
  return (
    <div id="editor-links">
      <div className="editor-header">Social Links</div>
      <div className="editor-extra-info">
        Provide the links to pages you wish to include on your page.
      </div>
      {/* <div className='error'>{error}</div> */}

      <div id="editor-link-list">
        {/* Social URL inputs */}
        {profileAfterLinkChanges.socials &&
          profileAfterLinkChanges.socials.map((social, index) => {
            const url = BaseSocialUrl[social.label as keyof typeof BaseSocialUrl];

            return (
              <div className="editor-link-item" key={index}>
                {/* Social type dropdown */}
                <Select>
                  <SelectButton
                    placeholder="Select"
                    initialVal={
                      social.label
                        ? (
                            <>
                              <ThemeIcon
                                width={20}
                                height={20}
                                id={
                                  social.label === "Other"
                                    ? "link"
                                    : social.label.toLowerCase()
                                }
                                className={"mono-fill"}
                                ariaLabel={social.label}
                              />
                              {social.label}
                            </>
                          ) as unknown as string
                        : undefined}
                    className="link-select"
                    type={"input"}
                    callback={(e) => {
                      e.preventDefault();
                    }}
                  />
                  <SelectOptions
                    callback={(e) => {
                      const selectedLabel = (e.target as HTMLInputElement).value;
                      const selectedSocial = allSocials.find(s => s.label === selectedLabel);
                      
                      const tempSocials = profileAfterLinkChanges.socials;
                      tempSocials[index].label = selectedLabel;
                      tempSocials[index].websiteId = selectedSocial?.websiteId || 0;

                      profileAfterLinkChanges = {
                        ...profileAfterLinkChanges,
                        socials: tempSocials
                      };
                      
                      updatePendingProfile(profileAfterLinkChanges);
                    }}
                    // Hide duplicates, but always show 'Other'
                    options={
                      allSocials
                        ? allSocials
                            .filter((website) => {
                              if (website.label === "Other") return true;
                              if (website.label === social.label) return true; // Show currently selected platform
                              // Hide platforms already selected in other rows
                              return !(profileAfterLinkChanges.socials || []).some(
                                (s) => s.label === website.label
                              );
                            })
                            .map((website) => {
                              return {
                                markup: (
                                  <>
                                    <ThemeIcon
                                      width={20}
                                      height={20}
                                      id={
                                        website.label === "Other"
                                          ? "link"
                                          : website.label.toLowerCase()
                                      }
                                      className={"mono-fill"}
                                      ariaLabel={website.label}
                                    />
                                    {website.label}
                                  </>
                                ),
                                value: website.label,
                                disabled: false,
                              };
                            })
                        : []
                    }
                  />
                </Select>
                {/* Social URL input */}
                {url && <div id="base-url">{url}</div>}
                <Input
                  type="single"
                  disabled={!social.label}
                  style={{
                    opacity: !social.label ? 0.4 : 1,
                    cursor: !social.label ? "not-allowed" : "text",
                  }}                
                  placeholder={url === '' || !social.label ? "URL" : 'Username'}
                  value={social.url && social.label ? social.url.substring(url.length) : ''}
                  onChange={(e) => {
                    // TODO: Implement some sort of security check for URLs.
                    // Could be as simple as checking the URL matches the social media
                    // But since 'Other' is an option, might be good to just find some
                    // external list of suspicious sites and make sure it's not one of those.
                    const tempSocials = profileAfterLinkChanges.socials;
                    const inputValue = e.target.value;
                    tempSocials[index].url = url + e.target.value;
                    
                    if (inputValue.trim() !== "") {
                      if("localId" in social){
                        dataManager.addSocial({
                          id: {
                            type: "local",
                            value: social.localId ?? ++localIdIncrement
                          },
                          data: tempSocials[index] as AddUserSocialInput
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
                    }
                    updatePendingProfile({ ...profileAfterLinkChanges, socials: tempSocials });
                  }}
                  onBlur={(e) => {
                    // Automatically clean empty entries when the user clicks away
                    const inputValue = e.target.value;
                    if (inputValue.trim() === "") {
                      handleDeleteSocial(index);
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="delete-social-btn" 
                  onClick={() => handleDeleteSocial(index)}
                  title="Remove social link"
                >
                  <i className="fa fa-trash" style={{ color: '#ff4d4f' }} />
                </button>
              </div>
            );
          })}
        <div id="add-link-container">
          <button
            id="profile-editor-add-link"
            onClick={(e) => {
                  e.preventDefault();
              updatePendingProfile({
                ...profileAfterLinkChanges,
                socials: [...profileAfterLinkChanges.socials || [], {
                  label: '',
                  url: '',
                  apiUrl: "",
                  websiteId: 0,
                  localId: ++localIdIncrement,
                }]
              });
            }}
          >
            <i className="fa fa-plus" />
            <p>Add social profile</p>
          </button>
        </div>
      </div>
    </div>
  );
};
