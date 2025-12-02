import React, { useState, useEffect } from "react";
import { getUsersById, getSocials } from "../../../api/users";
import {
  UserSocial,
  Social,
  MeDetail,
  MePrivate,
} from "@looking-for-group/shared";
import { getByID } from "../../../api/projects";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { ThemeIcon } from "../../ThemeIcon";
import { Input } from "../../Input";
import { userDataManager } from "../../../api/data-managers/user-data-manager";
import { PendingUserProfile } from "../../../../types/types";

interface LinksTabProps {
  profile: MePrivate;
  dataManager: Awaited<ReturnType<typeof userDataManager>>;
  updatePendingProfile: (profileData: PendingUserProfile) => void;
}

export const LinksTab: React.FC<LinksTabProps> = ({
  profile,
  dataManager,
  updatePendingProfile,
}) => {
  const [socials, setSocials] = useState<UserSocial[]>(profile.socials || []);

  // complete list of socials
  const [allSocials, setAllSocials] = useState<Social[]>([]);

  // // If projectId is provided, we'll fetch project owner & project socials
  // const [projectOwner, setProjectOwner] = useState<any | null>(null);
  // const [projectSocials, setProjectSocials] = useState<any[]>([]);

  // Get social option data
  useEffect(() => {
    const getAllSocials = async () => {
      const response = await getSocials();

      // Reorder so 'Other' is last
      if (response?.data) {
        const otherIndex = response.data.findIndex((s) => s.label === "Other");
        if (otherIndex > -1) {
          const other = response.data.splice(otherIndex, 1)[0];
          response.data.push(other);
        }
      }

      setAllSocials(response.data!);
    };
    getAllSocials();
  }, []);

  // If a projectId was passed in use it to fetch project info (owner + socials)
  // useEffect(() => {
  //   const fetchProject = async () => {
  //     if (!projectId) return;
  //     try {
  //       const resp = await getByID(projectId);
  //       if (resp?.data) {
  //         const proj = resp.data as any;
  //         // project owner might be included on the project object
  //         if (proj.owner) {
  //           // if owner is a full user object use it, otherwise try to fetch by id
  //           if (proj.owner.userId && proj.owner.firstName) {
  //             setProjectOwner(proj.owner);
  //           } else if (proj.owner.userId) {
  //             try {
  //               const ownerResp = await getUsersById(proj.owner.userId.toString());
  //               if (ownerResp?.data) setProjectOwner(ownerResp.data);
  //             } catch (e) {
  //               console.error('Error fetching project owner details:', e);
  //             }
  //           }
  //         }

  //         // project socials
  //         if (proj.socials) setProjectSocials(proj.socials);
  //       }
  //     } catch (err) {
  //       console.error('Error fetching project details:', err);
  //     }
  //   };
  //   fetchProject();
  // }, [projectId]);

  // useEffect(() => {
  // setProfile(prev => ({
  //   ...prev,
  //   socials: socials
  // }));
  // }, [socials]);

  // // Tab Component ----------------------
  // // If projectId is provided, render read-only project socials + owner contact
  // if (projectId) {
  //   return (
  //     <div id="editor-links">
  //       {projectOwner && (
  //         <div id="editor-contact-info">
  //           <div className="editor-header">Contact Project Owner</div>
  //           <div className="editor-extra-info">
  //             Connect with {projectOwner.firstName} {projectOwner.lastName}{" "}
  //             through their social profiles.
  //           </div>

  //           {projectOwner.socials && projectOwner.socials.length > 0 ? (
  //             <div className="contact-socials-grid">
  //               {projectOwner.socials.map(
  //                 (social: { label: string; url: string }, index: number) => (
  //                   <a
  //                     key={index}
  //                     href={social.url}
  //                     target="_blank"
  //                     rel="noopener noreferrer"
  //                     className="contact-social-link"
  //                     title={`Contact via ${social.label}`}
  //                   >
  //                     <ThemeIcon
  //                       width={20}
  //                       height={20}
  //                       id={
  //                         social.label === "Other"
  //                           ? "link"
  //                           : social.label.toLowerCase()
  //                       }
  //                       className="mono-fill"
  //                       ariaLabel={social.label}
  //                     />
  //                     <span>{social.label}</span>
  //                   </a>
  //                 )
  //               )}
  //             </div>
  //           ) : (
  //             <div className="no-contact-info">
  //               No contact information available for this project owner.
  //             </div>
  //           )}
  //         </div>
  //       )}

  //       <div className="editor-header">Project Social Links</div>
  //       <div className="editor-extra-info">
  //         Provide the links to pages you wish to include on the project page.
  //       </div>

  //       <div id="editor-link-list">
  //         {projectSocials && projectSocials.length > 0 ? (
  //           <div className="contact-socials-grid">
  //             {projectSocials.map(
  //               (social: { label: string; url: string }, idx: number) => (
  //                 <a
  //                   key={idx}
  //                   href={social.url}
  //                   target="_blank"
  //                   rel="noopener noreferrer"
  //                   className="contact-social-link"
  //                   title={`Visit ${social.label}`}
  //                 >
  //                   <ThemeIcon
  //                     width={20}
  //                     height={20}
  //                     id={
  //                       social.label === "Other"
  //                         ? "link"
  //                         : social.label.toLowerCase()
  //                     }
  //                     className="mono-fill"
  //                     ariaLabel={social.label}
  //                   />
  //                   <span>{social.label}</span>
  //                 </a>
  //               )
  //             )}
  //           </div>
  //         ) : (
  //           <div className="no-contact-info">
  //             No social links available for this project.
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }

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
        {socials &&
          socials.map((social, index) => (
            <div className="editor-link-item" key={index}>
              {/* Social type dropdown */}
              <Select>
                <SelectButton
                  placeholder="Select"
                  initialVal={
                    social.label !== ""
                      ? ((
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
                        ) as unknown as string)
                      : undefined
                  }
                  className="link-select"
                  type={"input"}
                  callback={(e) => {
                    e.preventDefault();
                  }}
                />
                <SelectOptions
                  callback={(e) => {
                    e.preventDefault();
                    const tempSocials = [...socials];
                    tempSocials[index].label = (
                      e.target as HTMLInputElement
                    ).value;
                    setSocials(tempSocials);
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
              {/* Social URL input */}
              <Input
                type="link"
                placeholder="URL"
                value={social.url}
                onChange={(e) => {
                  e.preventDefault();
                  // TODO: Implement some sort of security check for URLs.
                  // Could be as simple as checking the URL matches the social media
                  // But since 'Other' is an option, might be good to just find some
                  // external list of suspicious sites and make sure it's not one of those.
                  const tempSocials = [...socials];
                  tempSocials[index].url = (e.target as HTMLInputElement).value;
                  setSocials(tempSocials);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  (e.target as HTMLElement)
                    .closest(".editor-link-item")
                    ?.remove();
                }}
              />
            </div>
          ))}
        <div id="add-link-container">
          <button
            id="profile-editor-add-link"
            onClick={(e) => {
              e.preventDefault();
              setSocials([
                ...socials,
                {
                  label: "",
                  url: "",
                  websiteId: 0,
                },
              ]);
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
