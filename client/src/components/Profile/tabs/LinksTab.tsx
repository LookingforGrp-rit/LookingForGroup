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
//let profileAfterLinkChanges: PendingUserProfile;

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

  const [profileAfterLinkChanges, setLocalProfile] = useState(profile)

  //stores the usernames for each social row
  const [usernames, setUsernames] = useState<Record<number, string>>({});

  // complete list of socials
  const [allSocials, setAllSocials] = useState<Social[]>([]);

  const [error, setError] = useState<string | null>(null);

  //initial username when load
  useEffect(() => {
    setLocalProfile(structuredClone(profile))

    const initialUsernames: Record<number, string> = {};
    profile.socials.forEach((soc, i) => {
      const base = BaseSocialUrl[soc.label as keyof typeof BaseSocialUrl] || "";
      initialUsernames[i] = soc.url.startsWith(base)
        ? soc.url.substring(base.length)
        : soc.url;

    })

    setUsernames(initialUsernames);
  }, [profile]);

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
        id: { type: 'canon', value: targetSocial.id },
        data: null
      });
    }

    const filteredSocials = [...profileAfterLinkChanges.socials].filter((_, i) => i !== index);
    updatePendingProfile({ ...profileAfterLinkChanges, socials: filteredSocials });
  };

  const handleSocialChange = (
    index: number,
    field: "alias" | "url",
    value: string,
    baseUrl: string,
  ) => {
    const socials = [...profileAfterLinkChanges.socials];

    if (field === "url") {
      //update local state
      setUsernames(prev => ({
        ...prev,
        [index]: value,
      }))

      //update url in profile
      socials[index] = {
        ...socials[index],
        url: baseUrl + value,
      };
    } else {
      socials[index] = {
        ...socials[index],
        alias: value,
      };
    }

    updatePendingProfile({
      ...profileAfterLinkChanges,
      socials,
    });

    const updatedSocial = socials[index];
    const hasAlias = updatedSocial.alias.trim() !== "";
    const hasUrl = updatedSocial.url.trim() !== "";

    if (!hasAlias || !hasUrl) {
      setError("Both Label and URL must be filled in to save changes.");
      return;
    }
    setError('');

    if ("localId" in updatedSocial) {
      dataManager.addSocial({
        id: {
          type: "local",
          value: updatedSocial.localId ?? ++localIdIncrement,
        },
        data: updatedSocial as AddUserSocialInput,
      });
    } else {
      dataManager.updateSocial({
        id: {
          type: "canon",
          value: updatedSocial.id,
        },
        data: {
          alias: updatedSocial.alias,
          url: updatedSocial.url,
          websiteId: updatedSocial.websiteId,
        },
      });
    }
  };

  // Otherwise render the editable profile socials UI
  return (
    <div id="editor-links">
      <div className="editor-header">Social Links</div>
      <div className="editor-extra-info">
        Provide the links to pages you wish to include on your page.
      </div>
      <div className='error'>{error}</div>

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

                      const tempSocials = [...profileAfterLinkChanges.socials];
                      tempSocials[index] = {
                        ...tempSocials[index],
                        label: selectedLabel,
                        websiteId: selectedSocial?.websiteId || 0
                      }

                      updatePendingProfile({
                        ...profileAfterLinkChanges,
                        socials: tempSocials
                      });

                    }}
                    // Hide duplicates, but always show 'Other'
                    options={
                      allSocials ?
                        allSocials
                          // .filter((website) => {
                          //   if (website.label === "Other") return true;
                          //   if (website.label === social.label) return true; // Show currently selected platform
                          //   // Hide platforms already selected in other rows
                          //   return !(profileAfterLinkChanges.socials || []).some(
                          //     (s) => s.label === website.label
                          //   );
                          // })
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
                {/* Social Label input */}
                <Input
                  type='single'
                  disabled={!social.label}
                  style={{
                    opacity: !social.label ? 0.4 : 1,
                    cursor: !social.label ? "not-allowed" : "text",
                  }}
                  placeholder={'Label'}
                  value={social.alias || ''}
                  maxLength={45}
                  onChange={(e) => {
                    handleSocialChange(index, "alias", e.target.value, url);
                  }}
                ></Input>
                {/* Social URL input */}
                {url && <div id="base-url">{url}</div>}
                <Input
                  type="single"
                  disabled={!social.label}
                  style={{
                    opacity: !social.label ? 0.4 : 1,
                    cursor: !social.label ? "not-allowed" : "text",
                  }}
                  placeholder={(url as string) === "" || !social.label ? "URL" : 'Username'}
                  value={usernames[index] ?? ''} //stop curser jumping
                  onChange={(e) => {
                    handleSocialChange(index, "url", e.target.value, url);
                  }}
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
          <button
            id="profile-editor-add-link"
            onClick={(e) => {
              e.preventDefault();
              updatePendingProfile({
                ...profileAfterLinkChanges,
                socials: [...profileAfterLinkChanges.socials,
                {
                  id: 0,
                  label: '',
                  url: '',
                  alias: '',
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
