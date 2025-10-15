import { useState, useEffect } from 'react';
import { ProfileData } from '../ProfileEditPopup';
import { RoleSelector } from '../../RoleSelector';
import { MajorSelector } from '../../MajorSelector';
import { ImageUploader, ProfileImageUploader } from '../../ImageUploader';
import { getMajors, getJobTitles } from "../../../api/users";
import usePreloadedImage from '../../../functions/imageLoad';
import { Select, SelectButton, SelectOptions } from '../../Select';
import { Input } from '../../Input';
import LabelInputBox from '../../LabelInputBox';

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

// Methods
const setUpInputs = async (profileData: ProfileData) => {
  console.log(profileData);

  // Obtain roles and majors to obtain the proper label for the Role Selector and Major Selector
  let roles: any, majors: any;
  const getRolesAndMajors = async () => {
    const roleResponse = await getJobTitles();
    const majorResponse = await getMajors();

    roles = roleResponse.data;
    majors = majorResponse.data;
  };

  // Used to avoid repetition and map values onto element IDs.
  const pairInputToData = (input: string, data: any) => {
    const inputElement = document.getElementById(`profile-editor-${input}`) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = data;
    }
  };

  // Obtain information
  await getRolesAndMajors();
  // Pair information
  pairInputToData('firstName', profileData.first_name);
  pairInputToData('lastName', profileData.last_name);
  pairInputToData('pronouns', profileData.pronouns);
  pairInputToData('jobTitle', roles.find((r: any) => r.label === profileData.job_title).title_id);
  pairInputToData('major', majors.find((r: any) => r.label === profileData.major).major_id);
  pairInputToData('academicYear', profileData.academic_year);
  pairInputToData('location', profileData.location);
  pairInputToData('headline', profileData.headline);
  pairInputToData('funFact', profileData.fun_fact);
  pairInputToData('bio', profileData.bio);
  // Load in the profile picture
  <ProfileImageUploader initialImageUrl={`${API_BASE}/images/profiles/${profileData.profile_image}`} />
};

// Components
const TextArea = (props: {
  title: string;
  description: string;
  count: number;
  maxLength: number;
  id: string;
}) => {
  
  return (
    <div className="editor-input-item editor-input-textarea">
      <label>{props.title}</label>
      <div className="project-editor-extra-info">{props.description}</div>
      <Input type="multi" maxLength={props.maxLength} />
    </div>
  );
};

// Main Component
export const AboutTab = ({profile, selectedImageFile, setSelectedImageFile}: {
  profile: ProfileData; 
  selectedImageFile: File | null;
  setSelectedImageFile: (file: File) => void;
}) => {

  // Preview URL for profile image
  const [previewUrl, setPreviewUrl] = useState<string>(usePreloadedImage(`${API_BASE}/images/profiles/${profile.profile_image}`, "../../../images/blue_frog.png"));

  // Effects
  // Set up profile input on first load
  useEffect(() => {
    const setUp = async () => {
      await setUpInputs(profile);
    };
    setUp();
  }, [profile]);

  // Update preview image when selected image changes
  useEffect(() => {
  if (selectedImageFile) {
    const imgLink = URL.createObjectURL(selectedImageFile);
    setPreviewUrl(imgLink);
    return () => URL.revokeObjectURL(imgLink);
  } else {
    // Maintain original preview URL
    setPreviewUrl(previewUrl);
  }
}, [selectedImageFile, profile.profile_image, previewUrl]);

  // Set new image when one is picked from uploader
  const handleFileSelected = (file: File) => {
  setSelectedImageFile(file);
};

  return (
    <div id="profile-editor-about" className="edit-profile-body about">
      <div id="edit-profile-section-1">
        <div id="profile-editor-add-image" className="edit-profile-image">
          <ProfileImageUploader initialImageUrl={previewUrl} onFileSelected={handleFileSelected} />
        </div>

        <div className="about-row row-1">
          <LabelInputBox
            label={'First Name*'}
            inputType={'single'}
            maxLength={50}
          />
          <LabelInputBox
            label={'Last Name*'}
            inputType={'single'}
            maxLength={50}
          />
          <LabelInputBox
            label={'Pronouns'}
            inputType={'single'}
            maxLength={25}
          />
        </div>

        <div className="about-row row-2">
          {<RoleSelector />}
          {<MajorSelector />}

          <LabelInputBox
            label={'Year'}
            inputType={'none'}
          >
            <Select>
              <SelectButton
                placeholder="Select..."
                initialVal={profile.academicYear ? profile.academicYear : 'Select...'}
                callback={(e) => { e.preventDefault(); } }
                type={'input'}
              />
              <SelectOptions
                callback={(e) => {e.preventDefault();}}
                options={[{
                  value: 'Freshman',
                  markup: <>Freshman</>,
                  disabled: false
                }, {
                  value: 'Sophomore',
                  markup: <>Sophomore</>,
                  disabled: false
                }, {
                  value: 'Junior',
                  markup: <>Junior</>,
                  disabled: false
                }, {
                  value: 'Senior',
                  markup: <>Senior</>,
                  disabled: false
                }, {
                  value: 'Graduate',
                  markup: <>Graduate</>,
                  disabled: false
                }]}
              />
            </Select>
          </LabelInputBox>
        </div>

        <div className="about-row row-3">
          <LabelInputBox
            label={'Location'}
            inputType={'single'}
          />

          <LabelInputBox
            label={'Mentorship Status'}
            inputType={'none'}
          >
            <Select>
              <SelectButton
                placeholder="Select..."
                initialVal={profile.mentor === true ? 'Mentor' : 'Not a mentor'}
                callback={(e) => { e.preventDefault(); } }
                type={'input'}
              />
              <SelectOptions
                callback={(e) => {e.preventDefault();}}
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
        />

        <LabelInputBox
          label={'Fun Fact'}
          labelInfo='Share a fun fact about yourself that will surprise others!'
          inputType={'multi'}
          maxLength={100}
        />
      </div>

      {/* Only item in edit-profile-section-3, so no wrapper */}
      <LabelInputBox
        label={'About Me*'}
        labelInfo='Share a brief overview of who you are, your interests, and what drives you!'
        inputType={'multi'}
        maxLength={600}
        id={'edit-profile-section-3'}
      />
    </div>
  );
};
