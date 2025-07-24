// --- Imports ---
import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchBar } from "../../SearchBar";


// --- Interfaces ---
interface Image {
  id: number;
  image: string;
  position: number;
  file: File
}

interface ProjectData {
  audience: string;
  description: string;
  hook: string;
  images: Image[];
  jobs: { title_id: number; job_title: string; description: string; availability: string; location: string; duration: string; compensation: string; }[];
  members: { first_name: string, last_name: string, job_title: string, profile_image: string, user_id: number}[];
  project_id?: number;
  project_types: { id: number, project_type: string}[];
  purpose: string;
  socials: { id: number, url: string }[];
  status: string;
  tags: { id: number, position: number, tag: string, type: string}[];
  thumbnail: string;
  title: string;
  userId?: number;
}

interface Tag {
  tag_id: number;
  label: string;
  type: string;
}

interface ProjectType {
  type_id: number;
  label: string;
}

// --- Variables ---
// Default project value
const defaultProject: ProjectData = {
  audience: '',
  description: '',
  hook: '',
  images: [],
  jobs: [],
  members: [],
  project_id: -1,
  project_types: [],
  purpose: '',
  socials: [],
  status: '',
  tags: [],
  thumbnail: '',
  title: '',
};

// --- Methods ---
// Get appropriate tag color for tag
const getTagColor = (type: string) => {
  // Genre
  if (type === 'Genre') {
    return 'green';
  }

  // Developer Skills
  if (type === 'Developer Skill') {
    return 'yellow';
  }

  // Designer Skills
  if (type === 'Designer Skill') {
    return 'red';
  }

  // Soft Skills
  if (type === 'Soft Skill') {
    return 'purple';
  }

  // Project Type
  return 'blue';
}

// --- Component ---
export const TagsTab = ({ isNewProject = false, projectData = defaultProject, setProjectData }) => {
  //  --- Hooks ---
  // tracking project modifications
  const [modifiedProject, setModifiedProject] = useState<ProjectData>(projectData);

  // Complete list of...
  const [allProjectTypes, setAllProjectTypes] = useState<ProjectType[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allSkills, setAllSkills] = useState<Tag[]>([]);

  // sets error when adding a link to the project
  // const [error, setError] = useState('');

  //tracking which tab of tags is currently viewed: 0 - project type, 1 - genre, 2 - dev skills, 3 - design skills, 4 - soft skills
  const [currentTagsTab, setCurrentTagsTab] = useState(0);

  //filtered results from tag search bar
  const [searchedTags, setSearchedTags] = useState<(Tag | ProjectType)[]>([]);

  // Update data when data is changed
  useEffect(() => {
    setModifiedProject(projectData);
  }, [projectData]);

  // Update parent state with new project data
  useEffect(() => {
    setProjectData(modifiedProject);
  }, [modifiedProject, setProjectData]);

  // Get full lists of project types, tags, and skills
  useEffect(() => {
    const getProjectTypes = async () => {
      const url = `/api/datasets/project-types`;

      try {
        const response = await fetch(url);

        const projectTypes = await response.json();
        const projectTypeData = projectTypes.data;

        if (projectTypeData === undefined) {
          return;
        }
        setAllProjectTypes(projectTypeData);
      } catch (error) {
        console.error(error);
      }
    };
    if (allProjectTypes.length === 0) {
      getProjectTypes();
    }
  }, [allProjectTypes]);
  useEffect(() => {
    const getTags = async () => {
      const url = `/api/datasets/tags`;

      try {
        const response = await fetch(url);

        const tags = await response.json();
        const tagsData = tags.data;

        if (tagsData === undefined) {
          return;
        }
        setAllTags(tagsData);

      } catch (error) {
        console.error(error);
      }
    };
    if (allTags.length === 0) {
      getTags();
    }
  }, [allTags]);
  useEffect(() => {
    const getSkills = async () => {
      const url = `/api/datasets/skills`;

      try {
        const response = await fetch(url);

        const skills = await response.json();
        const skillData = skills.data;

        if (skillData === undefined) {
          return;
        }
        setAllSkills(skillData);

      } catch (error) {
        console.error(error);
      }
    };
    if (allSkills.length === 0) {
      getSkills();
    }
  }, [allSkills]);

  // Update tags shown for search bar
  const currentDataSet = useMemo(() => {
    switch (currentTagsTab) {
      case 0:
        return [{ data: allProjectTypes }];
      case 1:
        return [{ data: allTags.filter((t) => t.type === 'Genre') }];
      case 2:
        return [{ data: allSkills.filter((s) => s.type === 'Developer Skill') }];
      case 3:
        return [{ data: allSkills.filter((s) => s.type === 'Designer Skill') }];
      case 4:
        return [{ data: allSkills.filter((s) => s.type === 'Soft Skill') }];
      default:
        return [{ data: [] }];
    }
  }, [currentTagsTab, allProjectTypes, allTags, allSkills]);

  // Reset tag list on tab change to default list
  useEffect(() => {
  const defaultTags = currentDataSet[0]?.data ?? [];
  setSearchedTags(defaultTags);
  }, [currentTagsTab, currentDataSet])

  // Find if a tag is present on the project
  const isTagSelected = useCallback((id: number, label: string, tab: number = -1) => {
    // if no tab, iterate through all categories
    if (tab === -1) {
      // search project types
      if (modifiedProject.project_types.some(t => t.id === id && t.project_type === label)) {
        return 'selected';
      }

      // search tags
      if (modifiedProject.tags.some(t => t.id === id && t.tag === label)) {
        return 'selected';
      }

      return 'unselected';
    }

    // Project Type
    if (tab === 0) {
      return modifiedProject.project_types.some(t => t.id === id && t.project_type === label) ?
        'selected' : 'unselected';
    }
    // Genre
    if (tab === 1) {
      return modifiedProject.tags.some(t => t.id === id && t.tag === label) ?
        'selected' : 'unselected';
    }
    //TODO: complete other skills
    // Developer Skills
    if (tab === 2) {
      return modifiedProject.tags.some(t => t.id === id && t.tag === label) ?
        'selected' : 'unselected';
    }
    // Designer Skills
    if (tab === 3) {
      return modifiedProject.tags.some(t => t.id === id && t.tag === label) ?
        'selected' : 'unselected';
    }
    // Soft Skills
    if (tab === 4) {
      return modifiedProject.tags.some(t => t.id === id && t.tag === label) ?
        'selected' : 'unselected';
    }
    return 'unselected';
  }, [modifiedProject]);

  // Handle tag selection
  const handleTagSelect = useCallback((e) => {    
    // trim whitespace to get tag name
    // take closest button to allow click on icon
    const button = e.target.closest('button');
    const tag: string = button.innerText.trim();
    
    // if tag is unselected
    if (button.className.includes('unselected')) {
      // get tag id and type according to type of tag
      let id: number = -1;
      let type: string = '';

      if (button.className.includes('blue')) { // project type
        id = allProjectTypes.find((t) => t.label === tag)?.type_id ?? -1;
        type = 'Project Type';
      }
      else if (button.className.includes('green')) { // genre
        id = allTags.find((t) => t.label === tag)?.tag_id ?? -1;
        type = 'Genre';
      }
      else if (button.className.includes('yellow')) { // developer skills
        id = allSkills.find((s) => s.type === 'Developer Skill' && s.label === tag)?.tag_id ?? -1;
        type = 'Developer Skill';
      }
      else if (button.className.includes('red')) { // designer skills
        id = allSkills.find((s) => s.type === 'Designer Skill' && s.label === tag)?.tag_id ?? -1;
        type = 'Designer Skill';
      }
      else if (button.className.includes('purple')) { // soft skills
        id = allSkills.find((s) => s.type === 'Soft Skill' && s.label === tag)?.tag_id ?? -1;
        type = 'Soft Skill';
      }

      // error check: no tag found
      if (id === -1) {
        return;
      }
      
      // add tag to project
      if (type === 'Project Type') {
        setModifiedProject({ ...modifiedProject, project_types: [...modifiedProject.project_types, { id: id, project_type: tag }] });
      } else {
        setModifiedProject({ ...modifiedProject, tags: [...modifiedProject.tags, {
          id: id,
          position: modifiedProject.tags.length,// TODO: update this according to position
          tag: tag,
          type: type
        }] });
      }
    }
    // if tag is selected
    else {
      // remove tag from project
      setModifiedProject({ ...modifiedProject,
        project_types: modifiedProject.project_types.filter((t) => t.project_type !== tag),
        tags: modifiedProject.tags.filter((t) => t.tag !== tag)
      });
    }
  }, [allProjectTypes, allSkills, allTags, modifiedProject]);

  // Create elements for selected tags in sidebar
  const loadProjectTags = useMemo(() => {
    return modifiedProject.tags
      .map((t) => (
          <button key={t.tag} className={`tag-button tag-button-${getTagColor(t.type)}-selected`} onClick={(e) => handleTagSelect(e)}>
            <i className="fa fa-close"></i>
            &nbsp;{t.tag}
          </button>
      ))
  }, [modifiedProject.tags, handleTagSelect]);
  
  // Create element for each tag
  const renderTags = useCallback(() => {
    // no search item, render all tags
    if (searchedTags && searchedTags.length !== 0 ) {
      return (
        searchedTags.map(t => {
          // get id according to type of tag
          let id: number = -1; // bad default value
          if ('tag_id' in t) {
            id = t.tag_id;
          } else if ('type_id' in t) {
            id = t.type_id;
          }

          return (
            <button
              key={id}
              className={`tag-button tag-button-${'type' in t ? getTagColor(t.type) : 'blue'}-${isTagSelected(
                id,
                t.label,
                currentTagsTab
              )}`}
              onClick={(e) => handleTagSelect(e)}
            >
              <i
                className={
                  isTagSelected(id, t.label, currentTagsTab) === 'selected'
                    ? 'fa fa-close'
                    : 'fa fa-plus'
                }
              ></i>
              &nbsp;{t.label}
            </button>
          );
        })
      )
    }
    else if (searchedTags && searchedTags.length === 0) {
     return <div className="no-results-message">No results found!</div>;
    }
    // project type
    if (currentTagsTab === 0) {
      return allProjectTypes.map((t) => (
        <button
          key={t.type_id}
          className={`tag-button tag-button-blue-${isTagSelected(t.type_id, t.label, currentTagsTab)}`}
          onClick={(e) => handleTagSelect(e)}
        >
          <i
            className={
              isTagSelected(t.type_id, t.label, currentTagsTab) === 'selected'
                ? 'fa fa-close'
                : 'fa fa-plus'
            }
          ></i>
          &nbsp;{t.label}
        </button>
      ));
    } else if (currentTagsTab === 1) {
      return allTags
        .filter((t) => t.type === 'Genre')
        .map((t) => (
          <button
            key={t.tag_id}
            className={`tag-button tag-button-green-${isTagSelected(t.tag_id, t.label, currentTagsTab)}`}
            onClick={(e) => handleTagSelect(e)}
          >
            <i
              className={
                isTagSelected(t.tag_id, t.label, currentTagsTab) === 'selected'
                  ? 'fa fa-close'
                  : 'fa fa-plus'
              }
            ></i>
            &nbsp;{t.label}
          </button>
      ));
    } else if (currentTagsTab === 2) {
      return allSkills
        .filter((s) => s.type === 'Developer Skill')
        .map((s) => (
          <button
            key={s.tag_id}
            className={`tag-button tag-button-yellow-${isTagSelected(s.tag_id, s.label, currentTagsTab)}`}
            onClick={(e) => handleTagSelect(e)}
          >
            <i
              className={
                isTagSelected(s.tag_id, s.label, currentTagsTab) === 'selected'
                  ? 'fa fa-close'
                  : 'fa fa-plus'
              }
            ></i>
            &nbsp;{s.label}
          </button>
      ));
    } else if (currentTagsTab === 3) {
      return allSkills
        .filter((s) => s.type === 'Designer Skill')
        .map((s) => (
          <button
            key={s.tag_id}
            className={`tag-button tag-button-red-${isTagSelected(s.tag_id, s.label, currentTagsTab)}`}
            onClick={(e) => handleTagSelect(e)}
          >
            <i
              className={
                isTagSelected(s.tag_id, s.label, currentTagsTab) === 'selected'
                  ? 'fa fa-close'
                  : 'fa fa-plus'
              }
            ></i>
            &nbsp;{s.label}
          </button>
        ));
    }
    return allSkills
      .filter((s) => s.type === 'Soft Skill')
      .map((s) => (
        <button
          key={s.tag_id}
          className={`tag-button tag-button-purple-${isTagSelected(s.tag_id, s.label, currentTagsTab)}`}
          onClick={(e) => handleTagSelect(e)}
        >
          <i
            className={
              isTagSelected(s.tag_id, s.label, currentTagsTab) === 'selected'
                ? 'fa fa-close'
                : 'fa fa-plus'
            }
          ></i>
          &nbsp;{s.label}
        </button>
      ));
  }, [searchedTags, currentTagsTab, allSkills, isTagSelected, handleTagSelect, allProjectTypes, allTags]);

  // Update shown tags according to search results
  const handleSearch = useCallback((results: (Tag | ProjectType)[][]) => {
    // setSearchResults(results);
    if (results.length === 0 && currentDataSet.length !== 0) {
      // no results or current data set
      setSearchedTags([]);
    }
    else {
      setSearchedTags(results[0]);
    }
  }, []);

  // --- Complete component ---
  return (
    <div id="project-editor-tags">
      <div id="project-editor-type-tags">
        <div className="project-editor-section-header">Project Type</div>
        {modifiedProject.project_types.length === 0 ? <div className="error">*At least 1 type is required</div> : <></> }
        <div id="project-editor-type-tags-container">
          {modifiedProject.project_types.map((t) => (
            <button key={t.project_type} className={`tag-button tag-button-blue-selected`} onClick={(e) => handleTagSelect(e)}>
              <i className="fa fa-close"></i>
              &nbsp;{t.project_type}
            </button>
          ))}
        </div>
      </div>

      <div id="project-editor-selected-tags">
        <div className="project-editor-section-header">Selected Tags</div>
        <div className="project-editor-extra-info">
          Drag and drop to reorder. The first 2 tags will be displayed on your project's
          discover card.
        </div>
        {modifiedProject.tags.length === 0 ? <div className="error">*At least 1 tag is required</div> : <></> }
        <div id="project-editor-selected-tags-container">
          <hr id="selected-tag-divider" />
          {/* TODO: Separate top 2 tags from others with hr element */}
          { loadProjectTags }
        </div>
      </div>

      <div id="project-editor-tag-search">
        <SearchBar key={currentTagsTab} dataSets={currentDataSet} onSearch={(results) => handleSearch(results)} />
        <div id="project-editor-tag-wrapper">
          <div id="project-editor-tag-search-tabs">
            <button
              onClick={() => {setCurrentTagsTab(0);}}
              className={`button-reset project-editor-tag-search-tab ${currentTagsTab === 0 ? 'tag-search-tab-active' : ''}`}
              //Data from genres
            >
              Project Type
            </button>
            <button
              onClick={() => {setCurrentTagsTab(1); }}
              className={`button-reset project-editor-tag-search-tab ${currentTagsTab === 1 ? 'tag-search-tab-active' : ''}`}
              //Data from tags
            >
              Genre
            </button>
            <button
              onClick={() => {setCurrentTagsTab(2); }}
              className={`button-reset project-editor-tag-search-tab ${currentTagsTab === 2 ? 'tag-search-tab-active' : ''}`}
              //Data from skills (type=Developer)
            >
              Developer Skills
            </button>
            <button
              onClick={() => {setCurrentTagsTab(3); }}
              className={`button-reset project-editor-tag-search-tab ${currentTagsTab === 3 ? 'tag-search-tab-active' : ''}`}
              //Data from skills (type=Designer)
            >
              Designer Skills
            </button>
            <button
              onClick={() => {setCurrentTagsTab(4); }}
              className={`button-reset project-editor-tag-search-tab ${currentTagsTab === 4 ? 'tag-search-tab-active' : ''}`}
              //Data from skills (type=Soft)
            >
              Soft Skills
            </button>
          </div>
          <hr id="tag-search-divider" />
        </div>
        <div id="project-editor-tag-search-container">{renderTags()}</div>
      </div>
    </div>
  );
};