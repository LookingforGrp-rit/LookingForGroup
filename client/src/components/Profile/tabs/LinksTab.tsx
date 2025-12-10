import React, { useState, useEffect } from "react";
import { getSocials } from "../../../api/users";
import {
  Social,
  AddUserSocialInput
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
 * @returns JSX Element
 */
export const LinksTab: React.FC<LinksTabProps> = ({
  dataManager,
  profile,
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
          profileAfterLinkChanges.socials.map((social, index) => (
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
                  (tempSocials[index] as PendingUserSocial).localId = ++localIdIncrement; //lol it never had a local id
                  if(selectedSocial && "localId" in social){ //so it only tries to add newly added ones

                  dataManager.addSocial({
                    id: {
                      value: (tempSocials[index] as PendingUserSocial).localId ?? ++localIdIncrement,
                      type: 'local'
                    },
                    data: tempSocials[index] as AddUserSocialInput
                  })
                  profileAfterLinkChanges = {
                    ...profileAfterLinkChanges,
                    socials: tempSocials
                  }
                  }
                  updatePendingProfile(profileAfterLinkChanges);
                  }}
                  options={
                    allSocials
                      ? allSocials.map((website) => {
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
                  const tempSocials = profileAfterLinkChanges.socials;
                  tempSocials[index].url = BaseSocialUrl[social.label as keyof typeof BaseSocialUrl] + e.target.value;

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
                updatePendingProfile({ ...profileAfterLinkChanges, socials: tempSocials });
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
                profileAfterLinkChanges.socials = 
                  profileAfterLinkChanges.socials.filter(
                            (soc) =>
                              social.websiteId !==
                              soc.websiteId
                          ); //get it outta here
                updatePendingProfile(profileAfterLinkChanges)
                }
              }}
              />
            </div>
          ))}
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
    </div>
  );
};
