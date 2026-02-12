import { useState, useEffect, useCallback } from 'react';
import { ProfileImageUploader } from '../../ImageUploader';
import usePreloadedImage from '../../../functions/imageLoad';
import { Select, SelectButton, SelectOptions } from '../../Select';
import LabelInputBox from '../../LabelInputBox';
import { PendingUserProfile } from '../../../../types/types';
import { userDataManager } from '../../../api/data-managers/user-data-manager';
import { AcademicYear } from '@looking-for-group/shared/enums';
import { Major, Role } from '@looking-for-group/shared';
import { getJobTitles, getMajors } from '../../../api/users';

let profileAfterAboutChanges: PendingUserProfile;

type AboutTabProps = {
  dataManager: Awaited<ReturnType<typeof userDataManager>>;
  profile: PendingUserProfile;
  updatePendingProfile?: (updatedPendingrProfile: PendingUserProfile) => void;
};

/**
 * Profile About Tab. Set up the main interface for the about tab page and populate its default values while also permitting for inputs to edit the user's information.
 * @param dataManager Handles data changes to save changes later.
 * @param profile Temporary profile data.
 * @param updatePendingProfile Updates profile data.
 * @returns JSX Element
 */
export const AboutTab = ({dataManager, profile, updatePendingProfile = () => {}}: AboutTabProps) => {

  profileAfterAboutChanges = structuredClone(profile);

  const userId = profile.userId!;
  // Holds new profile image if one is selected

  // Preview URL for profile image
  const [previewUrl, setPreviewUrl] = useState<string>(usePreloadedImage(`${profile.profileImage}`, "/src/images/blue_frog.png"));

  const [selectedImageFile, setSelectedImageFile] = useState<File>();

  //getting the full lists of roles & majors
  const [roles, setRoles] = useState<Role[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const response = await getJobTitles();
      const roles: Role[] = response?.data ?? [];
      setRoles(roles);
    };
    const fetchMajors = async () => {
      const response = await getMajors();
      setMajors(response?.data ?? []);
    };
    const initializePfp = () => {
      setPreviewUrl(profile.profileImage as string)
    }
    fetchMajors();
    fetchRoles();
    initializePfp();
  }, [profile.profileImage]);

  /**
   * Saves the uploaded image to the profile.
   */
  const handleFileSelected = useCallback(async () => {
    //get the image uploader element
    const imageUploader = document.getElementById(
      "image-uploader"
    ) as HTMLInputElement;
  
    if (!imageUploader?.files?.length) return;

    //get the image itself (there will always be only one)
    const file = imageUploader.files[0];
    if (!["image/jpeg", "image/png"].includes(file.type)) return;

    //and we got it!
    setSelectedImageFile(file);
    const imgLink = URL.createObjectURL(file);
    setPreviewUrl(imgLink.substring(5, imgLink.length));

    dataManager.updateFields({
      id: {
        value: userId,
        type: 'canon'
      },
      data: {
        profileImage: file
      }
    })

    profileAfterAboutChanges = {
      ...profileAfterAboutChanges,
      profileImage: file
    }
    updatePendingProfile(profileAfterAboutChanges)
  }, [dataManager, updatePendingProfile, userId]);

  return (
    <div id="profile-editor-about" className="edit-profile-body about">
      <div id="edit-profile-section-1">
        <div id="profile-editor-add-image" className="edit-profile-image">
          <ProfileImageUploader 
          onFileSelected={handleFileSelected}
          initialImageUrl={previewUrl}
          initialImageFile={selectedImageFile}
          />
        </div>

        <div className="about-row row-1">
          <LabelInputBox
            label={'First Name*'}
            inputType={'single'}
            maxLength={50}
            value={profile.firstName}
            onChange={(e) => {
              const firstName = e.target.value;
              profileAfterAboutChanges = { ...profileAfterAboutChanges, firstName};
              updatePendingProfile(profileAfterAboutChanges);
              dataManager.updateFields({
                id: {
                  value: userId,
                  type: 'canon',
                },
                data: { firstName }
              })
            }}
          />
          <LabelInputBox
            label={'Last Name*'}
            inputType={'single'}
            maxLength={50}
            value={profile.lastName}
            onChange={(e) => {
              const lastName = e.target.value;
              profileAfterAboutChanges = { ...profileAfterAboutChanges, lastName};
              updatePendingProfile(profileAfterAboutChanges);
              dataManager.updateFields({
                id: {
                  value: userId,
                  type: 'canon',
                },
                data: { lastName }
              })
            }}
          />
          <LabelInputBox
            label={'Pronouns'}
            inputType={'single'}
            maxLength={25}
            value={profile.pronouns}
            onChange={(e) => {
              const pronouns = e.target.value;
              profileAfterAboutChanges = { ...profileAfterAboutChanges, pronouns};
              updatePendingProfile(profileAfterAboutChanges);
              dataManager.updateFields({
                id: {
                  value: userId,
                  type: 'canon',
                },
                data: { pronouns }
              })
            }}
          />
        </div>

        <div className="about-row row-2">
          {
    <LabelInputBox
      label={'Title'}
      inputType={'none'}
    >
      <Select>
        <SelectButton
          placeholder={"Select"}
          initialVal={profile.title ?? ""}
          callback={(e) => e.preventDefault()}
          type={'input'}
        />
        <SelectOptions
          callback={(e) => { 
            const title = (e.target as HTMLButtonElement).value

            profileAfterAboutChanges = {
              ...profileAfterAboutChanges,
              title
            }
            updatePendingProfile(profileAfterAboutChanges)
              dataManager.updateFields({
                id: {
                  value: userId,
                  type: 'canon',
                },
                data: { title }
              })
           }}
          options={roles.map(r => ({
          value: r.label,
          markup: <>{r.label}</>,
          disabled: false
          }))}
        />
      </Select>
    </LabelInputBox>}
          {
    //major (will need a ui change to accept multiple majors)
    <LabelInputBox
      label={'Major'}
      inputType={'none'}
    >
      <Select>
        <SelectButton
          placeholder='Select'
          initialVal={''}
          callback={(e) => e.preventDefault()}
          type={'input'}
        />
        <SelectOptions
          callback={(e) => { e.preventDefault(); }}
          options={majors.map(m => ({
          value: m.label,
          markup: <>{m.label}</>,
          disabled: false
          }))}
        />
      </Select>
    </LabelInputBox>}

          <LabelInputBox
            label={'Year'}
            inputType={'none'}
          >
            <Select>
              <SelectButton
                placeholder="Select"
                initialVal={profile.academicYear ? profile.academicYear : ""}
                callback={(e) => e.preventDefault()}
                type={'input'}
              />
              <SelectOptions
                callback={(e) => {
                  const year = (e.target as HTMLButtonElement).value as AcademicYear;

              profileAfterAboutChanges = {
                ...profileAfterAboutChanges,
                academicYear: year as AcademicYear
              }
              updatePendingProfile(profileAfterAboutChanges);

              dataManager.updateFields({
                id: {
                  value: userId,
                  type: 'canon'
                },
                data: {
                  academicYear: year as AcademicYear
                }
              })
                }}
                options={Object.values(AcademicYear).map((yr) => {
                  return {
                    value: yr,
                    markup: <>{yr}</>,
                    disabled: false
                  };
                })}
              />
            </Select>
          </LabelInputBox>
        </div>

        <div className="about-row row-3">
          <LabelInputBox
            label={'Location'}
            inputType={'single'}
            value={profile.location}
            onChange={(e) => {
              const location = e.target.value;
              profileAfterAboutChanges = { ...profileAfterAboutChanges, location};
              updatePendingProfile(profileAfterAboutChanges);
              dataManager.updateFields({
                id: {
                  value: userId,
                  type: 'canon',
                },
                data: { location }
              })
            }}
          />

          <LabelInputBox
            label={'Mentorship Status'}
            inputType={'none'}
          >
            <Select>
              <SelectButton
                placeholder="Select"
                initialVal={profile.mentor === true ? 'Mentor' : 'Not a mentor'}
                callback={(e) => e.preventDefault()}
                type={'input'}
              />
              <SelectOptions
                callback={(e) => {
                  //true if it's mentor, false if it's anythin else
                const mentor = ((e.target as HTMLButtonElement).value === "Mentor");
                console.log(mentor)
              profileAfterAboutChanges = { ...profileAfterAboutChanges, mentor};
              updatePendingProfile(profileAfterAboutChanges);
              dataManager.updateFields({
                id: {
                  value: userId,
                  type: 'canon',
                },
                data: { mentor: `${mentor}` } //annoying that it's a string but go off ig
              })
                  
                }}
                options={[{
                  value: 'Not a mentor',
                  markup: <>Not a mentor</>,
                  disabled: false
                }, {
                  value: 'Mentor',
                  markup: <>Mentor</>,
                  disabled: false
                }]}
              />
            </Select>
          </LabelInputBox>
        </div>
      </div>

      <div id="edit-profile-section-2">
        <LabelInputBox
          label={'Personal Quote'}
          labelInfo='Write a fun and catchy phrase that captures your unique personality!'
          inputType={'multi'}
          maxLength={100}
          value={profile.headline}
          onChange={(e) => {
              const headline = e.target.value;
              profileAfterAboutChanges = { ...profileAfterAboutChanges, headline};
              updatePendingProfile(profileAfterAboutChanges);
              dataManager.updateFields({
                id: {
                  value: userId,
                  type: 'canon',
                },
                data: { headline }
              })
          }}
        />

        <LabelInputBox
          label={'Fun Fact'}
          labelInfo='Share a fun fact about yourself that will surprise others!'
          inputType={'multi'}
          maxLength={100}
          value={profile.funFact}
          onChange={(e) => {
              const funFact = e.target.value;
              profileAfterAboutChanges = { ...profileAfterAboutChanges, funFact};
              updatePendingProfile(profileAfterAboutChanges);
              dataManager.updateFields({
                id: {
                  value: userId,
                  type: 'canon',
                },
                data: { funFact }
              })
          }}
        />
      </div>

      <LabelInputBox
        label={'About Me*'}
        labelInfo='Share a brief overview of who you are, your interests, and what drives you!'
        inputType={'multi'}
        maxLength={600}
        value={profile.bio}
        onChange={(e) => {
          
              const bio = e.target.value;
              profileAfterAboutChanges = { ...profileAfterAboutChanges, bio};
              updatePendingProfile(profileAfterAboutChanges);
              dataManager.updateFields({
                id: {
                  value: userId,
                  type: 'canon',
                },
                data: { bio }
              })
        }}
        id={'edit-profile-section-3'}
      />
    </div>
  );
};
