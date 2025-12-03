import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import { MajorSelector } from '../../MajorSelector';
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
  saveProfile?: () => Promise<void>;
  updatePendingProfile?: (updatedPendingrProfile: PendingUserProfile) => void;
  failCheck?: boolean;
  selectedImageFile: File | null;
  setSelectedImageFile: Dispatch<SetStateAction<File | null>>
};


// Main Component
export const AboutTab = ({dataManager, profile, selectedImageFile, saveProfile = async () => {}, updatePendingProfile = () => {}, failCheck}: AboutTabProps) => {

  profileAfterAboutChanges = structuredClone(profile);

  const userId = profile.userId!;
  // Holds new profile image if one is selected

  // Preview URL for profile image
  const [previewUrl, setPreviewUrl] = useState<string>(usePreloadedImage(`images/profiles/${profile.profileImage}`, "../../../images/blue_frog.png"));

  //getting the full lists of roles & majors
  const [roles, setRoles] = useState<Role[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const response = await getJobTitles();
      const roles: Role[] = response?.data ?? [];
      setRoles(roles);
    };
    fetchRoles();
  }, []);
  useEffect(() => {
    const fetchMajors = async () => {
      const response = await getMajors();
      setMajors(response?.data ?? []);
    };
    fetchMajors();
  }, []);
  // Update preview image when selected image changes
//   useEffect(() => {
//   if (selectedImageFile) {
//     const imgLink = URL.createObjectURL(selectedImageFile);
//     setPreviewUrl(imgLink);
//     return () => URL.revokeObjectURL(imgLink);
//   } else {
//     // Maintain original preview URL
//     setPreviewUrl(previewUrl);
//   }
// }, [selectedImageFile, profileData.profileImage, previewUrl]);

//   // Set new image when one is picked from uploader
//   const handleFileSelected = (file: File) => {
//     console.log('got uploaded file', file);  
//     setSelectedImageFile(file);
//   };
  // Send selected image to server for save
  // const saveImage = async () => {
  //   if (!selectedImageFile) return;

  //   await editUser({ profileImage: selectedImageFile });
  // };

  return (
    <div id="profile-editor-about" className="edit-profile-body about">
      <div id="edit-profile-section-1">
        <div id="profile-editor-add-image" className="edit-profile-image">
          <ProfileImageUploader initialImageUrl={previewUrl}/>
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
          placeholder="Select"
          initialVal={''}
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
    <LabelInputBox
      label={'Major'}
      inputType={'none'}
    >
      <Select>
        <SelectButton
          placeholder='Select'
          initialVal={''}
          callback={(e) => { e.preventDefault(); }}
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
          onChange={(e) => setProfile(prev => ({ ...prev, headline: e.target.value }))}
        />

        <LabelInputBox
          label={'Fun Fact'}
          labelInfo='Share a fun fact about yourself that will surprise others!'
          inputType={'multi'}
          maxLength={100}
          value={profile.funFact}
          onChange={(e) => setProfile(prev => ({ ...prev, funFact: e.target.value }))}
        />
      </div>

      <LabelInputBox
        label={'About Me*'}
        labelInfo='Share a brief overview of who you are, your interests, and what drives you!'
        inputType={'multi'}
        maxLength={600}
        value={profile.bio}
        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
        id={'edit-profile-section-3'}
      />
    </div>
  );
};
