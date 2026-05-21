// --- Imports ---
import { useCallback, useEffect, useMemo, useState, useContext } from "react";
import { SearchBar } from "../../SearchBar";
import { getProjectTypes, getTags } from "../../../api/users";
import { Tag, Medium, TagType} from "@looking-for-group/shared";
import { PopupButton, PopupContent, Popup, PopupContext } from "../../Popup";
import { PendingProject} from "../../../../types/types";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
import { Tag as TagElement } from "../../Tag";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTag } from "./SortableItem";
import { Fragment } from "react";

// --- Constant ---
const TAG_TYPES = {
  DEV: "Developer Skill" as TagType,
  DESIGNER: "Designer Skill" as TagType,
  SOFT: "Soft Skill" as TagType,
  GENRE: ["Creative", "Technical", "Games", "Multimedia", "Music", "Other"] as TagType[],
  MEDIUM: "Medium",
};

let projectAfterTagsChanges: PendingProject;
// let localIdIncrement = 0;

// --- Props ---
type TagsTabProps = {
  dataManager: Awaited<ReturnType<typeof projectDataManager>>;
  projectData: PendingProject;
  saveProject?: () => Promise<void>;
  updatePendingProject: (updatedPendingProject: PendingProject) => void;
  saveable: boolean;
  failCheck: boolean;
};

/**
 * The TagsTab component handles project tag management in a React application. 
 * It allows users to select and manage multiple categories of tags for their projects, 
 * including project types, genres, and various skills (developer, designer, soft skills). 
 * The component provides search functionality, visual feedback for selected tags, and organizes tags into separate tabs by category.
 * @param dataManager data manager 
 * @param projectData current project data
 * @param saveProject save project changes
 * @param updatePendingProject set modified project
 * @param failCheck indicates if data validation has failed 
 * @returns JSX Element - Main component that renders the project tag management interface
 */

// Component Structure: 
// Project Type section - Displays selected project types
// Selected Tags section - Displays all selected tags with reordering capability
// Tag Search section - Includes search bar and category tabs for finding and selecting tags

// --- Component ---
export const TagsTab = ({
  dataManager,
  projectData,
  saveProject,
  updatePendingProject,
  saveable,
  failCheck,
}: TagsTabProps) => {

  projectAfterTagsChanges = structuredClone(projectData);


  //  --- Hooks ---
  // Complete list of available mediums from API
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  // Complete list of available tags from API
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // sets error when adding a link to the project
  // const [error, setError] = useState('');

  // Tracks which category tab is currently viewed: 0 - medium, 1 - genre, 2 - dev skills, 3 - design skills, 4 - soft skills
  const [currentTagsTab, setCurrentTagsTab] = useState(0);

  // Filtered results from tag search bar
  const [searchedTags, setSearchedTags] = useState<unknown[]>([]);

  const { setOpen: closeOuterPopup } = useContext(PopupContext);

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

    const tags = projectAfterTagsChanges.tags;
    const oldIndex = tags.findIndex((t) => t.tagId === Number(active.id));
    const newIndex = tags.findIndex((t) => t.tagId === Number(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    projectAfterTagsChanges.tags = arrayMove(tags, oldIndex, newIndex);
    updatePendingProject(projectAfterTagsChanges);
  };

  // EFFECTS:
  // This component has several useEffect hooks that:
  // - Update the local state when project data changes
  // - Update the parent component when local state changes
  // - Fetch project types, tags, and skills from the API when the component mounts

  // Get full lists of mediums, tags
  useEffect(() => {
    const fetchMediums = async () => {
      const response = await getProjectTypes();
      if (!response.data) {
        return;
      }
      setAllMediums(response.data);
    };
    if (allMediums.length === 0) {
      fetchMediums();
    }
  }, [allMediums]);
  useEffect(() => {
    const getAllTags = async () => {
        const response = await getTags();
        if (!response.data) {
          return;
        }
        setAllTags(response.data);
    };
    if (allTags.length === 0) {
      getAllTags();
    }
  }, [allTags]);

  // Update tags shown for search bar
  const currentDataSet = useMemo(() => {
    switch (currentTagsTab) {
      case 0:
        return [{ data: allMediums }];
      case 1:
          return [{ data: allTags.filter(tag => TAG_TYPES.GENRE.includes(tag.type as TagType))
          }];
      case 2:
        return [{ data: allTags.filter(tag => tag.type === TAG_TYPES.DEV) }];
      case 3:
        return [{ data: allTags.filter(tag => tag.type === TAG_TYPES.DESIGNER) }];
      case 4:
        return [{ data: allTags.filter(tag => tag.type === TAG_TYPES.SOFT) }];
      default:
        return [{ data: [] }];
    }
  }, [currentTagsTab, allMediums, allTags]);

  // Reset tag list on tab change to default list
  useEffect(() => {
    const defaultTags = currentDataSet[0]?.data ?? [];
    setSearchedTags(defaultTags);
  }, [currentTagsTab, currentDataSet])

  // Determines if a specific tag is already selected for the current project.
  // Returns "selected" or "unselected" string for use in CSS classes.
  const isTagSelected = useCallback(
    (id: number, label: string, tab: number = -1) => {
      switch (tab){
        case -1: // No tab, iterate through all categories
          return (
            projectData.mediums.some((m) => m.mediumId === id && m.label === label) ||
            projectData.tags.some((t) => t.tagId === id && t.label === label)) ?
              "selected" :
              "unselected";
        case 0: // Mediums
          return projectData.mediums.some(
            (t) => t.mediumId === id && t.label === label
          ) ? 
            "selected" :
            "unselected";
        case 1: // Genre
        case 2: // Developer Skills
        case 3: // Designer Skills
        case 4: // Soft Skills
          return projectData.tags.some(
            (t) => t.tagId === id && t.label === label
          ) ? 
            "selected" :
            "unselected";
        default:
          return "unselected";
      }
  }, [projectData.mediums, projectData.tags]);

  const handleMediumSelect = useCallback(
    (mediumId: number) => {
      const selected = projectAfterTagsChanges.mediums.some(
        (medium) => medium.mediumId === mediumId
      );

      if (selected) {
        dataManager.deleteMedium({
          id: {
            value: mediumId,
            type: "canon",
          },
          data: null,
        });

        projectAfterTagsChanges.mediums =
          projectAfterTagsChanges.mediums.filter(
            (medium) => medium.mediumId !== mediumId
          );

        updatePendingProject(projectAfterTagsChanges);
        return;
      }

      dataManager.addMedium({
        id: {
          value: mediumId,
          type: "canon",
        },
        data: {
          mediumId,
        },
      });

      projectAfterTagsChanges.mediums.push({
        ...allMediums.find((medium) => medium.mediumId === mediumId)!,
        mediumId,
      });
      updatePendingProject(projectAfterTagsChanges);
      return;
    },
    [allMediums, dataManager, updatePendingProject]
  );

  // Event handler for when a tag is clicked. Toggles the tag's selected state and updates the project data accordingly.
  const handleTagSelect = useCallback(
    (tagId: number) => {
      const selected = projectAfterTagsChanges.tags.some(
        (tag) => tag.tagId === tagId
      );

      if (selected) {
        dataManager.deleteTag({
          id: {
            value: tagId,
            type: "canon",
          },
          data: null,
        });

        projectAfterTagsChanges.tags = projectAfterTagsChanges.tags.filter(
          (tag) => tag.tagId !== tagId
        );

        updatePendingProject(projectAfterTagsChanges);
        return;
      }

      dataManager.addTag({
        id: {
          value: tagId,
          type: "canon",
        },
        data: {
          tagId,
        },
      });

      projectAfterTagsChanges.tags.push({
        ...allTags.find((tag) => tag.tagId === tagId)!,
        tagId,
      });
      updatePendingProject(projectAfterTagsChanges);
      return;
    },
    [allTags, dataManager, updatePendingProject]
  );

  // Creates button elements for all available tags in the current category tab, with appropriate styling for selected/unselected states.
  const renderTags = useCallback(() => {
    // no search item, render all tags
    if (searchedTags && searchedTags.length !== 0) {
      return searchedTags.map((tagOrMedium) => {
        // get id according to type of tag
        let id: number = -1; // bad default value
        let isTag;
        if ("tagId" in (tagOrMedium as Tag)) {
          isTag = true;
          id = (tagOrMedium as Tag).tagId;
        } else if ("mediumId" in (tagOrMedium as Medium)) {
          isTag = false;
          id = (tagOrMedium as Medium).mediumId;
        } else {
          console.log('Search query isnt of type Tag or Medium');
          return;
        }

        const selected = isTagSelected(id, (tagOrMedium as Tag | Medium).label, currentTagsTab) === "selected";

        return (
          <TagElement
            key={id}
            type={isTag
              ? (tagOrMedium as Tag).type.toLowerCase()
              : "medium"}
            onClick={
              isTag
                ? () => handleTagSelect((tagOrMedium as Tag).tagId)
                : () => handleMediumSelect((tagOrMedium as Medium).mediumId)
            }
            selected={selected}
          >
            <i className={ selected ? "fa fa-check" : "fa fa-plus" }></i>
            <p>{isTag ? (tagOrMedium as Tag).label : (tagOrMedium as Medium).label}</p>
          </TagElement>
        );
      });
    } else if (searchedTags && searchedTags.length === 0) {
      return <div className="no-results-message">No results found!</div>;
    }
    // medium
    if (currentTagsTab === 0) {
      return allMediums.map((medium) => {
        const selected = isTagSelected(medium.mediumId, medium.label, currentTagsTab) === "selected";

        return <TagElement
          key={medium.mediumId}
          type={"medium"}
          onClick={() => handleMediumSelect(medium.mediumId)}
          selected={selected}
        >
          <i
            className={
              selected
                ? "fa fa-close"
                : "fa fa-plus"
            }
          ></i>
          <p>{medium.label}</p>
        </TagElement>;
    });
    } else if (currentTagsTab === 1) {
      return allTags
        .filter((tag) =>
          ["Creative", "Technical", "Games", "Multimedia", "Music"].includes(
            tag.type
          )
        )
        .map((genreTag) => {
        const selected = isTagSelected(genreTag.tagId, genreTag.label, currentTagsTab) === "selected";
        
        return <TagElement
            key={genreTag.tagId}
            type={"creative"}
            selected={selected}
            onClick={() => handleTagSelect(genreTag.tagId)}
          >
            <i
              className={
                selected
                  ? "fa fa-close"
                  : "fa fa-plus"
              }
            ></i>
            <p>{genreTag.label}</p>
          </TagElement>;
    });
    } else if (currentTagsTab === 2) {
      return allTags
        .filter((tag) => tag.type === "Developer Skill")
        .map((developerSkillTag) => {
          const selected = isTagSelected(developerSkillTag.tagId, developerSkillTag.label, currentTagsTab) === "selected";
          return <TagElement
            key={developerSkillTag.tagId}
            type={"developer skill"}
            selected={selected}
            onClick={() => handleTagSelect(developerSkillTag.tagId)}
          >
            <i
              className={ selected ? "fa fa-close" : "fa fa-plus" }
            ></i>
            <p>{developerSkillTag.label}</p>
          </TagElement>;
        });
    } else if (currentTagsTab === 3) {
      return allTags
        .filter((tag) => tag.type === "Designer Skill")
        .map((designerSkillTag) => {
          const selected = isTagSelected(designerSkillTag.tagId, designerSkillTag.label, currentTagsTab) === "selected";
          return <TagElement
            key={designerSkillTag.tagId}
            type={"designer skill"}
            selected={selected}
            onClick={() => handleTagSelect(designerSkillTag.tagId)}
          >
            <i
              className={selected ? "fa fa-close" : "fa fa-plus"}
            ></i>
            <p>{designerSkillTag.label}</p>
          </TagElement>;
        });
    }
    return allTags
      .filter((tag) => tag.type === "Soft Skill")
      .map((softSkillTag) => {
        const selected = isTagSelected(softSkillTag.tagId, softSkillTag.label, currentTagsTab) === "selected";
        return <TagElement
          key={softSkillTag.tagId}
          type={"soft skill"}
          selected={selected}
          onClick={() => handleTagSelect(softSkillTag.tagId)}
        >
          <i
            className={selected ? "fa fa-close" : "fa fa-plus"}
          ></i>
          <p>{softSkillTag.label}</p>
        </TagElement>;
      });
  }, [
    searchedTags,
    currentTagsTab,
    allTags,
    isTagSelected,
    handleTagSelect,
    handleMediumSelect,
    allMediums,
  ]);

  // Callback for the SearchBar component that updates the displayed tags based on search results.
  const handleSearch = useCallback((results: unknown[][]) => {
    // setSearchResults(results);
    if (results.length === 0 && currentDataSet.length !== 0) {
      // no results or current data set
      setSearchedTags([]);
    }
    else {
      setSearchedTags(results[0]);
    }
  }, [currentDataSet.length]);

  // --- Complete component ---
  return (
    <div id="project-editor-tags">
      <div id="project-editor-type-tags">
        <div className="project-editor-section-header">Medium</div>
        {projectAfterTagsChanges.mediums.length === 0 ? (
          <div className="error">*At least 1 medium is required</div>
        ) : (
          <></>
        )}
        <div id="project-editor-type-tags-container">
          {(projectAfterTagsChanges.mediums).map((medium) => (
            <TagElement
              key={medium.mediumId}
              selected={true}
              type={"medium"}
              onClick={() => handleMediumSelect(medium.mediumId)}
            >
              <i className="fa fa-close"></i>
              <p>{medium.label}</p>
            </TagElement>
          ))}
        </div>
      </div>

      <div id="project-editor-selected-tags">
        <div className="project-editor-section-header">Selected Tags</div>
        <div className="project-editor-extra-info">
          Drag and drop to reorder. The first 2 tags will be displayed on your
          project's discover card.
        </div>
        {projectAfterTagsChanges.tags.length === 0 && (
          <div className="error">*At least 1 tag is required</div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projectAfterTagsChanges.tags.map((t) => t.tagId)}
            strategy={verticalListSortingStrategy}
          >
            <div id="project-editor-selected-tags-container">
              {projectAfterTagsChanges.tags.map((t, index) => (
                <Fragment key={t.tagId}>
                  {/* Divider marks the cutoff: the first two tags appear on the discover card */}
                  {index === 2 && <hr id="selected-tag-divider" />}
                  <SortableTag id={t.tagId} tag={t} onRemove={handleTagSelect} />
                </Fragment>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div id="project-editor-tag-search">
        <SearchBar
          key={currentTagsTab}
          dataSets={currentDataSet}
          onSearch={(results) => handleSearch(results)}
        />
        <div id="project-editor-tag-wrapper">
          <div id="project-editor-tag-search-tabs">
            <button
              onClick={() => {
                setCurrentTagsTab(0);
              }}
              className={`button-reset project-editor-tag-search-tab ${currentTagsTab === 0 ? "tag-search-tab-active" : ""}`}
              //Data from genres
            >
              Medium
            </button>
            <button
              onClick={() => {
                setCurrentTagsTab(1);
              }}
              className={`button-reset project-editor-tag-search-tab ${currentTagsTab === 1 ? "tag-search-tab-active" : ""}`}
              //Data from tags
            >
              Genre
            </button>
            <button
              onClick={() => {
                setCurrentTagsTab(2);
              }}
              className={`button-reset project-editor-tag-search-tab ${currentTagsTab === 2 ? "tag-search-tab-active" : ""}`}
              //Data from skills (type=Developer)
            >
              Developer Skills
            </button>
            <button
              onClick={() => {
                setCurrentTagsTab(3);
              }}
              className={`button-reset project-editor-tag-search-tab ${currentTagsTab === 3 ? "tag-search-tab-active" : ""}`}
              //Data from skills (type=Designer)
            >
              Designer Skills
            </button>
            <button
              onClick={() => {
                setCurrentTagsTab(4);
              }}
              className={`button-reset project-editor-tag-search-tab ${currentTagsTab === 4 ? "tag-search-tab-active" : ""}`}
              //Data from skills (type=Soft)
            >
              Soft Skills
            </button>
          </div>
          <hr id="tag-search-divider" />
        </div>
        <div id="project-editor-tag-search-container">{renderTags()}</div>
      </div>
      <div id="tags-save-info">
        { saveable ?
          <Popup>
            <PopupButton
              buttonId="project-editor-save"
              doNotClose={() => failCheck}
            >
              Save Changes
            </PopupButton>
            <PopupContent useClose={false}>
              <div id="confirm-editor-save-text">Are you sure you want to save all changes?</div>
              <div id="confirm-editor-save">
                <PopupButton callback={saveProject} closeParent={closeOuterPopup} buttonId="project-editor-save">
                  Confirm
                </PopupButton>
                <PopupButton buttonId="team-edit-member-cancel-button" >
                  Cancel
                </PopupButton>
              </div>
            </PopupContent>
          </Popup>
        :
          <div id="invalid-input-error" className={"save-error-msg-general"}>
            <p>*Fill out all required info before saving!*</p>
          </div>
        }
      </div>
    </div>
  );
};
