import { MouseEventHandler } from 'react';

interface CompleteProfileProps {
  show : boolean;
  onNext : MouseEventHandler<HTMLButtonElement>;
  onBack : MouseEventHandler<HTMLButtonElement>;
  userInfo : {
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    password: string,
    // proficiencies: selectedProficiencies,
    skills: string[],
    // interests: selectedInterests,
    pronouns: string,
    bio: string,
    // avatarImage: avatarImage,
    profileImage: any, // if they upload their own image
  };
  bio : string;
  pronouns : string;
  setBio : React.Dispatch<React.SetStateAction<string>>;
  setPronouns : React.Dispatch<React.SetStateAction<string>>;
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
  bio,
  pronouns,
  setBio,
  setPronouns,
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
          <h1 id="signupProcess-title">Complete Your Profile</h1>
          <p>You can add more and edit later</p>

          <div id="profile-details">
            <div className="row">
              <div className="column">
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

              <div className="name-username-pronouns-container">
                <div className="signup-fullname">
                  {/* First and Last Name */}
                  <h2>
                    {userInfo.firstName} {userInfo.lastName}{' '}
                  </h2>

                  {/* Username */}
                  <p>@{userInfo.username}</p>
                </div>

                {/* Pronouns */}
                <input
                  id="pronouns-input"
                  type="text"
                  autoComplete="off"
                  placeholder="Add Pronouns"
                  onChange={handlePronounsChange}
                  value={pronouns}
                />
              </div>
            </div>

            {/* Input Box for Bio */}
            <textarea
              id="bio-input"
              autoComplete="off"
              placeholder="Add A Bio"
              onChange={handleBioChange}
              value={bio}
            ></textarea>

            {/* Skills */}
            <div id="signup-profile-skill">
              {userInfo.skills.map((skill, index) => (
                <div key={index} style={{ border: `2px solid ${tagColors[index % 5]}` }}>
                  {skill}
                </div>
              ))}
            </div>
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
