// --- Imports ---
import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchBar } from "../../SearchBar";
import { getProjectTypes, getTags } from "../../../api/users";
import { Tag, Medium, TagType} from "@looking-for-group/shared";
import { PopupButton } from "../../Popup";
import { PendingProject} from "../../../../types/types";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";

// --- Constant ---
const TAG_COLORS: Record<TagType | string, string> = {
  "Creative": "green",
  "Technical": "green",
  "Games": "green",
  "Multimedia": "green",
  "Music": "green",
  "Other": "green",
  "Developer Skill": "yellow",
  "Designer Skill": "red",
  "Soft Skill": "purple",
  "Medium": "blue",
  "Purpose": "", // purpose tags are not used here
};

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
  failCheck: boolean;
};

// --- Component ---
export const TagsTab = ({
  dataManager,
  projectData,
  saveProject,
  updatePendingProject,
  failCheck,
}: TagsTabProps) => {

  projectAfterTagsChanges = structuredClone(projectData);


  //  --- Hooks ---
  // Complete list of...
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // sets error when adding a link to the project
  // const [error, setError] = useState('');

  //tracking which tab of tags is currently viewed: 0 - medium, 1 - genre, 2 - dev skills, 3 - design skills, 4 - soft skills
  const [currentTagsTab, setCurrentTagsTab] = useState(0);

  //filtered results from tag search bar
  const [searchedTags, setSearchedTags] = useState<unknown[]>([]);

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

  // Gets color associated with tag type
  const getTagColor = (type: TagType | string) => TAG_COLORS[type];

  // Find if a tag is present on the project
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

  // Create element for each tag
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

        return (
          <button
            key={id}
            className={`tag-button tag-button-${isTag ? getTagColor((tagOrMedium as Tag).type) : "blue"}-${isTagSelected(
              id,
              isTag ? (tagOrMedium as Tag).label : (tagOrMedium as Medium).label,
              currentTagsTab
            )}`}
            onClick={
              isTag
                ? () => handleTagSelect((tagOrMedium as Tag).tagId)
                : () => handleMediumSelect((tagOrMedium as Medium).mediumId)
            }
          >
            <i
              className={
                isTagSelected(
                  id,
                  isTag ? (tagOrMedium as Tag).label : (tagOrMedium as Medium).label,
                  currentTagsTab) === "selected" ?
                    "fa fa-check" :
                    "fa fa-plus"
              }
            ></i>
            <p>{isTag ? (tagOrMedium as Tag).label : (tagOrMedium as Medium).label}</p>
          </button>
        );
      });
    } else if (searchedTags && searchedTags.length === 0) {
      return <div className="no-results-message">No results found!</div>;
    }
    // medium
    if (currentTagsTab === 0) {
      return allMediums.map((medium) => (
        <button
          key={medium.mediumId}
          className={`tag-button tag-button-blue-${isTagSelected(medium.mediumId, medium.label, currentTagsTab)}`}
          onClick={() => handleMediumSelect(medium.mediumId)}
        >
          <i
            className={
              isTagSelected(medium.mediumId, medium.label, currentTagsTab) ===
              "selected"
                ? "fa fa-close"
                : "fa fa-plus"
            }
          ></i>
          <p>{medium.label}</p>
        </button>
      ));
    } else if (currentTagsTab === 1) {
      return allTags
        .filter((tag) =>
          ["Creative", "Technical", "Games", "Multimedia", "Music"].includes(
            tag.type
          )
        )
        .map((genreTag) => (
          <button
            key={genreTag.tagId}
            className={`tag-button tag-button-green-${isTagSelected(genreTag.tagId, genreTag.label, currentTagsTab)}`}
            onClick={() => handleTagSelect(genreTag.tagId)}
          >
            <i
              className={
                isTagSelected(genreTag.tagId, genreTag.label, currentTagsTab) === "selected"
                  ? "fa fa-close"
                  : "fa fa-plus"
              }
            ></i>
            <p>{genreTag.label}</p>
          </button>
        ));
    } else if (currentTagsTab === 2) {
      return allTags
        .filter((tag) => tag.type === "Developer Skill")
        .map((developerSkillTag) => (
          <button
            key={developerSkillTag.tagId}
            className={`tag-button tag-button-yellow-${isTagSelected(developerSkillTag.tagId, developerSkillTag.label, currentTagsTab)}`}
            onClick={() => handleTagSelect(developerSkillTag.tagId)}
          >
            <i
              className={
                isTagSelected(developerSkillTag.tagId, developerSkillTag.label, currentTagsTab) === "selected"
                  ? "fa fa-close"
                  : "fa fa-plus"
              }
            ></i>
            <p>{developerSkillTag.label}</p>
          </button>
        ));
    } else if (currentTagsTab === 3) {
      return allTags
        .filter((tag) => tag.type === "Designer Skill")
        .map((designerSkillTag) => (
          <button
            key={designerSkillTag.tagId}
            className={`tag-button tag-button-red-${isTagSelected(designerSkillTag.tagId, designerSkillTag.label, currentTagsTab)}`}
            onClick={() => handleTagSelect(designerSkillTag.tagId)}
          >
            <i
              className={
                isTagSelected(designerSkillTag.tagId, designerSkillTag.label, currentTagsTab) === "selected"
                  ? "fa fa-close"
                  : "fa fa-plus"
              }
            ></i>
            <p>{designerSkillTag.label}</p>
          </button>
        ));
    }
    return allTags
      .filter((tag) => tag.type === "Soft Skill")
      .map((softSkillTag) => (
        <button
          key={softSkillTag.tagId}
          className={`tag-button tag-button-purple-${isTagSelected(softSkillTag.tagId, softSkillTag.label, currentTagsTab)}`}
          onClick={() => handleTagSelect(softSkillTag.tagId)}
        >
          <i
            className={
              isTagSelected(softSkillTag.tagId, softSkillTag.label, currentTagsTab) === "selected"
                ? "fa fa-close"
                : "fa fa-plus"
            }
          ></i>
          <p>{softSkillTag.label}</p>
        </button>
      ));
  }, [
    searchedTags,
    currentTagsTab,
    allTags,
    isTagSelected,
    handleTagSelect,
    handleMediumSelect,
    allMediums,
  ]);

  // Update shown tags according to search results
  const handleSearch = useCallback((results: unknown[][]) => {
    // setSearchResults(results);
    console.log('search results', results);
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
            <button
              key={medium.mediumId}
              className={`tag-button tag-button-blue-selected`}
              onClick={() => handleMediumSelect(medium.mediumId)}
            >
              <i className="fa fa-close"></i>
              <p>{medium.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div id="project-editor-selected-tags">
        <div className="project-editor-section-header">Selected Tags</div>
        <div className="project-editor-extra-info">
          Drag and drop to reorder. The first 2 tags will be displayed on your
          project's discover card.
        </div>
        {projectAfterTagsChanges.tags.length === 0 ? (
          <div className="error">*At least 1 tag is required</div>
        ) : (
          <></>
        )}
        <div id="project-editor-selected-tags-container">
          {
            (() => {
              const tags = projectAfterTagsChanges.tags ?? [];
              return (
                <>
                  {tags.slice(0, 2).map((t) => (
                    <div className='tag-draggable' draggable="true">
                      {/* TODO: implement dragging tags to reorder and backend functionality to track position
                      <ThemeIcon
                        width={21}
                        height={21}
                        id={'drag'}
                        ariaLabel="drag"
                        onClick={() => {console.log('clicked draggable tag icon')}}
                      /> */}
                      <button
                        key={t.tagId}
                        className={`tag-button tag-button-${getTagColor(t.type)}-selected`}
                        onClick={() => handleTagSelect(t.tagId)}
                      >
                        <i className="fa fa-close"></i>
                        <p>{t.label}</p>
                      </button>
                    </div>
                  ))}
                  <hr id="selected-tag-divider" />
                  {tags.slice(2).map((t) => (
                    <div className='tag-draggable' draggable="true">
                      {/* TODO: implement dragging tags to reorder and backend functionality to track position
                      <ThemeIcon
                        width={21}
                        height={21}
                        id={'drag'}
                        ariaLabel="drag"
                        onClick={() => {console.log('clicked draggable tag icon')}}
                      /> */}
                      <button
                        key={t.tagId}
                        className={`tag-button tag-button-${getTagColor(t.type)}-selected`}
                        onClick={() => handleTagSelect(t.tagId)}
                      >
                        <i className="fa fa-close"></i>
                        <p>{t.label}</p>
                      </button>
                    </div>
                  ))}
                </>
              );
            })()
          }
        </div>
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
        <div id="invalid-input-error" className={"save-error-msg-general"}>
          <p>*Fill out all required info before saving!*</p>
        </div>
        <PopupButton
          buttonId="project-editor-save"
          callback={saveProject}
          doNotClose={() => failCheck}
        >
          Save Changes
        </PopupButton>
      </div>
    </div>
  );
};
