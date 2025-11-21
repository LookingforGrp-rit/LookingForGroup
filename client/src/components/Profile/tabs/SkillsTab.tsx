/*
  This class is copied from skillsTab in the ProjectCreatorEditor tabs
  Currently, this tab does not work
  Feel free to replace this entire file, or try and debug the code
  */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { SearchBar } from '../../SearchBar';
import { getSkills } from '../../../api/users';
import { MeDetail, Skill, SkillProficiency, SkillType } from '@looking-for-group/shared';


const skillTabs = ['Developer Skills', 'Design Skills', 'Soft Skills'];

const getSkillColor = (type: string) => {
  // Returns the skille color based on what skill it is
  if (type === 'Developer') {
    return 'yellow';
  } else if (type === 'Designer') {
    return 'red';
  } else {
    // Soft Skill
    return 'purple';
  }
}

export const SkillsTab = ({
  profile, setProfile}: 
  {profile: MeDetail; setProfile: React.Dispatch<React.SetStateAction<MeDetail>>}) => {
  // States
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  // Tracks which tab we are currently on
  const [currentSkillsTab, setCurrentSkillsTab] = useState(0);
  // filtered results from skill search bar
  const [searchedSkills, setSearchedSkills] = useState<(Skill)[]>([]);

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
        return [{ data: allSkills.filter((s) => s.type === 'Developer') }];
      case 1:
        return [{ data: allSkills.filter((s) => s.type === 'Designer') }];
      case 2:
        return [{ data: allSkills.filter((s) => s.type === 'Soft') }];
      default:
        return [{ data: [] }];
    }
  }, [currentSkillsTab, allSkills]);

  // Reset skill list on tab change to default list
  useEffect(() => {
    const defaultSkills = currentDataSet[0]?.data ?? [];
    setSearchedSkills(defaultSkills);
  }, [currentSkillsTab, currentDataSet])

  // Find if a skill is present on the project
  const isSkillSelected = useCallback((id: number, label: string, tab: number = -1) => {
    const skills = profile?.skills ?? [];

    // Developer Skills
    if (tab === 0) {
      return skills.some(t => t.skillId === id && t.label === label) ?
        'selected' : 'unselected';
    }
    // Designer Skills
    if (tab === 1) {
      return skills.some(t => t.skillId === id && t.label === label) ?
        'selected' : 'unselected';
    }
    // Soft Skills
    if (tab === 2) {
      return skills.some(t => t.skillId === id && t.label === label) ?
        'selected' : 'unselected';
    }
    return 'unselected';
  }, [profile]);

  const handleSkillSelect = useCallback((e: any) => {
    // prevent page from immediately re-rendering
    e.preventDefault();

    // trim whitespace to get skill name
    // take closest button to allow click on icon
    const button = e.target.closest('button');
    const skill: string = button.innerText.trim();

    // if skill is unselected
    if (button.className.includes('unselected')) {
      // get skill id and type according to type of skill
      let id: number = -1;
      let type: SkillType = 'Developer';

      if (button.className.includes('yellow')) { // developer skills
        id = allSkills.find((s) => s.type === 'Developer' && s.label === skill)?.skillId ?? -1;
        type = 'Developer';
      }
      else if (button.className.includes('red')) { // designer skills
        id = allSkills.find((s) => s.type === 'Designer' && s.label === skill)?.skillId ?? -1;
        type = 'Designer';
      }
      else if (button.className.includes('purple')) { // soft skills
        id = allSkills.find((s) => s.type === 'Soft' && s.label === skill)?.skillId ?? -1;
        type = 'Soft';
      }

      // error check: no skill found
      if (id === -1) {
        return;
      }
      //we have to implement proficiency

      // Update selected skills with new ones
      setProfile((prev) => ({
        ...prev,
        skills: [
          ...(prev.skills ?? []),
          {
            skillId: id,
            type: type,
            label: skill,
            position: 0, //this isn't over, position parameter.
            proficiency: "Novice" as SkillProficiency, //we'll get to this later
            apiUrl: ''
          } 
        ]
      }));

    }
    // if skill is selected
    else {
      // remove skill from project
      setProfile((prev) => ({
        ...prev,
        skills: (prev.skills ?? []).filter((s) => s.label !== skill),
      }));
    }
  }, [allSkills, profile]);

  // Load projects
  const loadProfileSkills = useMemo(() => {
    if (!profile?.skills) return [];

    return profile.skills
      .map((s) => (
        <button key={s.label} className={`tag-button tag-button-${getSkillColor(s.type)}-selected`} onClick={(e) => handleSkillSelect(e)}>
          <i className="fa fa-close"></i>
          <p>&nbsp;{s.label}</p>
        </button>
      ))
  }, [profile.skills, handleSkillSelect]);

  // Create element for each skill
  const renderSkills = useCallback(() => {
    // no search item, render all skills
    if (searchedSkills && searchedSkills.length !== 0) {
      return (
        searchedSkills.map(t => {
          // get id according to type of skill
          //???
          const id: number = t.skillId;

          return (
            <button
              key={id}
              className={`tag-button tag-button-${'type' in t ? getSkillColor(t.type) : 'blue'}-${isSkillSelected(
                id,
                t.label,
                currentSkillsTab
              )}`}
              onClick={(e) => handleSkillSelect(e)}
            >
              <i
                className={
                  isSkillSelected(id, t.label, currentSkillsTab) === 'selected'
                    ? 'fa fa-close'
                    : 'fa fa-plus'
                }
              ></i>
              <p>&nbsp;{t.label}</p>
            </button>
          );
        })
      )
    }
    else if (searchedSkills && searchedSkills.length === 0) {
      return <div className="no-results-message">No results found!</div>;
    }
    // Developer Skill
    if (currentSkillsTab === 0) {
      return allSkills
        .filter((s) => s.type === 'Developer')
        .map((s) => (
          <button
            key={s.skillId}
            className={`tag-button tag-button-yellow-${isSkillSelected(s.skillId, s.label, currentSkillsTab)}`}
            onClick={(e) => handleSkillSelect(e)}
          >
            <i
              className={
                isSkillSelected(s.skillId, s.label, currentSkillsTab) === 'selected'
                  ? 'fa fa-close'
                  : 'fa fa-plus'
              }
            ></i>
            &nbsp;{s.label}
          </button>
        ));
    } else if (currentSkillsTab === 1) {
      return allSkills
        .filter((s) => s.type === 'Designer')
        .map((s) => (
          <button
            key={s.skillId}
            className={`tag-button tag-button-red-${isSkillSelected(s.skillId, s.label, currentSkillsTab)}`}
            onClick={(e) => handleSkillSelect(e)}
          >
            <i
              className={
                isSkillSelected(s.skillId, s.label, currentSkillsTab) === 'selected'
                  ? 'fa fa-close'
                  : 'fa fa-plus'
              }
            ></i>
            &nbsp;{s.label}
          </button>
        ));
    }
    else {
      return allSkills
        .filter((s) => s.type === 'Soft')
        .map((s) => (
          <button
            key={s.skillId}
            className={`tag-button tag-button-purple-${isSkillSelected(s.skillId, s.label, currentSkillsTab)}`}
            onClick={(e) => handleSkillSelect(e)}
          >
            <i
              className={
                isSkillSelected(s.skillId, s.label, currentSkillsTab) === 'selected'
                  ? 'fa fa-close'
                  : 'fa fa-plus'
              }
            ></i>
            <p>&nbsp;{s.label}</p>
          </button>
        ));
    }
  }, [searchedSkills, currentSkillsTab, allSkills, isSkillSelected, handleSkillSelect]);

  const handleSearch = useCallback((results: (Skill)[][]) => {
    // setSearchResults(results);
    console.log('handling search');
    console.log('results', results);
    // show no results
    if (!results || results.length === 0 || results[0].length === 0) {
      console.log('no results or current data set');
      setSearchedSkills([]);
    }
    else {
      setSearchedSkills(results[0]);
    }
  }, []);

  // Components
  const SkillSearchTabs = () => {
    const tabs = skillTabs.map((skill, i) => {
      return (
        <button
          key={skill}
          type="button"
          onClick={() => setCurrentSkillsTab(i)}
          className={`button-reset project-editor-tag-search-tab ${currentSkillsTab === i ? 'tag-search-tab-active' : ''}`}
        >
          {skill}
        </button>
      );
    })
    return (
      <div id="project-editor-tag-search-tabs">
        {tabs}
      </div>
    );
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
        <SearchBar key={currentSkillsTab} dataSets={currentDataSet} onSearch={(results) => handleSearch(results as unknown[][] as Skill[][])} />
        <div id="project-editor-tag-wrapper">
          <SkillSearchTabs />
          <hr id="tag-search-divider" />
        </div>
        <div id="project-editor-tag-search-container">{renderSkills()}</div>
      </div>
    </div>
  );
};