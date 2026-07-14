import { useState, useMemo, useCallback, Fragment, useEffect } from "react";
import { SearchBar } from "../../SearchBar";
import { getSkills } from "../../../api/users";
import { MySkill, Skill, MePrivate, SkillType } from "@looking-for-group/shared";
import { userDataManager } from "../../../api/data-managers/user-data-manager";
import { PendingUserProfile, PendingUserSkill } from "../../../../types/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTag } from "../../ProjectCreatorEditor/tabs/SortableItem";
import { clampDragWithinContainer } from "../../ProjectCreatorEditor/tabs/dragModifiers";
import TagDisplay from "../../TagDisplay";

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

interface SkillsTabProps {
  profile: PendingUserProfile;
  unmodifiedProfile: MePrivate;
  dataManager: Awaited<ReturnType<typeof userDataManager>>;
  updatePendingProfile: (profileData: PendingUserProfile) => void;
}

/**
 * Profile Skills Tab. Displays selected skill tags with drag and drop instructions.
 * Shows the search bar for filtering skills, category tabs, and the skill tag buttons.
 * @param dataManager Handles data changes to save changes later.
 * @param profile Temporary profile data.
 * @param updatePendingProfile Updates profile data.
 * @param unmodifiedProfile A copy of the profile before any changes
 * @returns JSX Element
 */
export const SkillsTab = ({
  dataManager,
  profile,
  unmodifiedProfile,
  updatePendingProfile,
}: SkillsTabProps) => {
  // States
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  // Tracks which tab we are currently on
  const [currentSkillsTab, setCurrentSkillsTab] = useState(0);
  // filtered results from skill search bar
  const [searchedSkills, setSearchedSkills] = useState<Skill[]>([]);

  const [searchValue, setSearchValue] = useState("");

  /* ONLY used for the deleting tags button. This is needed to re-render
  the selected skills section when reseting tags */
  //const [skills, setSkills] = useState<Skill[]>(unmodifiedProfile.skills);

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

  useEffect(() => {
    const sorted = [...profile.skills].sort((a, b) => a.position - b.position);
    updatePendingProfile({
      ...profile,
      skills: sorted,
    });
  }, []);

  /**
   * Finds if a skill is present on the project
   * @returns string of status: "selected" or "unselected."
   */
  const isSkillSelected = (id: number) => {
    const skills: MySkill[] = profile.skills;

    if (skills.some((skill) => skill.skillId === id)) return "selected";
    return "unselected";
  }

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

    //clone array to avoid mutation
    const skills = [...profile.skills].sort((a, b) => a.position - b.position);

    const oldIndex = skills.findIndex((s) => s.skillId === Number(active.id));
    const newIndex = skills.findIndex((s) => s.skillId === Number(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    //locally reorder
    const reorderedSkills = arrayMove(skills, oldIndex, newIndex).map(
      (skill, index) => ({
        ...skill,
        position: index,
      })
    );

    //update ui
    updatePendingProfile({
      ...profile,
      skills: reorderedSkills,
    });

    //PATCH ONLY moved skills
    const movedSkill = reorderedSkills[newIndex];

    dataManager.updateSkill({
      id: {
        type: "canon",
        value: movedSkill.skillId,
      },
      data: {
        position: movedSkill.position,
        proficiency: movedSkill.proficiency,
      },
    });

  };

  /**
   * Toggles a skill as selected or unselected
   */
  const handleSkillToggle = useCallback(
    (skillId: number) => {
      const isSelected = isSkillSelected(skillId) === "selected";
      const skillToToggle = allSkills.find(s => s.skillId === skillId);
      if (!skillToToggle) return;

      if (isSelected) {
        //DELETE
        const remaining = profile.skills
          .filter(skill => skill.skillId !== skillId)
          .sort((a, b) => a.position - b.position)
          .map((s, index) => ({ ...s, position: index }));

        const skillToDelete = profile.skills.find(s => s.skillId === skillId);
        if (!skillToDelete) return;

        //if pending skill DO NOT CALL deleteSkill();
        // if ("localId" in skillToDelete) {
        //   updatePendingProfile({
        //     ...profile,
        //     skills: remaining,
        //   });
        //   return
        // } else {

          updatePendingProfile({
            ...profile,
            skills: remaining,
          });

          // only delete saved skills
          dataManager.deleteSkill({
            id: {
              type: "canon",
              value: skillId,
            },
            data: null,
          });

          return;
        //}

      } else {
        //ADD

        //type safe
        const nextLocalId = Math.max(
          0, ...profile.skills.map(
            s => "localId" in s ? Number(s.localId) || 0 : 0
          )) + 1

        const newSkill: PendingUserSkill = {
          localId: String(nextLocalId),
          apiUrl: "",
          proficiency: "Novice",
          position: selectedSkills.length,
          skillId: skillId,
          label: skillToToggle.label,
          type: skillToToggle.type,
          category: skillToToggle.category,
        }

        updatePendingProfile({
          ...profile,
          skills: [...profile.skills, newSkill].sort((a, b) => a.position - b.position),
        });

        dataManager.addSkill({
          id: {
            type: "canon",
            value: skillId,
          },
          data: {
            skillId,
            position: selectedSkills.length, // add to end of list by default
            proficiency: "Novice", // TODO add a way to properly set skill proficiency
          },
        });
      }
    },
    [allSkills, dataManager, isSkillSelected, profile, updatePendingProfile]
  );

  //avoid mutation
  const selectedSkills = [...profile.skills].sort((a, b) => a.position - b.position);

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
          className={`button-reset project-editor-tag-search-tab filter-tab-${skillTabColors[skill] ?? "grey"} ${currentSkillsTab === i ? "tag-search-tab-active" : ""}`}
        >
          {skill}
        </button>
      );
    });
    return <div id="project-editor-tag-search-tabs">{tabs}</div>;
  };

  const originalSkillOrder = useMemo(() => {
    return (profile.skills || []).map((s) => s.skillId);
  }, [profile.skills]);

  // Does Skills match in EXACT order
  const isSkillsUnsaved = useMemo(() => {
    const currentskills = profile.skills || [];

    if (currentskills.length !== originalSkillOrder.length) return true;

    // Checks if any element shifted index or changed
    return currentskills.some((s, index) => s.skillId !== originalSkillOrder[index]);
  }, [profile.skills, originalSkillOrder]);

  return (
    <div id="profile-editor-tags">
      <div id="project-editor-selected-tags">
        <div className="project-editor-section-header">
          Selected Skills
          {/* This will work when you can select multiple skills. Someone else is working on it */}
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
          hidden={profile.skills.length === 0 || profile.skills == undefined}
          onClick={() => {
            /* deletes all skills in the data manager for the user */
            for (let i = 0; i < profile.skills.length; i++) {
              dataManager.deleteSkill({
                id: {
                  type: "canon",
                  value: profile.skills[i].skillId,
                },
                data: null,
              })
            }

            //clear slected skills + update
            updatePendingProfile({
              ...profile,
              skills: [],
            });

            //delete all
            unmodifiedProfile.skills.forEach(skill => {
              dataManager.deleteSkill({
                id: { type: "canon", value: skill.skillId },
                data: null,
              });
            });
          }}
          title="Remove all selected tags"
        >
          <i className="fa fa-trash" style={{ color: '#ff4d4f' }} />
        </button>
      </div>

      <div id="project-editor-tag-search">
        <SearchBar
          key={currentSkillsTab}
          dataSets={[{data: allSkills}]}
          onSearch={(results) =>
            handleSearch(results as unknown[][] as Skill[][])
          }
          value={searchValue}
          setValue={setSearchValue}
        />
        <div id="project-editor-tag-wrapper">
          <SkillSearchTabs />
          <hr id="tag-search-divider" />
        </div>
        <div id="project-editor-tag-search-container">
          <TagDisplay
            selected={selectedSkills.map(
              (skill) => ({
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
  );
};
