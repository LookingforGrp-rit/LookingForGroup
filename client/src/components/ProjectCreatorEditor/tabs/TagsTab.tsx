// --- Imports ---
import { useCallback, useEffect, useMemo, useState, useContext } from "react";
import { SearchBar } from "../../SearchBar";
import { getProjectTypes, getTags } from "../../../api/users";
import { Tag, Medium, TagType, ProjectWithFollowers, SkillType, SkillCategory } from "@looking-for-group/shared";
import { PopupButton, PopupContent, Popup, PopupContext } from "../../Popup";
import { DeleteProjectButton } from "../DeleteProjectButton";
import { PendingProject } from "../../../../types/types";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
import { Tag as TagElement } from "../../Tag";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTag } from "./SortableItem";
import { clampDragWithinContainer } from "./dragModifiers";
import { Fragment } from "react";
import TagDisplay from "../../TagDisplay";

// --- holds the possible tabs from tag types ---
const tagTabs = ['Project Type', 'Genre', 'Style', 'Game Engine'] as TagType[]

// Category color for each tag tab, matching the tag/filter-tab colors.
const tagTabColors: Record<string, string> = {
  Medium: 'blue',
  Genre: 'green',
  Style: 'pink',
  'Game Engine': 'yellow',
  'Project Type': 'blue'
};

let projectAfterTagsChanges: PendingProject;
// let localIdIncrement = 0;

// --- Props ---
type TagsTabProps = {
  dataManager?: Awaited<ReturnType<typeof projectDataManager>>;
  projectData: PendingProject;
  unmodifiedProject: ProjectWithFollowers;
  saveProject?: () => Promise<void>;
  updatePendingProject: (updatedPendingProject: PendingProject) => void;
  saveable: boolean;
  failCheck: boolean;
  updateFailCheck: boolean;
  message: string;
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
  unmodifiedProject,
  saveProject,
  updatePendingProject,
  saveable,
  failCheck,
  updateFailCheck,
  message,
}: TagsTabProps) => {

  projectAfterTagsChanges = structuredClone(projectData);


  //  --- Hooks ---
  // Complete list of available mediums from API
  const [allMediums, setAllMediums] = useState<Tag[]>([]);
  // Complete list of available tags from API
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // sets error when adding a link to the project
  // const [error, setError] = useState('');

  // Tracks which category tab is currently viewed: 0 - medium, 1 - genre, 2 - style
  const [currentTagsTab, setCurrentTagsTab] = useState(0);

  // Filtered results from tag search bar
  const [searchedTags, setSearchedTags] = useState<unknown[]>([]);

  const [searchValue, setSearchValue] = useState("");

  const { setOpen: closeOuterPopup } = useContext(PopupContext);

  const[confirm, setConfirm] = useState(false);

  /* ONLY used for the deleting tags button. This is needed to re-render
    the selected mediums and tags section when reseting */
  const [mediums, setMediums] = useState<Medium[]>(projectData.mediums);
  const [tags, setTags] = useState<Tag[]>(projectData.tags);
  //prevent the error
  mediums;
  tags;

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

    const reorderedTags = arrayMove(tags, oldIndex, newIndex).map((tag, index) => ({
      ...tag,
      displayOrder: index,
    }));

    projectAfterTagsChanges.tags = reorderedTags;

    dataManager?.updateTag({
      id: {
        type: "canon",
        value: reorderedTags[newIndex].tagId,
      },
      data: {
        tagId: reorderedTags[newIndex].tagId,
        displayOrder: reorderedTags[newIndex].displayOrder,
      },
    });

    updatePendingProject(projectAfterTagsChanges);
  };

  // Snapshot of the Medium order on load
  const originalMediumOrder = useMemo(() => {
    return (unmodifiedProject.mediums || []).map(m => m.mediumId);
  }, []);

  // Snapshot of the Tag order on load
  const originalTagOrder = useMemo(() => {
    return (unmodifiedProject.tags || []).map(t => t.tagId);
  }, []);

  // Does Mediums match in EXACT order
  const isMediumsUnsaved = useMemo(() => {
    const currentMediums = projectData.mediums || [];

    if (currentMediums.length !== originalMediumOrder.length) return true;

    // Checks if any element shifted index or changed
    return currentMediums.some((m, index) => m.mediumId !== originalMediumOrder[index]);
  }, [projectData.mediums, originalMediumOrder]);


  // Does Tags match in EXACT order
  const isTagsUnsaved = useMemo(() => {
    const currentTags = projectData.tags || [];

    if (currentTags.length !== originalTagOrder.length) return true;

    // Checks if any element shifted index or changed
    return currentTags.some((t, index) => t.tagId !== originalTagOrder[index]);
  }, [projectData.tags, originalTagOrder]);

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
      setAllMediums(response.data.map(
        medium => ({
          label: medium.label,
          tagId: medium.mediumId,
          type: "Project Type",
          category: "Other",
        } as Tag)
      ));
    };
    if (allMediums.length === 0) {
      fetchMediums();
    }
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
  }, [allMediums, allTags]);

  // Update tags shown for search bar
  const currentDataSet = useMemo(() => {
    if (currentTagsTab === 0) {
      return [{ data: allMediums }];
    }
    return [{ data: allTags.filter(tag => tag.type === tagTabs[currentTagsTab]) }];
  }, [currentTagsTab, allMediums, allTags, tagTabs]);

  const handleMediumSelect = useCallback(
    (mediumId: number) => {
      const selected = projectAfterTagsChanges.mediums.some(
        (medium) => medium.mediumId === mediumId
      );

      if (selected) {
        dataManager?.deleteMedium({
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

      dataManager?.addMedium({
        id: {
          value: mediumId,
          type: "canon",
        },
        data: {
          mediumId,
        },
      });

      projectAfterTagsChanges.mediums.push({
        ...allMediums.find((medium) => medium.tagId === mediumId)!,
        mediumId,
      });
      updatePendingProject(projectAfterTagsChanges);
      return;
    },
    [allMediums, dataManager, updatePendingProject]
  );

  // Event handler for when a tag is clicked. Toggles the tag's selected state and updates the project data accordingly.
  const handleTagSelect = useCallback(
    (tagId: number, type: string) => {
      if (type === "Project Type") {
        handleMediumSelect(tagId);
        return;
      }
      const selected = projectAfterTagsChanges.tags.some(
        (tag) => tag.tagId === tagId
      );

      if (selected) {
        dataManager?.deleteTag({
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

      dataManager?.addTag({
        id: {
          value: tagId,
          type: "canon",
        },
        data: {
          tagId: tagId,
          displayOrder: projectAfterTagsChanges.tags.length,
        },
      });

      projectAfterTagsChanges.tags.push({
        ...allTags.find((tag) => tag.tagId === tagId)!,
        tagId,
        displayOrder: projectAfterTagsChanges.tags.length,
      });
      updatePendingProject(projectAfterTagsChanges);
      return;
    },
    [allTags, dataManager, updatePendingProject]
  );

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
  }, [currentDataSet.length, setSearchedTags]);

  // --- Complete component ---
  return (
    <div id="project-editor-tags">
      <div id="project-editor-type-tags">
        <div className="project-editor-section-header">
          Selected Medium(s)
          {isMediumsUnsaved && (
            <span className="unsaved-indicator">
              (Unsaved)
            </span>
          )}
        </div>
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
              type={"project type"}
              onClick={() => handleMediumSelect(medium.mediumId)}
            >
              <i className="fa fa-close"></i>
              <p>{medium.label}</p>
            </TagElement>
          ))}
        </div>
        <button 
            type="button" 
            className="delete-tags-btn"
            hidden={projectAfterTagsChanges.mediums.length === 0 || projectAfterTagsChanges.mediums.length == undefined} 
            onClick={() => {
              /* deletes all mediums in the data manager for the project */
                for (let i = 0; i < projectAfterTagsChanges.mediums.length; i++)
                {
                    dataManager?.deleteMedium({
                    id: {
                      type: "canon",
                      value: projectAfterTagsChanges.mediums[i].mediumId,
                    },
                    data: null,
                  })
                }
              
              /* re-renders the current popup with 0 mediums remaining and updates
                project */
              setMediums(projectAfterTagsChanges.mediums.splice(0));
              updatePendingProject(projectAfterTagsChanges);
            }}
            title="Remove all selected tags"
          >
            <i className="fa fa-trash" style={{ color: '#ff4d4f' }} />
        </button>
      </div>

      <div id="project-editor-selected-tags">
        <div className="project-editor-section-header">Selected Tag(s)
          {isTagsUnsaved && (
            <span className="unsaved-indicator">
              (Unsaved)
            </span>
          )}
        </div>
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
          modifiers={[clampDragWithinContainer]}
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
                  <SortableTag 
                    id={t.tagId} tag={{
                    skillId: t.tagId,
                    label: t.label,
                    type: t.type as SkillType,
                    category: t.category as SkillCategory,
                    }} 
                    onRemove={(id) => handleTagSelect(id, t.type)}
                  />
                </Fragment>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button 
            type="button" 
            className="delete-tags-btn"
            hidden={projectAfterTagsChanges.tags.length === 0 || projectAfterTagsChanges.tags.length == undefined} 
            onClick={() => {
              /* deletes all tags in the data manager for the project */
                for (let i = 0; i < projectAfterTagsChanges.tags.length; i++)
                {
                    dataManager?.deleteTag({
                    id: {
                      type: "canon",
                      value: projectAfterTagsChanges.tags[i].tagId,
                    },
                    data: null,
                  })
                }
              
              /* re-renders the current popup with 0 mediums remaining and updates
                project */
              setTags(projectAfterTagsChanges.tags.splice(0));
              updatePendingProject(projectAfterTagsChanges);
            }}
            title="Remove all selected tags"
          >
            <i className="fa fa-trash" style={{ color: '#ff4d4f' }} />
        </button>
      </div>

      <div id="project-editor-tag-search">
        <SearchBar
          key={currentTagsTab}
          dataSets={[{data: [...allTags.filter((tag) => tag.type != "Positions" && tag.type != "Purpose" && tag.type != "Style" && tag.type != "Major"), ...allMediums]}]}
          onSearch={handleSearch}
          value={searchValue}
          setValue={setSearchValue}
        />
        <div id="project-editor-tag-wrapper">
          <div id="project-editor-tag-search-tabs">
            {tagTabs.map((type, index) => 
            <button
            onClick={() => setCurrentTagsTab(index)}
            className={`button-reset medium-tag-tab project-editor-tag-search-tab filter-tab-${tagTabColors[type as string] ?? 'grey'} ${currentTagsTab === index && searchValue === "" ? "tag-search-tab-active" : ""}`}>
              {type}
            </button>)}
          </div>
          <hr id="tag-search-divider" />
        </div>
        <div id="project-editor-tag-search-container">
          <TagDisplay
            selected={[
              ...projectAfterTagsChanges.tags.map(
                tag => ({
                  ...tag,
                  category:
                    tag.type === "Game Engine" ? "Game Engine" :
                    tag.category,
                  id: tag.tagId
                })
              ),
              ...projectAfterTagsChanges.mediums.map(
                medium => ({
                  label: medium.label,
                  id: medium.mediumId,
                  category: "Medium",
                  type: "Project Type",
                })
              )
            ]}
            toggleTag={handleTagSelect}
            tabs={tagTabs}
            tabId={currentTagsTab}
            all={[...allTags, ...allMediums].map(
              tag =>({
                ...tag,
                category: 
                  tag.type === "Project Type" ? "Medium" :
                  tag.type === "Game Engine" ? "Game Engine" :
                  tag.category,
                id: tag.tagId
              })
            )}
            searchValue={searchValue}
            searchData={(searchedTags as Tag[]).map(
              tag => ({
                ...tag,
                category: 
                  tag.type === "Project Type" ? "Medium" :
                  tag.type === "Game Engine" ? "Game Engine" :
                  tag.category,
                id: tag.tagId
              })
            )}
          />
        </div>
      </div>
      <div id="tags-save-info">
        <div className="editor-save-actions">
        <Popup>
          {saveable ? "" :
            <div id="invalid-input-error" className={"save-error-msg-general"}>
              <p>*{message}*</p>
            </div>}
          <PopupButton
            buttonId="project-editor-save"
            callback={() => {
              // Incomplete form: still clickable so the save validation runs,
              // shows the error, and auto-scrolls to the first missing field.
              if (!saveable) saveProject?.();
              else setConfirm(true);
            }}
          >
            Save Changes
          </PopupButton>
          {confirm ?
          <PopupContent useClose={false} callback={() => setConfirm(false)}>
            <div id="confirm-editor-save-text">Are you sure you want to save all changes?</div>
            <div id="confirm-editor-save">
              <PopupButton callback={saveProject} closeParent={closeOuterPopup} buttonId="project-editor-save">
                Confirm
              </PopupButton>
              <PopupButton buttonId="team-edit-member-cancel-button" >
                Cancel
              </PopupButton>
            </div>
          </PopupContent> : "" }
        </Popup>
        <DeleteProjectButton
          projectID={unmodifiedProject.projectId}
          projectTitle={unmodifiedProject.title}
        />
        </div>
      </div>
    </div>
  );
};
