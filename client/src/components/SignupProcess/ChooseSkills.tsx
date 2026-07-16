import { MouseEventHandler, useState, useMemo, useCallback, Fragment, Key } from "react";
import { SearchBar } from "../SearchBar";
import { getSkills } from "../../api/users";
import { Skill } from "@looking-for-group/shared";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTag } from "../ProjectCreatorEditor/tabs/SortableItem";
import TagDisplay from "../TagDisplay";

const skillTabs = ["Developer", "Designer", "Soft", "Audio", "Engineer"];

// Category color for each skill tab, matching the tag/filter-tab colors.
const skillTabColors: Record<string, string> = {
	Developer: "yellow",
	Designer: "red",
	Design: "red",
	Soft: "purple",
	Audio: "periwinkle",
	Engineer: "cyan",
};

// list of skills to choose from
// technologies, arts, tools, and soft skills
// pulled from the database

interface ChooseSkillsProps {
	show: boolean;
	onNext: MouseEventHandler<HTMLButtonElement>;
	onBack: MouseEventHandler<HTMLButtonElement>;
	selectedSkills: Skill[];
	setSelectedSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
	selectedSkillIds: number[];
	setSelectedSkillIds: React.Dispatch<React.SetStateAction<number[]>>;
	mode: string;
}

/**
 * This component allows the user to toggle skills to be added to their profile.
 * They can be added or deleted from the player’s current skills with a maximum of 5.
 * @param show Determines if the modal is visible
 * @param onNext Callback for next button
 * @param onBack Callback for back button
 * @param selectedSkills List of skills currently selected by the user
 * @param mode Whether the page is in “sign up” mode or “edit profile” mode
 * @returns render of the part of the profile page which displays the user’s skills.
 */
const ChooseSkills: React.FC<ChooseSkillsProps> = ({
	show,
	onNext,
	onBack,
	selectedSkills,
	setSelectedSkills,
	selectedSkillIds,
	setSelectedSkillIds,
	mode
}) => {
	// States
	const [allSkills, setAllSkills] = useState<Skill[]>([]);
	// Tracks which tab we are currently on
	const [currentSkillsTab, setCurrentSkillsTab] = useState(0);
	// filtered results from skill search bar
	const [searchedSkills, setSearchedSkills] = useState<Skill[]>([]);

	const [searchValue, setSearchValue] = useState("");

	mode;
	/**
	 * Updates the searchedTags stat based on search results from the SearchBar.
	 * If no results, resets to showing all tags in the current tab.
	 */
	const handleSearch = useCallback((results: Skill[][]) => {
		// setSearchResults(results);
		// show no results
		if (!results || results.length === 0 || results[0].length === 0) {
			setSearchedSkills([]);
		} else {
			setSearchedSkills(results[0]);
		}
	}, []);

	// load skills
	useMemo(() => {
		const fetchSkills = async () => {
			const response = await getSkills();

			if (response.data === undefined || !response.data) {
				return;
			}
			setAllSkills(response.data);
		};
		if (allSkills.length === 0) {
			fetchSkills();
		}
	}, []);

	/**
	* Finds if a skill is present on the project
	* @returns string of status: "selected" or "unselected."
	*/
	const isSkillSelected = (id: number) => {
		if (selectedSkills?.some((skill) => skill.skillId === id)) return "selected";
		return "unselected";
	}

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);
	/**
	* Reorders the selected tags when a drag finishes.
	* Note: tag order is only kept for this edit session — the backend has no
	* tag-position column, so the order resets to the server's order on reload.
	* @param e Drag end event with the active (dragged) and over (target) tag ids.
	*/
	const handleDragEnd = (e: DragEndEvent) => {
		const { active, over } = e;
		if (!over || active.id === over.id) return;

		const oldIndex = selectedSkills?.findIndex((s) => s.skillId === Number(active.id));
		const newIndex = selectedSkills?.findIndex((s) => s.skillId === Number(over.id));
		if (oldIndex === -1 || newIndex === -1) return;

		const reorderedSkills = arrayMove([...selectedSkills as Skill[]], oldIndex as number, newIndex as number).map(
			(skill, index) => ({
				...skill,
				position: index,
			})
		);

		setSelectedSkills(reorderedSkills);
	};
	/**
	* Toggles a skill as selected or unselected
	*/
	const handleSkillToggle = useCallback(
		(skillId: number) => {
			const isSelected = isSkillSelected(skillId) === "selected";

			const skillToToggle = allSkills?.find((potentialMatch) => potentialMatch.skillId === skillId);

			if (!skillToToggle) return;

			if (isSelected) {
				setSelectedSkills(selectedSkills.filter((s) =>
					s.skillId !== skillToToggle.skillId
				));
				setSelectedSkillIds(selectedSkillIds.filter((s) =>
					s !== skillToToggle.skillId
				));
			}
			else {
				setSelectedSkills([
					...selectedSkills,
					skillToToggle
				]);
				setSelectedSkillIds([
					...selectedSkillIds,
					skillToToggle.skillId
				]);
			}
		}
		, [isSkillSelected, selectedSkills]);

	// Components
	/**
	 * Renders the tab buttons to switch between three skills: Developer, Design, and Soft skills
	 * @returns JSX Element
	 */
	const SkillSearchTabs = () => {
		const tabs = skillTabs.map((skill, i) => {
			return (
				<button
					key={skill as Key}
					type="button"
					onClick={() => setCurrentSkillsTab(i)}
					className={`button-reset project-editor-tag-search-tab filter-tab-${skillTabColors[skill as string] ?? "grey"} ${currentSkillsTab === i ? "tag-search-tab-active" : ""}`}
				>
					{skill}
				</button>
			);
		});
		return <div id="project-editor-tag-search-tabs">{tabs}</div>;
	};

	// if the modal is not shown, return null
	if (!show) {
		return null;
	}

	// render the page
	return (
		<div className="signupProcess-background">
			<div className="signupProcess-modal">
				<div className="ChooseSkills">
					<h1 id="signupProcess-title">
						Choose <span id="signupProcess-title-highlight">At Least</span> 3 Skills
					</h1>
					<p id="signupProcess-subTitle">You can edit them later</p>
					<div id="profile-editor-tags">
						<div id="project-editor-selected-tags">
							<div className="project-editor-section-header">
								Selected Skills
							</div>
							<div className="project-editor-extra-info">
								Drag and drop to reorder
							</div>
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={selectedSkills.map((t) => t.skillId)}
									strategy={verticalListSortingStrategy}
								>
									<div id="project-editor-selected-tags-container">
										{selectedSkills.map((skill) => (
											<Fragment key={skill.skillId}>
												<SortableTag
													id={skill.skillId}
													tag={skill}
													onRemove={handleSkillToggle}
												/>
											</Fragment>
										))}
									</div>
								</SortableContext>
							</DndContext>
							<button
								type="button"
								hidden={selectedSkills.length === 0}
								className="delete-tags-btn"
								onClick={() => {
									setSelectedSkills([]);
									setSelectedSkillIds([]);
								}}
								title="Remove all selected tags"
							>
								<i className="fa fa-trash" style={{ color: '#ff4d4f' }} />
							</button>
						</div>
						<div id="project-editor-tag-search">
							<SearchBar
								key={currentSkillsTab}
								dataSets={[{ data: allSkills }]}
								onSearch={(results) =>
									handleSearch(results as Skill[][])
								}
								value={searchValue}
								setValue={setSearchValue}
								placeholderText='Search for Tag'
							/>
							<div id="project-editor-tag-wrapper">
								<SkillSearchTabs />
								<hr id="tag-search-divider" />
							</div>
							<div id="project-editor-tag-search-container">
								<TagDisplay
									selected={selectedSkills.map(
										skill => ({
											...skill,
											id: skill.skillId
										})
									)}
									toggleTag={handleSkillToggle}
									tabs={skillTabs}
									tabId={currentSkillsTab}
									all={allSkills.map(
										skill => ({
											...skill,
											id: skill.skillId
										})
									)}
									searchValue={searchValue}
									searchData={searchedSkills.map(
										skill => ({
											...skill,
											id: skill.skillId
										})
									)}
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
							// disable the next button if the user has not selected 3 skills
							// this is to prevent the user from moving to the next modal without selecting 
							// the required number of skills
							// the user can only move to the next modal when they have selected 3 skills
							disabled={selectedSkills.length < 3}>
							<svg width="70" height="25" id="next" className="color-fill scale-on-hover" aria-label="next"><use href="/assets/icons.svg#next"></use></svg>

						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChooseSkills;
