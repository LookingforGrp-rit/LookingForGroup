import { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import { SearchBar } from "../../SearchBar";
import { getSkills } from "../../../api/users";
import { Tag } from "../../Tag";
import { Skill, JobSkill, SkillType, ProjectJob } from "@looking-for-group/shared";
import { Fillable, Pending } from "../../../../types/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTag } from "./SortableItem";
import { clampDragWithinContainer } from "./dragModifiers";

const skillTabs = ["Developer", "Designer", "Soft", "Audio", "Engineer"];

interface JobSkillPopupProps {
  job: ProjectJob | Fillable<Pending<ProjectJob>>,
  updateJob: React.Dispatch<React.SetStateAction<ProjectJob | Fillable<Pending<ProjectJob>> | undefined>>,
}

/**
 * Job skills popup. Displays selected skill tags with drag and drop instructions.
 * Shows the search bar for filtering skills, category tabs, and the skill tag buttons.
 * @param dataManager Handles data changes to save changes later.
 * @param project Temporary project data.
 * @param updatePendingProject Updates project data.
 * @param unmodifiedProject A copy of the profile before any changes
 * @returns JSX Element
 */
export const JobSkillPopup = ({
  job,
  updateJob,
}: JobSkillPopupProps) => {
  //editing a copy, rather than the original variable
  let modifiedJob = job;

  const skillLimit = 5;
  //the limit imposer (not used as you can see)

  //i need to refresh the skills selection whenever a new job is created
  //it does refresh when an existing skill is selected so that works as intended
  //but between like skill creation and selection it should reset to no skills selected
  //so how would i do that...
  //well i should find where it's reset right

  // States
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  // Tracks which tab we are currently on
  const [currentSkillsTab, setCurrentSkillsTab] = useState(0);
  // filtered results from skill search bar
  const [searchedSkills, setSearchedSkills] = useState<Skill[]>([]);
  // currently selected skills
  //const [selectedSkills, setSelectedSkills] = useState<JobSkill[]>([]);

  /* ONLY used for the deleting tags button. This is needed to re-render
    the selected skills section when reseting tags */
  const [skills, setSkills] = useState<Skill[]>();


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

  // Update skills shown for search bar
  const currentDataSet = useMemo(() => {
    switch (currentSkillsTab) {
      case 0:
        return [{ data: allSkills.filter((s) => s.type === "Developer") }];
      case 1:
        return [{ data: allSkills.filter((s) => s.type === "Designer") }];
      case 2:
        return [{ data: allSkills.filter((s) => s.type === "Soft") }];
      case 3:
        return [{ data: allSkills.filter((s) => s.type === "Audio") }];
      case 4:
        return [{ data: allSkills.filter((s) => s.type === "Engineer") }];
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
  const isSkillSelected = useCallback((id: number) => {
    const skills: JobSkill[] = job.jobSkills as JobSkill[];

    if (skills?.some((skill) => skill.skillId === id)) return "selected";
    return "unselected";
  }, [job.jobSkills])

  // Drag-and-drop sensors for the sortable selected-tags list.
  // Pointer for mouse/touch, Keyboard for accessible reordering.
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

    const skills = (job.jobSkills as JobSkill[]);
    const oldIndex = skills.findIndex((s) => s.skillId === Number(active.id));
    const newIndex = skills.findIndex((s) => s.skillId === Number(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedSkills = arrayMove([...skills], oldIndex, newIndex).map(
      (skill, index) => ({
        ...skill,
        position: index,
      })
    );

    modifiedJob = {
      ...modifiedJob,
      jobSkills: reorderedSkills
    };

    updateJob(modifiedJob);
  };

  /**
   * Toggles a skill as selected or unselected
   */
  //limit imposer goes here maybe?
  const handleSkillToggle = useCallback(
    (skillId: number) => {
      const isSelected = isSkillSelected(skillId) === "selected";

      const skillToToggle = allSkills.find((potentialMatch) => potentialMatch.skillId === skillId);

      if (!skillToToggle) return;

      if (isSelected) {
        modifiedJob = {
          ...modifiedJob,
          jobSkills: modifiedJob.jobSkills?.filter((skill) => skill?.skillId !== skillToToggle.skillId) as JobSkill[],
        }
      }
      else {
        const newSkills = modifiedJob.jobSkills;
        const lengthPreAdd = modifiedJob.jobSkills?.length
        //limit-imposing if statement
        if ((newSkills as JobSkill[]).length >= skillLimit) newSkills?.shift();

        newSkills?.push({
          ...skillToToggle,
          proficiency: "Novice",
          position: lengthPreAdd ?? 0,
          apiUrl: "",
        })
        modifiedJob = {
          ...modifiedJob,
          jobSkills: newSkills as JobSkill[],
        }
        //fix the positions right after they're changed
        for (let i = 0; i < (newSkills as JobSkill[]).length; i++) {
          (newSkills as JobSkill[])[i].position = i;
        }

      }

      updateJob(modifiedJob);
    },
    [allSkills, isSkillSelected, job,]
  );

  const selectedSkills = job.jobSkills ? (job.jobSkills as JobSkill[]).sort((a, b) => a.position - b.position) : [];

  /**
   * Renders skill tags as clickable buttons based on the active tab and search results.
   * Each tag button shows a plus or lose icon depending on selection status and is colored based on skill type.
   * @returns JSX Element
   */
  const renderSkills = useCallback(() => {
    // no search item, render all skills
    if (searchedSkills && searchedSkills.length !== 0) {

      //The final list of skills displayed to the screen.
      let skillsToDisplay = searchedSkills;

      //Since discipline appears multiple times, it's defined here.
      let discipline;

      switch (currentSkillsTab) {
        case 0:
          //Developer
          {
            discipline = searchedSkills.filter((tag) => (tag as Skill).category === "Discipline");
            const software = searchedSkills.filter((tag) => (tag as Skill).category === "Software");
            const codingLanguage = searchedSkills.filter((tag) => (tag as Skill).category === "Coding Language");
            const framework = searchedSkills.filter((tag) => (tag as Skill).category === "Framework");
            const operatingSystem = searchedSkills.filter((tag) => (tag as Skill).category === "Operating System");
            const gameEngine = searchedSkills.filter((tag) => (tag as Skill).category === "Game Engine");
            skillsToDisplay = discipline.concat(software, codingLanguage, framework, operatingSystem, gameEngine);
            break;
          }
        case 1:
          //Designer
          {
            discipline = searchedSkills.filter((tag) => (tag as Skill).category === "Discipline");
            const videoSoftware = searchedSkills.filter((tag) => (tag as Skill).category === "Video Software");
            const designSoftware = searchedSkills.filter((tag) => (tag as Skill).category === "Design Software");
            const artAnimation = searchedSkills.filter((tag) => (tag as Skill).category === "Art and Animation");
            const photoEditing = searchedSkills.filter((tag) => (tag as Skill).category === "Photo Editing");
            skillsToDisplay = discipline.concat(videoSoftware, designSoftware, artAnimation, photoEditing);
            break;
          }
        case 2:
          //Soft
          {
            discipline = searchedSkills.filter((tag) => (tag as Skill).category === "Discipline");
            const team = searchedSkills.filter((tag) => (tag as Skill).category === "Team");
            const personal = searchedSkills.filter((tag) => (tag as Skill).category === "Personal");
            skillsToDisplay = discipline.concat(team, personal);
            break;
          }
        case 3:
          //Audio
          {
            discipline = searchedSkills.filter((tag) => (tag as Skill).category === "Discipline");
            const dawAudioEditor = searchedSkills.filter((tag) => (tag as Skill).category === "DAW/Audio Editor");
            const middleware = searchedSkills.filter((tag) => (tag as Skill).category === "Middleware");
            const notation = searchedSkills.filter((tag) => (tag as Skill).category === "Notation");
            skillsToDisplay = discipline.concat(dawAudioEditor, middleware, notation);
            break;
          }
        case 4:
          //Engineer
          {
            discipline = searchedSkills.filter((tag) => (tag as Skill).category === "Discipline");
            const engineeringSoftware = searchedSkills.filter((tag) => (tag as Skill).category === "Engineering Software");
            const hardware = searchedSkills.filter((tag) => (tag as Skill).category === "Hardware");
            skillsToDisplay = discipline.concat(engineeringSoftware, hardware);
            break;
          }
      }

      return skillsToDisplay.map((skill, index, array) => (
        <Fragment key={skill.skillId}>
          {index === 0 || ((array[index - 1] as Skill).category != (array[index] as Skill).category)
            ? <div id="tag-category-header">
              <p>{(array[index] as Skill).category}</p>
              <hr></hr>
            </div>
            : <></>}
          <Tag
            key={skill.skillId}
            onClick={() => handleSkillToggle(skill.skillId)}
            type={skill.type.toLowerCase() + " skill"}
            selected={isSkillSelected(skill.skillId) === "selected"}
          >
            <i
              className={
                isSkillSelected(skill.skillId) === "selected"
                  ? "fa fa-close"
                  : "fa fa-plus"
              }
            ></i>
            <p>&nbsp;{skill.label}</p>
          </Tag>
        </Fragment>
      ));
    } else if (searchedSkills && searchedSkills.length === 0) {
      return <div className="no-results-message">No results found!</div>;
    }

    // Developer Skill
    if (currentSkillsTab === 0) {
      return allSkills
        .filter((anySkill) => anySkill.type === "Developer")
        .map((developerSkill) => (
          <Tag
            key={developerSkill.skillId}
            onClick={() => handleSkillToggle(developerSkill.skillId)}
            type="developer skill"
          >
            <i
              className={
                isSkillSelected(developerSkill.skillId) === "selected"
                  ? "fa fa-close"
                  : "fa fa-plus"
              }
            ></i>
            <p>&nbsp;{developerSkill.label}</p>
          </Tag>
        ));
    }
    //design skill tab
    else if (currentSkillsTab === 1) {
      return allSkills
        .filter((anySkill) => anySkill.type === "Designer")
        .map((designerSkill) => (
          <Tag
            key={designerSkill.skillId}
            onClick={() => handleSkillToggle(designerSkill.skillId)}
            type="designer skill"
          >
            <i
              className={
                isSkillSelected(designerSkill.skillId) === "selected"
                  ? "fa fa-close"
                  : "fa fa-plus"
              }
            ></i>
            <p>&nbsp;{designerSkill.label}</p>
          </Tag>
        ));
    }
    //returns the soft skills
    else if (currentSkillsTab === 2) {
      return allSkills
        .filter((anySkill) => anySkill.type === "Soft")
        .map((softSkill) => (
          <Tag
            key={softSkill.skillId}
            onClick={() => handleSkillToggle(softSkill.skillId)}
            type="soft skill"
          >
            <i
              className={
                isSkillSelected(softSkill.skillId) === "selected"
                  ? "fa fa-close"
                  : "fa fa-plus"
              }
            ></i>
            <p>&nbsp;{softSkill.label}</p>
          </Tag>
        ));
    }
    //returns the audio skills
    else if (currentSkillsTab === 3) {
      return allSkills
        .filter((anySkill) => anySkill.type === "Audio")
        .map((audioSkill) => (
          <Tag
            key={audioSkill.skillId}
            onClick={() => handleSkillToggle(audioSkill.skillId)}
            type="soft skill"
          >
            <i
              className={
                isSkillSelected(audioSkill.skillId) === "selected"
                  ? "fa fa-close"
                  : "fa fa-plus"
              }
            ></i>
            <p>&nbsp;{audioSkill.label}</p>
          </Tag>
        ));
    }
    //returns the engineer skills
    else if (currentSkillsTab === 4) {
      return allSkills
        .filter((anySkill) => anySkill.type === "Engineer")
        .map((engineerSkill) => (
          <Tag
            key={engineerSkill.skillId}
            onClick={() => handleSkillToggle(engineerSkill.skillId)}
            type="soft skill"
          >
            <i
              className={
                isSkillSelected(engineerSkill.skillId) === "selected"
                  ? "fa fa-close"
                  : "fa fa-plus"
              }
            ></i>
            <p>&nbsp;{engineerSkill.label}</p>
          </Tag>
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
    // show no results
    if (!results || results.length === 0 || results[0].length === 0) {
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

  const originalSkillOrder = useMemo(() => {
    return job.jobSkills ? (job.jobSkills?.map((skill) => skill?.skillId)) : [];
  }, []);

  // Does Skills match in EXACT order
  const isSkillsUnsaved = useMemo(() => {
    const currentSkills = (job.jobSkills as JobSkill[]) || [];

    if (currentSkills.length !== originalSkillOrder.length) return true;

    // Checks if any element shifted index or changed
    return currentSkills.some((s, index) => s.skillId !== originalSkillOrder[index]);
  }, [job.jobSkills, originalSkillOrder]);

  return (
    <div id="profile-editor-tags">
      <div id="project-editor-selected-tags">
        <div className="project-editor-section-header">
          Selected Skills
          {isSkillsUnsaved && (
            <span className="unsaved-indicator">
              (Unsaved)
            </span>
          )}
        </div>
        <div className="project-editor-extra-info">
          Drag and drop to reorder
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[clampDragWithinContainer]}
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
                    tag={{
                      skillId: skill.skillId,
                      label: skill.label,
                      type: skill.type as SkillType,
                      category: skill.category
                    }}
                    onRemove={handleSkillToggle}
                  />
                </Fragment>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button
          type="button"
          className="delete-tags-btn"
          hidden={(job.jobSkills as JobSkill[])?.length === 0 || job.jobSkills == undefined}
          onClick={() => {
            /* deletes all skills for the user */
            modifiedJob = {
              ...modifiedJob,
              jobSkills: [],
            }

            /* re-renders the current popup with 0 skills remaining and updates
            user profile */
            setSkills((job.jobSkills as JobSkill[]).splice(0));
            updateJob(modifiedJob);
          }}
          title="Remove all selected tags"
        >
          <i className="fa fa-trash" style={{ color: '#ff4d4f' }} />
        </button>
      </div>

      <div id="project-editor-tag-search">
        <SearchBar
          key={currentSkillsTab}
          dataSets={currentDataSet}
          onSearch={(results) =>
            handleSearch(results as unknown[][] as Skill[][])
          }
          placeholderText='Search for Tag'

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
