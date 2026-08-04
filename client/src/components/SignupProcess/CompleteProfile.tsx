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
// import placeholder from "../../images/lfrog.png";
//why do these 2 things have the same name??
import { RitStatus as RitStatuses, } from "@looking-for-group/shared/enums";
import { ProfileImageUploader } from "../ImageUploader";
// import arrow from '../../../public/images/icons/s-arrow.png';


interface CompleteProfileProps {
	show: boolean;
	onNext: MouseEventHandler<HTMLButtonElement>;
	onBack: MouseEventHandler<HTMLButtonElement>;
	userInfo: CreateUserInput;
	selectedSkills: Skill[];
	bio: string;
	pronouns: string;
	headline: string;
	phoneNumber: string;
	title: string;
	location: string;
	funFact: string;
	major: Major[];
	ritStatus: RitStatus | undefined;
	setBio: React.Dispatch<React.SetStateAction<string>>;
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
 * @param pronouns user pronouns
 * @param headline user headline
 * @param phoneNumber user phone number
 * @param title user current job title
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
const CompleteProfile: React.FC<CompleteProfileProps> = ({
	show,
	onNext,
	onBack,
	// avatarImage,
	// userInfo,
	// selectedSkills,
	bio,
	pronouns,
	headline,
	phoneNumber,
	title,
	location,
	// funFact,
	major,
	profileImage,
	ritStatus,
	setBio,
	setHeadline,
	setPhoneNumber,
	setTitle,
	setLocation,
	// setFunFact,
	setMajor,
	setRitStatus,
	setPronouns,
	setProfileImage
}) => {

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
		if (file.size > 1000000) {
			setError("File too large (max: 1mb)");
			return;
		}
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

	//Returns either "Major" or "Major (Required)" depending on the user selected factulty as their role
	const majorRequired = () => {
		if (ritStatus === "Faculty" || ritStatus === "Staff") {
			return "Major";
		}

		return "Major (Required)";
	}

	//disabled={!(major.length > 0 && ritStatus && validPhoneNum)}>
	//False = enabled
	const nextButtonDisabled = () => {
		//Not 1 if since the conditions are different
		if ((ritStatus === "Faculty" || ritStatus === "Staff") && validPhoneNum) {
			return false;
		} else if (major.length > 0 && ritStatus && validPhoneNum) {
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
						You can edit and add more later in your profile page
					</p>

					<div className="error">{errorMsg}</div>

					<div id="completeProfile-input-container">
						<div id="completeProfile-input-section-1">
							<div
								id="complete-profile-add-image"
								className="edit-profile-image">
								<p id="profile-image-label">Profile Image</p>
								<ProfileImageUploader
									onFileSelected={handleUploadPfp}
									initialImageFile={profileImage}
								/>
							</div>

							<div id="complete-profile-row-1">

								{/* Pronouns */}
								<LabelInputBox
									label={"Pronouns"}
									inputType={"single"}
									maxLength={20}
									id="pronouns-input"
									value={pronouns}
									placeholder={"Pronouns"}
									onChange={(e) => setPronouns(e.target.value)}
									hideUnsaved={true}
								/>

								{/* Current Job Title */}
								<div id="jobTitle-input">
									<div className="dropdown-label">Job Title</div>
									<Select>
										<SelectButton
											placeholder={"Job Title"}
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
							</div>

							<div id="complete-profile-row-2">
								{/* RIT Status */}
								{/*TODO: fix styling on this, the text is at the top of the box and you can't see any of the dropdown*/}
								<div id="ritStatus-input">
									<div className="dropdown-label">RIT Status <span className="required-asterisk">{majorAsterisk()}</span></div>
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
								</div>

								{/* Major */}
								<div id="major-input">
									<div className="dropdown-label">Major <span className="required-asterisk">{majorAsterisk()}</span></div>
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
								</div>
							</div>

							<div id="complete-profile-row-3">

								{/* Phone Number */}
								<LabelInputBox
									label={"Phone Number"}
									inputType={"single"}
									maxLength={15}
									id="phoneNumber-input"
									value={phoneNumber}
									placeholder={"Phone Number"}
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

								{/* Location */}
								<LabelInputBox
									label={"Location"}
									inputType={"single"}
									maxLength={50}
									id="location-input"
									value={location}
									placeholder={"Location"}
									onChange={(e) => setLocation(e.target.value)}
									hideUnsaved={true}
								/>
							</div>
							{/* <div className="signup-fullname">
							<h2>
								{userInfo.firstName} {userInfo.lastName}{' '}
							</h2>

							<p>@{userInfo.username}</p>
							</div> */}

						</div>
						{/* Fun Fact
						<LabelInputBox
							label={"Add Fun Fact"}
							inputType={"single"}
							maxLength={50}
							id="funFact-input"
							value={funFact}
							placeholder={"Fun Fact (Optional)"}
							onChange={(e) => setFunFact(e.target.value)}
							hideUnsaved={true}
						/> */}

						<div id="completeProfile-input-section-2">
							<div id="completeProfile-personal-quote">
								{/* Personal Quote */}
								<LabelInputBox
									label={"Personal Quote"}
									labelInfo="Write a fun and catchy phrase that captures your unique personality!"
									inputType={"multi"}
									maxLength={100}
									id="headline-input"
									// placeholder={"Personal Quote"}
									onChange={(e) => setHeadline(e.target.value)}
									value={headline}
									hideUnsaved={true}
								/>
							</div>
							<div id="completeProfile-bio">
								{/* Bio */}
								<LabelInputBox
									label={"Bio"}
									labelInfo="Share a brief overview of who you are, your interests, and what drives you!"
									inputType={"multi"}
									maxLength={600}
									id="bio-input"
									// placeholder={"Bio"}
									onChange={(e) => setBio(e.target.value)}
									value={bio}
									hideUnsaved={true}
								/>
							</div>
						</div>



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
