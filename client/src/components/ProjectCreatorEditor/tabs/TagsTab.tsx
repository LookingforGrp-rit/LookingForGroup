// --- Imports ---
import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchBar } from "../../SearchBar";
import { getProjectTypes, getTags } from "../../../api/users";
import { ProjectDetail, Tag, Medium, ProjectMedium } from "@looking-for-group/shared";
import { TagType } from "@looking-for-group/shared/enums";
import { PopupButton } from "../../Popup";

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

// --- Props ---
type TagsTabProps = {
  projectData?: Partial<ProjectDetail>;
  setProjectData?: (data: Partial<ProjectDetail>) => void;
  saveProject?: () => void;
  failCheck: boolean;
};

// --- Component ---
export const TagsTab = ({ 
  projectData = {} as Partial<ProjectDetail>, 
  setProjectData = () => {}, 
  saveProject = () => {}, 
  failCheck,
}: TagsTabProps) => {
  //  --- Hooks ---
  // tracking project modifications
  const [modifiedProject, setModifiedProject] = useState<Partial<ProjectDetail>>(projectData);

  // Complete list of...
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // sets error when adding a link to the project
  // const [error, setError] = useState('');

  //tracking which tab of tags is currently viewed: 0 - medium, 1 - genre, 2 - dev skills, 3 - design skills, 4 - soft skills
  const [currentTagsTab, setCurrentTagsTab] = useState(0);

  //filtered results from tag search bar
  const [searchedTags, setSearchedTags] = useState<unknown[]>([]);

  // Update data when data is changed
  useEffect(() => {
    setModifiedProject(projectData);
  }, [projectData]);

  // Update parent state with new project data
  useEffect(() => {
    setProjectData(modifiedProject);
    console.log('Modified project changed!', modifiedProject);
  }, [modifiedProject, setProjectData]);

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
          return [{ data: allTags.filter( g => TAG_TYPES.GENRE.includes(g.type as TagType))
          }];
      case 2:
        return [{ data: allTags.filter(t => t.type === TAG_TYPES.DEV) }];
      case 3:
        return [{ data: allTags.filter(t => t.type === TAG_TYPES.DESIGNER) }];
      case 4:
        return [{ data: allTags.filter(t => t.type === TAG_TYPES.SOFT) }];
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
  const isTagSelected = useCallback((id: number, label: string, tab: number = -1) => {
    // if no tab, iterate through all categories
    if (tab === -1) {
      // search mediums
      if (modifiedProject.mediums?.some(t => t.mediumId === id && t.label === label)) {
        return 'selected';
      }

      // search tags
      if (modifiedProject.tags?.some(t => t.tagId === id && t.label === label)) {
        return 'selected';
      }

        return "unselected";
      }

    // Medium
    if (tab === 0) {
      // No mediums means its not selected
      if (!modifiedProject.mediums) return 'unselected';
      return modifiedProject.mediums?.some(t => t.mediumId === id && t.label === label) ?
        'selected' : 'unselected';
    }
    // Genre
    // No tags means its not selected
    if (!modifiedProject.tags) return 'unselected';
    if (tab === 1) {
      return modifiedProject.tags?.some(t => t.tagId === id && t.label === label) ?
        'selected' : 'unselected';
    }
    // Developer Skills
    if (tab === 2) {
      return modifiedProject.tags?.some(t => t.tagId === id && t.label === label) ?
        'selected' : 'unselected';
    }
    // Designer Skills
    if (tab === 3) {
      return modifiedProject.tags?.some(t => t.tagId === id && t.label === label) ?
        'selected' : 'unselected';
    }
    // Soft Skills
    if (tab === 4) {
      return modifiedProject.tags?.some(t => t.tagId === id && t.label === label) ?
        'selected' : 'unselected';
    }
    return 'unselected';
  }, [modifiedProject]);

  // Handle tag selection
  const handleTagSelect = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // take closest button to allow click on icon
    const button = e.currentTarget;

    if (!button) return;

    // trim whitespace to get tag name
    const tagLabel = button.innerText.trim();

    // determine if tag is selected
    const isSelected = !button.className.includes('unselected');

    let foundId: number | undefined;
    let type: TagType | string = TAG_TYPES.MEDIUM;

    if (button.className.includes('blue')) { // medium
      const medium = allMediums.find(t => t.label === tagLabel);
      if (!medium) return;
      foundId = medium.mediumId;
      type = TAG_TYPES.MEDIUM;
    } else if (button.className.includes('green')) { // genre
      const tag = allTags.find(t => t.label === tagLabel);
      if (!tag) return;
      foundId = tag.tagId;
      type = tag.type;
    } else if (button.className.includes('yellow')) { // developer skills
      const tag = allTags.find(t => t.type === TAG_TYPES.DEV && t.label === tagLabel);
      if (!tag) return;
      foundId = tag.tagId;
      type = TAG_TYPES.DEV;
    } else if (button.className.includes('red')) { // designer skills
      const tag = allTags.find(t => t.type === TAG_TYPES.DESIGNER && t.label === tagLabel);
      if (!tag) return;
      foundId = tag.tagId;
      type = TAG_TYPES.DESIGNER;
    } else if (button.className.includes('purple')) { // soft skills
      const tag = allTags.find(t => t.type === TAG_TYPES.SOFT && t.label === tagLabel);
      if (!tag) return;
      foundId = tag.tagId;
      type = TAG_TYPES.SOFT;
    }

    if (type === TAG_TYPES.MEDIUM) {
      if (foundId === undefined) return;

      const selectedMedium : ProjectMedium = {
        mediumId: foundId,
        label: tagLabel,
        apiUrl: `/api/projects/${modifiedProject.projectId}/mediums`
      }

      setModifiedProject(prev => ({
        ...prev,
        mediums: isSelected
          ? (prev?.mediums ?? []).filter(t => t.label !== tagLabel)
          : [...(prev?.mediums ?? []), selectedMedium]
      }));
    } else {
      // ensure we have a valid id before constructing a Tag (Tag.tagId must be a number)
      if (foundId === undefined) return;

      const selectedTag : Tag = {
        tagId: foundId,
        label: tagLabel,
        type: type as TagType,
      };

      setModifiedProject(prev => ({
        ...prev,
        tags: isSelected
          ? (prev?.tags ?? []).filter(t => t.label !== tagLabel)
          : [...(prev?.tags ?? []), selectedTag],
      }));
    }
  }, [allMediums, allTags, modifiedProject.projectId]);

  // Create elements for selected tags in sidebar
  const loadProjectTags = useMemo(() => {
    return (modifiedProject.tags ?? []).map((t) => (
      <button
        key={t.tagId}
        className={`tag-button tag-button-${getTagColor(t.type)}-selected`}
        onClick={(e) => handleTagSelect(e)}
      >
        <i className="fa fa-close"></i>
        <p>{t.label}</p>
      </button>
    ));
  }, [modifiedProject.tags, handleTagSelect]);

  // Create element for each tag in search area
  const renderTags = useCallback(() => {
    // no search item, render all tags
    if (searchedTags && searchedTags.length !== 0 ) {
      return (
        // Mediums
        (searchedTags && 'mediumId' in (searchedTags[0] as Medium)) ? (searchedTags as Medium[]).map((t) => (
          <button
            key={t.mediumId}
            className={`tag-button tag-button-blue-${isTagSelected(
              t.mediumId,
              t.label,
              currentTagsTab
            )}`}
            onClick={(e) => handleTagSelect(e)}
          >
            <i
              className={
                isTagSelected(t.mediumId, t.label, currentTagsTab) === 'selected'
                  ? 'fa fa-check'
                  : 'fa fa-plus'
              }
            ></i>
            <p>{t.label}</p>
          </button>
        )) :
        // Other Tags
        (searchedTags as Tag[]).map((t) => (
          <button
            key={t.tagId}
            className={`tag-button tag-button-${getTagColor(t.type)}-${isTagSelected(
              t.tagId,
              t.label,
              currentTagsTab
            )}`}
            onClick={(e) => handleTagSelect(e)}
          >
            <i
              className={
                isTagSelected(t.tagId, t.label, currentTagsTab) === 'selected'
                  ? 'fa fa-check'
                  : 'fa fa-plus'
              }
            ></i>
            <p>{t.label}</p>
          </button>
        ))
      );
    }
    else if (searchedTags && searchedTags.length === 0) {
     return <div className="no-results-message">No results found!</div>;
    }
  }, [searchedTags, currentTagsTab, isTagSelected, handleTagSelect]);

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
        {!modifiedProject.mediums || modifiedProject.mediums.length === 0 ? <div className="error">*At least 1 medium is required</div> : <></> }
        <div id="project-editor-type-tags-container">
          {(modifiedProject.mediums ?? []).map((t) => (
            <button key={t.mediumId} className={`tag-button tag-button-blue-selected`} onClick={(e) => handleTagSelect(e)}>
              <i className="fa fa-close"></i>
              <p>{t.label}</p>
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
        {!modifiedProject.tags || modifiedProject.tags?.length === 0 ? <div className="error">*At least 1 tag is required</div> : <></> }
        <div id="project-editor-selected-tags-container">
          {
            (() => {
              const tags = modifiedProject.tags ?? [];
              return (
                <>
                  {tags.slice(0, 2).map((t) => (
                    <button
                      key={t.tagId}
                      className={`tag-button tag-button-${getTagColor(t.type)}-selected`}
                      onClick={(e) => handleTagSelect(e)}
                    >
                      <i className="fa fa-close"></i>
                      <p>{t.label}</p>
                    </button>
                  ))}
                  <hr id="selected-tag-divider" />
                  {tags.slice(2).map((t) => (
                    <button
                      key={t.tagId}
                      className={`tag-button tag-button-${getTagColor(t.type)}-selected`}
                      onClick={(e) => handleTagSelect(e)}
                    >
                      <i className="fa fa-close"></i>
                      <p>{t.label}</p>
                    </button>
                  ))}
                </>
              );
            })()
          }
          {/* TODO: Separate top 2 tags from others with hr element */}
          {/* {loadProjectTags} */}
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
          doNotClose={() => !failCheck}
        >
          Save Changes
        </PopupButton>
      </div>
    </div>
  );
};
