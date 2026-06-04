import { CreateUserInput, Skill } from '@looking-for-group/shared';
import { MouseEventHandler } from 'react';
import LabelInputBox from '../LabelInputBox';
import { Select, SelectButton, SelectOptions } from '../Select';

interface CompleteProfileProps {
  show : boolean;
  onNext : MouseEventHandler<HTMLButtonElement>;
  onBack : MouseEventHandler<HTMLButtonElement>;
  userInfo : CreateUserInput;
  selectedSkills: Skill[];
  bio : string;
  pronouns : string;
  slogan : string;
  phoneNumber : string;
  currentJobTitle : string;
  location : string;
  funFact : string;
  // major: string;
  setBio : React.Dispatch<React.SetStateAction<string>>;
  setPronouns : React.Dispatch<React.SetStateAction<string>>;
  setSlogan :  React.Dispatch<React.SetStateAction<string>>;
  setPhoneNumber :  React.Dispatch<React.SetStateAction<string>>;
  setCurrentJobTitle :  React.Dispatch<React.SetStateAction<string>>;
  setLocation :  React.Dispatch<React.SetStateAction<string>>;
  setFunFact :  React.Dispatch<React.SetStateAction<string>>;
  // setMajor: 
  profileImage : any;
  setProfileImage : any;
}

/**
 * This component renders on screen the ability to complete their profile 
 * during the sign-up phase of creating their account.
 * @param show Determines if the modal is visible
 * @param onNext Callback for next button
 * @param onBack Callback for back button
 * @param userInfo user information
 * @param bio current user bio 
 * @param pronouns user pronouns
 * @param slogan user slogan
 * @param phoneNumber user phone number
 * @param currentJobTitle user current job title
 * @param location user location 
 * @param funFact user fun fact
 * @param major user major
 * @param setBio set user bio 
 * @param setPronouns set user pronouns
 * @param profileImage user profile image 
 * @param setProfileImage set user profile image
 * @returns HTML - user can implement their bio, pronouns, profile image upload, button to use avatar, 
 * and navigation buttons like “Back” and “Next”.
 */
const CompleteProfile : React.FC<CompleteProfileProps> = ({
  show,
  onNext,
  onBack,
  // avatarImage,
  userInfo,
  selectedSkills,
  bio,
  pronouns,
  slogan,
  phoneNumber,
  currentJobTitle,
  location,
  funFact,
  // major,
  setBio,
  setPronouns,
  setSlogan,
  setPhoneNumber,
  setCurrentJobTitle,
  setLocation,
  setFunFact, 
  // setMajor,
  profileImage,
  setProfileImage,
}) => {
  // make each skill tag a different color
  // matches the colors in the design/background
  const tagColors = ['#9FACFF', '#97E5AB', '#99E6EA', '#F18067', '#239EF7'];

  // Utilizes an imported function for setting the bio of a profile
  const handleBioChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };

  // Utilizes an imported function for setting the pronouns of a profile
  const handlePronounsChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setPronouns(e.target.value);
  };

  // Utilizes an imported function for setting the slogan of a profile
  const handleSloganChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setSlogan(e.target.value);
  };

  // Utilizes an imported function for setting the phone number of a profile
  const handlePhoneNumberChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  // Utilizes an imported function for setting the current job title of a profile
  const handleCurrentJobTitleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setCurrentJobTitle(e.target.value);
  };

  // Utilizes an imported function for setting the location of a profile
  const handleLocationChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  // Utilizes an imported function for setting the fun fact of a profile
  const handleFunFactChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setFunFact(e.target.value);
  };

  // Loads and utilizes an imported function for setting a profile picture 
  const handleUploadPfp = (e : React.ChangeEvent<HTMLInputElement>) => {
    console.log('uploading pfp');

    const target = e.target as HTMLInputElement;
    if (target && target.files && target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(target.files[0]);
    }
  };

  // Utilizes an imported function for setting a customizable avatar as their profile image
  // const handleUseAvatar = () => {
  //   setProfileImage(avatarImage);
  // };

  // if the modal is not shown, return null
  if (!show) {
    return null;
  }

  // render the page
  return (
    <div className="signupProcess-background">
      <div className="signupProcess-modal">
        <div className="CompleteProfile">
          <h1 id="signupProcess-title">Complete Your Profile!</h1>
          <p id="signupProcess-subtitle">You can add more and edit later</p>

          <div id="completeProfile-input-container">
            <div id="profile-details">
              {/* Profile picture container */}
              <div id="profile-pic" style={{ width: 160, height: 160 }}>
                {/* image is profile image, if empty/null display avatar image */}
                <img src={profileImage ? profileImage : /*avatarImage*/ ''} alt="profile-pic" />
                {/* <img src={profileImage} alt="profile-pic" /> */}
              </div>
              <div className="profile-pic-option">
                {/* <button>Upload Picture</button> */}
                {/* input to upload picture */}
                <input
                  type="file"
                  id="upload-pfp"
                  accept="image/*"
                  hidden
                  onChange={handleUploadPfp}
                />
                <label htmlFor="upload-pfp">Upload Picture</label>

                {/* button to use avatar as profile picture */}
                {/* <button onClick={handleUseAvatar}>Use Avatar</button> */}
              </div>
            </div>
            
            {/* <div className="signup-fullname">
              <h2>
                {userInfo.firstName} {userInfo.lastName}{' '}
              </h2>

              <p>@{userInfo.username}</p>
            </div> */}

            {/* Pronouns */}
            <LabelInputBox
              label={"Add Pronouns"}
              inputType={"single"}
              maxLength={50}
              id="pronouns-input"
              value={pronouns}
              placeholder={"Pronouns"}
              onChange={handlePronounsChange}
              hideUnsaved={true}
            />

            {/* Slogan */}
            <LabelInputBox
              label={"Add Slogan"}
              inputType={"single"}
              maxLength={20}
              id="slogan-input"
              value={slogan}
              placeholder={"Slogan"}
              onChange={handleSloganChange}
              hideUnsaved={true}
            />

            {/* Phone Number */}
            <LabelInputBox
              label={"Add Phone Number"}
              inputType={"single"}
              maxLength={15}
              id="phoneNumber-input"
              value={phoneNumber}
              placeholder={"Phone Number"}
              onChange={handlePhoneNumberChange}
              hideUnsaved={true}
            />

            {/* Current Job Title */}
            <LabelInputBox
              label={"Add Job Title"}
              inputType={"single"}
              maxLength={30}
              id="jobTitle-input"
              value={currentJobTitle}
              placeholder={"Current Job Title"}
              onChange={handleCurrentJobTitleChange}
              hideUnsaved={true}
            />

            {/* Location */}
            <LabelInputBox
              label={"Add Location (Optional)"}
              inputType={"single"}
              maxLength={30}
              id="location-input"
              value={location}
              placeholder={"Location (Optional)"}
              onChange={handleLocationChange}
              hideUnsaved={true}
            />

            {/* Fun Fact */}
            <LabelInputBox
              label={"Add Fun Fact"}
              inputType={"single"}
              maxLength={30}
              id="funFact-input"
              value={funFact}
              placeholder={"Fun Fact"}
              onChange={handleFunFactChange}
              hideUnsaved={true}
            />

            {/* Academic Year */}
            <div id="academicYear-input">
              <Select>
              <SelectButton 
              placeholder='Academic Year'
              type={"input"}
              />
            </Select>
            </div>

            {/* Major */}
            <div id="major-input">
              <Select>
              <SelectButton 
              placeholder='Major'
              type={"input"}
              />
            </Select>
            </div>

            {/* Bio */}
            <LabelInputBox
              label={"Bio"}
              inputType={"multi"}
              maxLength={100}
              id="bio-input"
              placeholder={"Bio"}
              onChange={handleBioChange}
              value={bio}
              hideUnsaved={true}
            />
          </div>
            {/* Skills */}
            <div id="signup-profile-skill">
              {selectedSkills.map((skill, index) => (
                <div key={index} style={{ border: `2px solid ${tagColors[index % 5]}` }}>
                  {skill.label}
                </div>
              ))}
            </div>
          <div id="signupProcess-btns">
            <button id="signup-backBtn" onClick={onBack}>
              Back
            </button>
            <button id="signup-nextBtn" onClick={onNext}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
