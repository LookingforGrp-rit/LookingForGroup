import {
	CreateUserInput,
	Major,
	Skill,
	AcademicYear,
	Role
} from "@looking-for-group/shared";
import { MouseEventHandler, useMemo, useState } from "react";
import LabelInputBox from "../LabelInputBox";
import { Select, SelectButton, SelectOptions } from "../Select";
import { getMajors, getJobTitles } from "../../api/users";
import placeholder from "../../images/blue_frog.png";
//why do these 2 things have the same name??
import { AcademicYear as AcademicYears, } from "@looking-for-group/shared/enums";

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
	academicYear: AcademicYear | undefined;
	setBio: React.Dispatch<React.SetStateAction<string>>;
	setPronouns: React.Dispatch<React.SetStateAction<string>>;
	setHeadline: React.Dispatch<React.SetStateAction<string>>;
	setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
	setTitle: React.Dispatch<React.SetStateAction<string>>;
	setLocation: React.Dispatch<React.SetStateAction<string>>;
	setFunFact: React.Dispatch<React.SetStateAction<string>>;
	setMajor: React.Dispatch<React.SetStateAction<Major[]>>;
	setAcademicYear: React.Dispatch<
		React.SetStateAction<AcademicYear | undefined>
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
	userInfo,
	selectedSkills,
	bio,
	pronouns,
	headline,
	phoneNumber,
	title,
	location,
	funFact,
	major,
	profileImage,
	academicYear,
	setBio,
	setHeadline,
	setPhoneNumber,
	setTitle,
	setLocation,
	setFunFact,
	setMajor,
	setAcademicYear,
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
	const handleUploadPfp = (e: React.ChangeEvent<HTMLInputElement>) => {
		console.log("uploading pfp");

		const target = e.target as HTMLInputElement;
		if (target && target.files && target.files[0]) {
			const reader = new FileReader();
			reader.onload = (event) => {
				if (event.target && event.target.result) {
					setDisplayImg(event.target.result as string);
				}
			};
			setProfileImage(target.files[0]);
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
			<div className="signupProcess-modal" id="complete-profile-modal">
				<div className="CompleteProfile">
					<h1 id="signupProcess-title">Complete Your Profile!</h1>
					<p id="signupProcess-subTitle">
						You can add more and edit later
					</p>

					<div className="error">{errorMsg}</div>

					<div id="completeProfile-input-container">
						<div id="profile-details">
							{/* Profile picture container */}
							<div id="profile-pic">
								{/* image is profile image, if empty/null display avatar image */}
								<img
									src={displayImg ? displayImg : placeholder}
									alt="profile-pic"
								/>
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
								<label htmlFor="upload-pfp">
									Upload Picture
								</label>

								{/* button to use avatar as profile picture */}
								{
									<button
										onClick={() =>
											setDisplayImg(placeholder)
										}>
										Use Avatar
									</button>
								}
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
							maxLength={20}
							id="pronouns-input"
							value={pronouns}
							placeholder={"Pronouns"}
							onChange={(e) => setPronouns(e.target.value)}
							hideUnsaved={true}
						/>

						{/* Headline */}
						<LabelInputBox
							label={"Add Headline"}
							inputType={"single"}
							maxLength={20}
							id="headline-input"
							value={headline}
							placeholder={"Headline"}
							onChange={(e) => setHeadline(e.target.value)}
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

						{/* Current Job Title */}
						<div id="jobTitle-input">
							<Select>
								<SelectButton
									placeholder={"Add a Job Title"}
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

						{/* Location */}
						<LabelInputBox
							label={"Add Location (Optional)"}
							inputType={"single"}
							maxLength={50}
							id="location-input"
							value={location}
							placeholder={"Location (Optional)"}
							onChange={(e) => setLocation(e.target.value)}
							hideUnsaved={true}
						/>

						{/* Fun Fact */}
						<LabelInputBox
							label={"Add Fun Fact"}
							inputType={"single"}
							maxLength={50}
							id="funFact-input"
							value={funFact}
							placeholder={"Fun Fact"}
							onChange={(e) => setFunFact(e.target.value)}
							hideUnsaved={true}
						/>

						{/* Academic Year */}
						{/*TODO: fix styling on this, the text is at the top of the box and you can't see any of the dropdown*/}
						<div id="academicYear-input">
							<Select>
								<SelectButton
									placeholder="Academic Year (required)"
									type={"input"}
									initialVal={academicYear}
								/>
								<SelectOptions
									callback={(e) =>
										setAcademicYear(
											(e.target as HTMLButtonElement)
												.value as AcademicYear
										)
									}
									options={Object.values(AcademicYears).map(
										(yr) => {
											return {
												value: yr,
												markup: <>{yr}</>,
												disabled: false
											};
										}
									)}
								/>
							</Select>
						</div>

						{/* Major */}
						<div id="major-input">
							<Select>
								<SelectButton
									placeholder="Major (required)"
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

						{/* Bio */}
						<LabelInputBox
							label={"Bio"}
							inputType={"multi"}
							maxLength={100}
							id="bio-input"
							placeholder={"Bio"}
							onChange={(e) => setBio(e.target.value)}
							value={bio}
							hideUnsaved={true}
						/>
					</div>
					<div id="signupProcess-btns">
						<button id="signup-backBtn" onClick={onBack}>
							Back
						</button>
						<button
							id="signup-nextBtn"
							onClick={onNext}
							disabled={!(major.length > 0 && academicYear && validPhoneNum)}>
							Next
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CompleteProfile;
