/*
  This class is copied from skillsTab in the ProjectCreatorEditor tabs
  Currently, this tab does not work
  Feel free to replace this entire file, or try and debug the code
  */
import { useState, useEffect, useMemo, useCallback } from "react";
import { SearchBar } from "../../SearchBar";
import { getSkills } from "../../../api/users";
import {
  MySkill,
  Skill,
} from "@looking-for-group/shared";
import { userDataManager } from "../../../api/data-managers/user-data-manager";
import { PendingUserProfile } from "../../../../types/types";

const skillTabs = ["Developer Skills", "Design Skills", "Soft Skills"];

/**
 * Handles coloring skills according to their type.
 * @param type The type of skill: Developer, Designer, or Soft skill.
 * @returns String of the color the type corresponds to.
 */
const getSkillColor = (type: string) => {
  // Returns the skille color based on what skill it is
  if (type === "Developer") {
    return "yellow";
  } else if (type === "Designer") {
    return "red";
  } else {
    // Soft Skill
    return "purple";
  }
};

interface SkillsTabProps {
  profile: PendingUserProfile;
  dataManager: Awaited<ReturnType<typeof userDataManager>>;
  updatePendingProfile: (profileData: PendingUserProfile) => void;
}

/**
 * Profile Skills Tab. Displays selected skill tags with drag and drop instructions.
 * Shows the search bar for filtering skills, category tabs, and the skill tag buttons.
 * @param dataManager Handles data changes to save changes later.
 * @param profile Temporary profile data.
 * @param updatePendingProfile Updates profile data.
 * @returns JSX Element
 */
export const SkillsTab = ({
  dataManager,
  profile,
  updatePendingProfile,
}: SkillsTabProps) => {
  // States
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  // Tracks which tab we are currently on
  const [currentSkillsTab, setCurrentSkillsTab] = useState(0);
  // filtered results from skill search bar
  const [searchedSkills, setSearchedSkills] = useState<Skill[]>([]);

  // load skills
  useEffect(() => {
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
  }, [allSkills]);

  // Update skills shown for search bar
  const currentDataSet = useMemo(() => {
    switch (currentSkillsTab) {
      case 0:
        return [{ data: allSkills.filter((s) => s.type === "Developer") }];
      case 1:
        return [{ data: allSkills.filter((s) => s.type === "Designer") }];
      case 2:
        return [{ data: allSkills.filter((s) => s.type === "Soft") }];
      default:
        return [{ data: [] }];
    }
  }, [currentSkillsTab, allSkills]);

  // Reset skill list on tab change to default list
  useEffect(() => {
    const defaultSkills = currentDataSet[0]?.data ?? [];
    setSearchedSkills(defaultSkills);
  }, [currentSkillsTab, currentDataSet]);

  /**
   * Finds if a skill is present on the project
   * @returns string of status: "selected" or "unselected."
   */
  const isSkillSelected = useCallback(
    (id: number) => {
      const skills: MySkill[] = profile.skills;

      if (skills.some((skill) => skill.skillId === id)) return "selected";
      return "unselected";
    },
    [profile]
  );

  // TODO delete this function
  // const handleSkillSelect = useCallback(
  //   (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //     // prevent page from immediately re-rendering

  //     // trim whitespace to get skill name
  //     // take closest button to allow click on icon
  //     const button = e.currentTarget;
  //     const skill: string = button.innerText.trim();

  //     // if skill is unselected
  //     if (button.className.includes("unselected")) {
  //       // get skill id and type according to type of skill
  //       let id: number = -1;
  //       let type: SkillType = "Developer";

  //       if (button.className.includes("yellow")) {
  //         // developer skills
  //         id =
  //           allSkills.find((s) => s.type === "Developer" && s.label === skill)
  //             ?.skillId ?? -1;
  //         type = "Developer";
  //       } else if (button.className.includes("red")) {
  //         // designer skills
  //         id =
  //           allSkills.find((s) => s.type === "Designer" && s.label === skill)
  //             ?.skillId ?? -1;
  //         type = "Designer";
  //       } else if (button.className.includes("purple")) {
  //         // soft skills
  //         id =
  //           allSkills.find((s) => s.type === "Soft" && s.label === skill)
  //             ?.skillId ?? -1;
  //         type = "Soft";
  //       }

  //       // error check: no skill found
  //       if (id === -1) {
  //         return;
  //       }
  //       //we have to implement proficiency

  //       // Update selected skills with new ones
  //       setProfile((prev) => ({
  //         ...prev,
  //         skills: [
  //           ...(prev.skills ?? []),
  //           {
  //             skillId: id,
  //             type: type,
  //             label: skill,
  //             position: 0, //this isn't over, position parameter.
  //             proficiency: "Novice" as SkillProficiency, //we'll get to this later
  //             apiUrl: "",
  //           },
  //         ],
  //       }));
  //     }
  //     // if skill is selected
  //     else {
  //       // remove skill from project
  //       setProfile((prev) => ({
  //         ...prev,
  //         skills: (prev.skills ?? []).filter((s) => s.label !== skill),
  //       }));
  //     }
  //   },
  //   [allSkills, profile]
  // );

  /**
   * Toggles a skill as selected or unselected
   */
  const handleSkillToggle = useCallback(
    (skillId: number) => {
      const isSelected = isSkillSelected(skillId) === "selected";
      const skillToToggle = allSkills.find(
        (potentialMatch) => potentialMatch.skillId === skillId
      );
      if (!skillToToggle) return;

      if (isSelected) {
        dataManager.deleteSkill({
          id: {
            type: "canon",
            value: skillId,
          },
          data: null,
        });

        updatePendingProfile({
          ...profile,
          skills: [
            ...profile.skills.filter((skill) => skill.skillId !== skillId),
          ],
        });
      } else {
        dataManager.addSkill({
          id: {
            type: "canon",
            value: skillId,
          },
          data: {
            skillId,
            position: 0,
            proficiency: "Novice", // TODO add proficiency
          },
        });

        updatePendingProfile({
          ...profile,
          skills: [
            ...profile.skills.filter((skill) => skill.skillId !== skillId), // i dunno just in case
            {
              ...skillToToggle,
              apiUrl: "",
              proficiency: "Novice",
              position: 0,
            },
          ],
        });
      }
    },
    [allSkills, dataManager, isSkillSelected, profile, updatePendingProfile]
  );

  /**
   * Renders selected profile skills.
   * @returns JSX Element
   */
  const loadProfileSkills = useMemo(() => {
    if (!profile?.skills) return [];

    return profile.skills.map((skill) => (
      <button
        key={skill.label}
        className={`tag-button tag-button-${getSkillColor(skill.type)}-selected`}
        onClick={() => handleSkillToggle(skill.skillId)}
        type="button"
      >
        <i className="fa fa-close"></i>
        <p>&nbsp;{skill.label}</p>
      </button>
    ));
  }, [profile.skills, handleSkillToggle]);

  /**
   * Renders skill tags as clickable buttons based on the active tab and search results.
   * Each tag button shows a plus or lose icon depending on selection status and is colored based on skill type.
   * @returns JSX Element
   */
  const renderSkills = useCallback(() => {
    // no search item, render all skills
    if (searchedSkills && searchedSkills.length !== 0) {
      return searchedSkills.map((skill) => (
        <button
          key={skill.skillId}
          className={`tag-button tag-button-${getSkillColor(skill.type)}-${isSkillSelected(
            skill.skillId
          )}`}
          onClick={() => handleSkillToggle(skill.skillId)}
          type="button"
        >
          <i
            className={
              isSkillSelected(skill.skillId) === "selected"
                ? "fa fa-close"
                : "fa fa-plus"
            }
          ></i>
          <p>&nbsp;{skill.label}</p>
        </button>
      ));
    } else if (searchedSkills && searchedSkills.length === 0) {
      return <div className="no-results-message">No results found!</div>;
    }
    // Developer Skill
    if (currentSkillsTab === 0) {
      return allSkills
        .filter((anySkill) => anySkill.type === "Developer")
        .map((developerSkill) => (
          <button
            key={developerSkill.skillId}
            className={`tag-button tag-button-yellow-${isSkillSelected(developerSkill.skillId)}`}
            onClick={() => handleSkillToggle(developerSkill.skillId)}
            type="button"
          >
            <i
              className={
                isSkillSelected(developerSkill.skillId) === "selected"
                  ? "fa fa-close"
                  : "fa fa-plus"
              }
            ></i>
            &nbsp;{developerSkill.label}
          </button>
        ));
    } else if (currentSkillsTab === 1) {
      return allSkills
        .filter((anySkill) => anySkill.type === "Designer")
        .map((designerSkill) => (
          <button
            key={designerSkill.skillId}
            className={`tag-button tag-button-red-${isSkillSelected(designerSkill.skillId)}`}
            onClick={() => handleSkillToggle(designerSkill.skillId)}
            type="button"
          >
            <i
              className={
                isSkillSelected(designerSkill.skillId) === "selected"
                  ? "fa fa-close"
                  : "fa fa-plus"
              }
            ></i>
            &nbsp;{designerSkill.label}
          </button>
        ));
    } else {
      return allSkills
        .filter((anySkill) => anySkill.type === "Soft")
        .map((softSkill) => (
          <button
            key={softSkill.skillId}
            className={`tag-button tag-button-purple-${isSkillSelected(softSkill.skillId)}`}
            onClick={() => handleSkillToggle(softSkill.skillId)}
            type="button"
          >
            <i
              className={
                isSkillSelected(softSkill.skillId) === "selected"
                  ? "fa fa-close"
                  : "fa fa-plus"
              }
            ></i>
            <p>&nbsp;{softSkill.label}</p>
          </button>
        ));
    }
  }, [
    searchedSkills,
    currentSkillsTab,
    isSkillSelected,
    handleSkillToggle,
    allSkills,
  ]);

  /**
   * Updates the searchedTags stat based on search results from the SearchBar.
   * If no results, resets to showing all tags in the current tab.
   */
  const handleSearch = useCallback((results: Skill[][]) => {
    // setSearchResults(results);
    console.log("handling search");
    console.log("results", results);
    // show no results
    if (!results || results.length === 0 || results[0].length === 0) {
      console.log("no results or current data set");
      setSearchedSkills([]);
    } else {
      setSearchedSkills(results[0]);
    }
  }, []);

  // Components
  /**
   * Renders the tab buttons to switch between three skills: Developer, Design, and Soft skills
   * @returns JSX Element
   */
  const SkillSearchTabs = () => {
    const tabs = skillTabs.map((skill, i) => {
      return (
        <button
          key={skill}
          type="button"
          onClick={() => setCurrentSkillsTab(i)}
          className={`button-reset project-editor-tag-search-tab ${currentSkillsTab === i ? "tag-search-tab-active" : ""}`}
        >
          {skill}
        </button>
      );
    });
    return <div id="project-editor-tag-search-tabs">{tabs}</div>;
  };

  return (
    <div id="profile-editor-tags">
      <div id="project-editor-selected-tags">
        <div className="project-editor-section-header">Selected Skills</div>
        <div className="project-editor-extra-info">
          Drag and drop to reorder
        </div>
        <div id="project-editor-selected-tags-container">
          {/* TODO: Separate top 2 skills from others with hr element, see Project editor links tab for implementation */}
          {loadProfileSkills}
        </div>
      </div>

      <div id="project-editor-tag-search">
        <SearchBar
          key={currentSkillsTab}
          dataSets={currentDataSet}
          onSearch={(results) =>
            handleSearch(results as unknown[][] as Skill[][])
          }
        />
        <div id="project-editor-tag-wrapper">
          <SkillSearchTabs />
          <hr id="tag-search-divider" />
        </div>
        <div id="project-editor-tag-search-container">{renderSkills()}</div>
      </div>
    </div>
  );
};
