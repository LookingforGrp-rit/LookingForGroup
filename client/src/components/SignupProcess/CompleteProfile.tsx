import {
	CreateUserInput,
	Major,
	Skill,
	RitStatus,
	Role
} from "@looking-for-group/shared";
import { MouseEventHandler, useMemo, useState } from "react";
import LabelInputBox from "../LabelInputBox";
import { Select, SelectButton, SelectOptions } from "../Select";
import { getMajors, getJobTitles } from "../../api/users";
import placeholder from "../../images/lfrog.png";
//why do these 2 things have the same name??
import { RitStatus as RitStatuses, } from "@looking-for-group/shared/enums";
import { ProfileImageUploader } from "../ImageUploader";
import arrow from '../../../public/images/icons/s-arrow.png';


interface CompleteProfileProps {
	show: boolean;
	onNext: MouseEventHandler<HTMLButtonElement>;
	onBack: MouseEventHandler<HTMLButtonElement>;
	userInfo: CreateUserInput;
	selectedSkills: Skill[];
	bio: string;
	preferredName: string;
	lastName: string;
	pronouns: string;
	headline: string;
	phoneNumber: string;
	title: string;
	location: string;
	funFact: string;
	major: Major[];
	ritStatus: RitStatus | undefined;
	setBio: React.Dispatch<React.SetStateAction<string>>;
	setPreferredName: React.Dispatch<React.SetStateAction<string>>;
	setLastName: React.Dispatch<React.SetStateAction<string>>;
	setPronouns: React.Dispatch<React.SetStateAction<string>>;
	setHeadline: React.Dispatch<React.SetStateAction<string>>;
	setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
	setTitle: React.Dispatch<React.SetStateAction<string>>;
	setLocation: React.Dispatch<React.SetStateAction<string>>;
	setFunFact: React.Dispatch<React.SetStateAction<string>>;
	setMajor: React.Dispatch<React.SetStateAction<Major[]>>;
	setRitStatus: React.Dispatch<
		React.SetStateAction<RitStatus | undefined>
	>;
	profileImage: File;
	setProfileImage: React.Dispatch<React.SetStateAction<File>>;
}

/**
 * This component renders on screen the ability to complete their profile
 * during the sign-up phase of creating their account.
 * @param show Determines if the modal is visible
 * @param onNext Callback for next button
 * @param onBack Callback for back button
 * @param userInfo user information
 * @param bio current user bio
 * @param preferredName user preferred name
 * @param lastName user last name
 * @param pronouns user pronouns
 * @param headline user headline/personal quote
 * @param phoneNumber user phone number
 * @param title user current job title
 * @param location user location
 * @param funFact user fun fact
 * @param major user major
 * @param mentorship user mentorship status
 * @param setBio set user bio
 * @param setPreferredName set user preferred Name
 * @param setLastName set user last Name
 * @param setPronouns set user pronouns
 * @param profileImage user profile image
 * @param setProfileImage set user profile image
 * @returns HTML - user can implement their bio, pronouns, profile image upload, button to use avatar,
 * and navigation buttons like “Back” and “Next”.
 */
const CompleteProfile: React.FC<CompleteProfileProps> = ({
	show,
	onNext,
	onBack,
	// avatarImage,
	userInfo,
	selectedSkills,
	preferredName,
	lastName,
	bio,
	pronouns,
	headline,
	phoneNumber,
	title,
	location,
	funFact,
	major,
	//mentorship,
	profileImage,
	ritStatus,
	setBio,
	setHeadline,
	setPhoneNumber,
	setTitle,
	setLocation,
	setFunFact,
	setMajor,
	setRitStatus,
	setPreferredName,
	setLastName,
	setPronouns,
	setProfileImage
}) => {
	// make each skill tag a different color
	// matches the colors in the design/background
	const tagColors = ["#9FACFF", "#97E5AB", "#99E6EA", "#F18067", "#239EF7"];

	const [allMajors, setAllMajors] = useState<Major[]>([]);
	const [roles, setRoles] = useState<Role[]>();

	const [displayImg, setDisplayImg] = useState<string>();

	const [errorMsg, setError] = useState('');

	const [validPhoneNum, setValidPhoneNum] = useState(true);

	useMemo(() => {
		const fetchMajors = async () => {
			const response = await getMajors();

			if (response.data === undefined || !response.data) {
				return;
			}
			setAllMajors(response.data);
		};
		const fetchRoles = async () => {
			const response = await getJobTitles();

			if (response.data === undefined || !response.data) {
				return;
			}
			setRoles(response.data);
		}
		if (allMajors.length === 0) {
			fetchMajors();
		}
		if (roles?.length === 0) {
			fetchRoles();
		}
	}, []);

	useMemo(() => {
		const fetchMajors = async () => {
			const res = await getMajors();
			if (res.data) setAllMajors(res.data);
		};
		const fetchRoles = async () => {
			const response = await getJobTitles();

			if (response.data) setRoles(response.data);
		}
		fetchMajors();
		fetchRoles();
	}, []);

	// Loads and utilizes an imported function for setting a profile picture
	const handleUploadPfp = (file: File) => {
		console.log("uploading pfp");
		const reader = new FileReader();
		reader.onload = (event) => {
			if (event.target && event.target.result) {
				setDisplayImg(event.target.result as string);
			}
		};
		setProfileImage(file);
		reader.readAsDataURL(file);
	};

	// Utilizes an imported function for setting a customizable avatar as their profile image
	// const handleUseAvatar = () => {
	//   setProfileImage(avatarImage);
	// };

	// if the modal is not shown, return null
	if (!show) {
		return null;
	}

	//Returns either "" or * depending on if the user selected faculty as their role
	const majorAsterisk = () => {
		if (ritStatus === "Faculty" || ritStatus === "Staff") {
			return "";
		}

		return "*";
	}

	//Returns either "Major (Optional)" or "Major (Required)" depending on the user selected factulty as their role
	const majorRequired = () => {
		if (ritStatus === "Faculty" || ritStatus === "Staff") {
			return "Major (Optional)";
		}

		return "Major (Required)";
	}

	//disabled={!(major.length > 0 && ritStatus && validPhoneNum)}>
	//False = enabled
	const nextButtonDisabled = () => {
		//Not 1 if since the conditions are different
		if ((ritStatus === "Faculty" || ritStatus === "Staff") && validPhoneNum) {
			return false;
		} else if (major.length > 0 && ritStatus && validPhoneNum && preferredName != "" && lastName != "") {
			return false;
		}

		return true;
	}

	// render the page
	return (
		<div className="signupProcess-background">
			<div className="signupProcess-modal" id="complete-profile-modal">
				<div className="CompleteProfile">
					<h1 id="signupProcess-title">Complete Your Profile!</h1>
					<p id="signupProcess-subTitle">
						You can add more and edit later
					</p>

					<div className="error">{errorMsg}</div>

					<div id="completeProfile-input-container">
						<div id="profile-details">
							<div
								id="profile-editor-add-image"
								className="edit-profile-image">
								<ProfileImageUploader
									onFileSelected={handleUploadPfp}
									initialImageFile={profileImage}
								/>
							</div>
						</div>

						{/* <div className="signup-fullname">
              <h2>
                {userInfo.firstName} {userInfo.lastName}{' '}
              </h2>

              <p>@{userInfo.username}</p>
            </div> */}

						{/* Preferred Name */}
						<div id="preferred-name-input">
							<LabelInputBox
								label={"Preferred Name (Required)"}
								required
								inputType={"single"}
								maxLength={50}
								value={preferredName}
								placeholder={"Preferred Name"}
								onChange={(e) => setPreferredName(e.target.value)}
								hideUnsaved={true}
							/>
							<div className="required-asterisk">*</div>
						</div>

						{/* Last Name */}
						<div id="last-name-input">
							<LabelInputBox
								label={"Last Name (Required)"}
								required
								inputType={"single"}
								maxLength={50}
								value={lastName}
								placeholder={"Last Name"}
								onChange={(e) => setLastName(e.target.value)}
								hideUnsaved={true}
							/>
							<div className="required-asterisk">*</div>
						</div>


						{/* Pronouns */}
						<LabelInputBox
							label={"Add Pronouns"}
							inputType={"single"}
							maxLength={20}
							id="pronouns-input"
							value={pronouns}
							placeholder={"Pronouns (Optional)"}
							onChange={(e) => setPronouns(e.target.value)}
							hideUnsaved={true}
						/>

						{/* Headline */}
						{/*<LabelInputBox
							label={"Add Headline"}
							inputType={"single"}
							maxLength={20}
							id="headline-input"
							value={headline}
							placeholder={"Headline (Optional)"}
							onChange={(e) => setHeadline(e.target.value)}
							hideUnsaved={true}
						/>*/}

						{/* Current Job Title */}
						<div id="jobTitle-input">
							<Select>
								<SelectButton
									placeholder={"Job Title (Optional)"}
									initialVal={title ?? ""}
									callback={(e) => e.preventDefault()}
									buttonId="jobTitle-input"
									type={"input"}
									searchable={true}
								/>
								<SelectOptions
									callback={(e) => {
										const newTitle = (
											e.target as HTMLButtonElement
										).value;

										setTitle(newTitle)
									}}
									options={(roles as Role[]).map((r) => ({
										value: r.label,
										markup: <>{r.label}</>,
										disabled: false
									}))}
								/>
							</Select>
						</div>

						{/* Major */}
						<div id="major-input">
							<Select>
								<SelectButton
									placeholder={majorRequired()}
									type={"input"}
									initialVal={major[0]?.label}
									searchable={true}
								/>
								<SelectOptions
									callback={(e) => {
										//praying this works so i can migrate it to users
										const maj = allMajors.find(
											(m) =>
												m.label ===
												(e.target as HTMLButtonElement)
													.value
										);
										if (maj) setMajor([maj]);
									}}
									options={allMajors.map((m) => ({
										value: m.label,
										markup: <>{m.label}</>,
										disabled: false
									}))}
								/>
							</Select>
							<div className="required-asterisk">{majorAsterisk()}</div>
						</div>

						{/* RIT Status */}
						{/*TODO: fix styling on this, the text is at the top of the box and you can't see any of the dropdown*/}
						<div id="ritStatus-input">
							<Select>
								<SelectButton
									placeholder="RIT Status (Required)"
									type={"input"}
									initialVal={ritStatus}
								/>
								<SelectOptions
									callback={(e) =>
										setRitStatus(
											(e.target as HTMLButtonElement)
												.value as RitStatus
										)
									}
									options={Object.keys(RitStatuses).map(
										(key) => {
											const val = RitStatuses[key as keyof typeof RitStatuses];
											return {
												value: key,
												markup: <>{val}</>,
												disabled: false
											};
										}
									)}
								/>
							</Select>
							<div className="required-asterisk">*</div>
						</div>

						{/* Location */}
						<LabelInputBox
							label={"Add Location"}
							inputType={"single"}
							maxLength={50}
							id="location-input"
							value={location}
							placeholder={"Location (Optional)"}
							onChange={(e) => setLocation(e.target.value)}
							hideUnsaved={true}
						/>

						{/* Mentorship Status */}
						<div id="mentorship-input">
							<Select>
								<SelectButton
									placeholder={"Mentorship Status (Optional)"}
									initialVal={title ?? ""}
									callback={(e) => e.preventDefault()}
									buttonId="mentorship-input"
									type={"input"}
									searchable={true}
								/>
								<SelectOptions
									callback={(e) => {
										/*
										const newTitle = (
											e.target as HTMLButtonElement
										).value;

										setTitle(newTitle)
										*/
										//CHANGE LATER
									}}
									options={[
										{
											value: "Not a mentor",
											markup: <>Not a mentor</>,
											disabled: false
										},
										{
											value: "Mentor",
											markup: <>Mentor</>,
											disabled: false
										}
									]}
								/>
							</Select>
						</div>

						{/* Phone Number */}
						<LabelInputBox
							label={"Add Phone Number"}
							inputType={"single"}
							maxLength={15}
							id="phoneNumber-input"
							value={phoneNumber}
							placeholder={"Phone Number (Optional)"}
							onChange={(e) => {
								const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
								if (e.target.value.length != 0 && !phoneRegex.test(e.target.value)) {
									setError('*Please enter a valid phone number.');
									setValidPhoneNum(false);
								} else {
									setError('');
									setValidPhoneNum(true);
								}
								setPhoneNumber(e.target.value);
							}}
							hideUnsaved={true}
						/>

						{/* Personal Quote */}
						<LabelInputBox
							label={"Add Personal Quote (Optional)"}
							inputType={"multi"}
							maxLength={100}
							id="personalQuote-input"
							placeholder={"Personal Quote (Optional)"}
							onChange={(e) => setHeadline(e.target.value)}
							value={headline}
							hideUnsaved={true}
						/>

						{/* Fun Fact */}
						<LabelInputBox
							label={"Add Fun Fact"}
							inputType={"multi"}
							maxLength={50}
							id="funFact-input"
							placeholder={"Fun Fact (Optional)"}
							onChange={(e) => setFunFact(e.target.value)}
							value={funFact}
							hideUnsaved={true}
						/>

						{/* Bio */}
						<LabelInputBox
							label={"Bio"}
							inputType={"multi"}
							maxLength={600}
							id="bio-input"
							placeholder={"About Me (Optional)"}
							onChange={(e) => setBio(e.target.value)}
							value={bio}
							hideUnsaved={true}
						/>
					</div>
					<div id="signupProcess-btns">
						<button id="signup-backBtn" onClick={onBack}>
							<svg width="70" height="25" id="back" className="color-fill scale-on-hover" aria-label="back"><use href="/assets/icons.svg#back"></use></svg>
						</button>
						<button
							id="signup-nextBtn"
							onClick={onNext}
							disabled={nextButtonDisabled()}>
							<svg width="70" height="25" id="next" className="color-fill scale-on-hover" aria-label="next"><use href="/assets/icons.svg#next"></use></svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CompleteProfile;
