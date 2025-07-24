import React, { useState, useEffect } from 'react';
import { PagePopup, openClosePopup } from '../PagePopup';
// import { Popup, PopupContent, PopupButton } from "../Popup"; // Unused because I got confused while trying to use it and couldn't get it to work


//backend base url for getting images
const API_BASE = `http://localhost:8081`;

/*
TO DO: 
 - Convert currentPFPLink to a useEffect instead of a useState 
*/



// On click, this button should open the Profile Edit modal
const EditButton = ({ userData }) => {
  // console.log(userData);

  const [showPopup, setShowPopup] = useState(false);

  // "About"
  const [rolesList, setRolesList] = useState();
  const [majorsList, setMajorsList] = useState();

  const getJobTitles = async () => {
    const url = '/api/datasets/job-titles';

    try {
      const response = await fetch(url);

      const rawData = await response.json();
      setRolesList(rawData.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getMajors = async () => {
    const url = '/api/datasets/majors';

    try {
      const response = await fetch(url);

      const rawData = await response.json();
      setMajorsList(rawData.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (rolesList === undefined) {
    getJobTitles();
  }
  if (majorsList === undefined) {
    getMajors();
  }

  // const [currentPFPLink, setCurrentPFPLink] = useState(require(`../../../../server/images/profiles/${userData.profile_image}`));
  const [currentPFPLink, setCurrentPFPLink] = useState(
    `${API_BASE}/images/profiles/${userData.profile_image}`
  );
  const [currentFirstName, setCurrentFirstName] = useState(userData.first_name);
  const [currentLastName, setCurrentLastName] = useState(userData.last_name);
  const [currentPronouns, setCurrentPronouns] = useState(userData.pronouns);
  const [currentRole, setCurrentRole] = useState(userData.job_title);
  const [currentMajor, setCurrentMajor] = useState(userData.major);
  const [currentYear, setCurrentYear] = useState(userData.academic_year);
  const [currentLocation, setCurrentLocation] = useState(userData.location);
  const [currentQuote, setCurrentQuote] = useState(userData.headline);
  const [currentFunFact, setCurrentFunFact] = useState(userData.fun_fact);
  const [currentAbout, setCurrentAbout] = useState(userData.bio);

  const getOrdinal = (index: number) => {
    if (index === 1) {
      return '1st';
    }
    if (index === 2) {
      return '2nd';
    }
    if (index === 3) {
      return '3rd';
    }
    return `${index}th`;
  };

  const yearOptions = [<option value="blank"></option>];
  for (let i = 0; i < 10; i++) {
    // The "10" can be replaced with any value we choose to use as the maximum number of years
    yearOptions.push(<option value={getOrdinal(i + 1)}>{getOrdinal(i + 1)}</option>);
  }

  const getImage = async (theImageName: string) => {
    const url = `${API_BASE}/images/profiles/${theImageName}`;
    setCurrentPFPLink(url);
  };

  /*if (currentPFPLink === undefined) {
        getImage(userData.profile_image);
    }*/

  const uploadNewImage = async (theInput) => {
    const form = document.querySelector('.edit-region-button-wrapper.photo');
    if (
      form !== undefined &&
      form !== null &&
      theInput.files !== undefined &&
      theInput.files !== null &&
      theInput.files.length > 0
    ) {
      const fileForm = new FormData(form);

      const url = `/api/users/${userData.user_id}/profile-picture`;
      try {
        const response = await fetch(url, {
          method: 'PUT',
          body: fileForm,
        });

        console.log(`User data: Response status: ${response.status}`);

        const rawData = await response.json();
        console.log(rawData);
        getImage(rawData.data[0].profile_image);

        // const file = theInput.files[0];
        // const reader = new FileReader();
        // reader.onload = function(e) {
        //     if (e.target !== null) {
        //         const imageDataURL = e.target.result;
        //         setCurrentPFPLink(imageDataURL);
        //     }
        // };
        // reader.readAsDataURL(file);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const page1 = (
    <div className="edit-profile-body about">
      <div className="edit-profile-section-1">
        {/* Profile Pic */}
        <div className="edit-region photo">
          <div className="edit-region-image photo">
            <img
              className="edit-region-photo photo"
              src={currentPFPLink}
              alt={`${currentFirstName}'s Profile Pic`}
            ></img>
            <div className="edit-region-button-div photo">
              <form className="edit-region-button-wrapper photo">
                <div className="edit-region-fake-button photo">
                  <img src="assets/white/upload_image.png" alt="upload image" />
                </div>
                <input
                  type="file"
                  className="edit-region-button photo"
                  name="image"
                  accept="image/*"
                  onChange={(e) => {
                    uploadNewImage(e.target);
                  }}
                ></input>
              </form>
            </div>
          </div>
        </div>

        <div className="about-row row-1">
          {/* First Name */}
          <div className="edit-region first-name">
            <div className="edit-region-header first-name">First Name*</div>
            <input
              type="text"
              className="edit-region-input first-name"
              value={currentFirstName}
              onChange={(e) => {
                setCurrentFirstName(e.target.value);
              }}
            ></input>
          </div>

          {/* Last Name */}
          <div className="edit-region last-name">
            <div className="edit-region-header last-name">Last Name*</div>
            <input
              type="text"
              className="edit-region-input last-name"
              value={currentLastName}
              onChange={(e) => {
                setCurrentLastName(e.target.value);
              }}
            ></input>
          </div>

          {/* Pronouns */}
          <div className="edit-region pronouns">
            <div className="edit-region-header pronouns">Pronouns</div>
            <input
              type="text"
              className="edit-region-input pronouns"
              value={currentPronouns}
              onChange={(e) => {
                setCurrentPronouns(e.target.value);
              }}
            ></input>
          </div>
        </div>

        <div className="about-row row-2">
          {/* Role */}
          <div className="edit-region role">
            <div className="edit-region-header role">Role*</div>
            <select
              className="edit-region-input role"
              value={currentRole}
              onChange={(e) => {
                setCurrentRole(e.target.value);
              }}
            >
              <option value="none" disabled>
                Select
              </option>
              {rolesList === undefined
                ? ''
                : rolesList.map((roleItem) => {
                    return <option value={roleItem.label}>{roleItem.label}</option>;
                  })}
            </select>
          </div>

          {/* Major */}
          <div className="edit-region major">
            <div className="edit-region-header major">Major*</div>
            <select
              className="edit-region-input major"
              value={currentMajor}
              onChange={(e) => {
                setCurrentMajor(e.target.value);
              }}
            >
              <option value="none" disabled>
                Select
              </option>
              {majorsList === undefined
                ? ''
                : majorsList.map((majorItem) => {
                    return <option value={majorItem.label}>{majorItem.label}</option>;
                  })}
            </select>
          </div>

          {/* Year */}
          <div className="edit-region year">
            <div className="edit-region-header year">Year</div>
            <select
              className="edit-region-input year"
              value={currentYear}
              onChange={(e) => {
                setCurrentYear(e.target.value);
              }}
            >
              {yearOptions}
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="edit-region location">
          <div className="edit-region-header location">Location</div>
          <input
            type="text"
            className="edit-region-input location"
            value={currentLocation}
            onChange={(e) => {
              setCurrentLocation(e.target.value);
            }}
          ></input>
        </div>
      </div>

      <div className="edit-profile-section-2">
        {/* Personal Quote */}
        <div className="edit-region quote">
          <div className="edit-region-header quote">Personal Quote</div>
          <div className="edit-region-instruct quote">
            Write a fun and catchy phrase that captures your unique personality!
          </div>
          <div className="edit-region-text-area quote">
            <textarea
              className="edit-region-input big quote"
              maxLength={100}
              value={currentQuote.substring(0, 100)}
              onChange={(e) => {
                setCurrentQuote(e.target.value);
              }}
            ></textarea>
            <span className="word-limit-label quote">{currentQuote.length} / 100</span>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="edit-region fact">
          <div className="edit-region-header fact">Fun Fact</div>
          <div className="edit-region-instruct fact">
            Share a fun fact about yourself thata will surprise others!
          </div>
          <div className="edit-region-text-area fact">
            <textarea
              className="edit-region-input big fact"
              maxLength={100}
              value={currentFunFact.substring(0, 100)}
              onChange={(e) => {
                setCurrentFunFact(e.target.value);
              }}
            ></textarea>
            <span className="word-limit-label fact">{currentFunFact.length} / 100</span>
          </div>
        </div>
      </div>

      <div className="edit-profile-section-3">
        {/* About You */}
        <div className="edit-region you">
          <div className="edit-region-header you">About You</div>
          <div className="edit-region-instruct you">
            Share a brief overview of who you are, your interests, and what drives you!
          </div>
          <div className="edit-region-text-area you">
            <textarea
              className="edit-region-input big you"
              maxLength={600}
              value={currentAbout.substring(0, 600)}
              onChange={(e) => {
                setCurrentAbout(e.target.value);
              }}
            ></textarea>
            <span className="word-limit-label you">{currentAbout.length} / 600</span>
          </div>
        </div>
      </div>
    </div>
  );

  // "Projects"
  const [userProjects, setUserProjects] = useState();
  const [shownProjects, setShownProjects] = useState();

  const getUsersProjects = async () => {
    const url = `/api/users/${userData.user_id}/projects`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const rawData = await response.json();
      setUserProjects(rawData.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getVisibleProjects = async () => {
    const url = `/api/users/${userData.user_id}/projects/profile`;
    try {
      const response = await fetch(url);

      const rawData = await response.json();
      setShownProjects(rawData.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (userProjects === undefined) {
    getUsersProjects();
  }
  if (shownProjects === undefined) {
    getVisibleProjects();
  }

  const checkIfProjectIsShown = (projectID: number) => {
    if (shownProjects !== undefined) {
      for (let i = 0; i < shownProjects.length; i++) {
        if (shownProjects[i].project_id === projectID) {
          return true;
        }
      }
      return false;
    }
    return false;
  };

  const updateHiddenProjects = (project) => {
    if (shownProjects !== undefined) {
      if (checkIfProjectIsShown(project.project_id)) {
        const tempList = new Array(0);
        for (let i = 0; i < shownProjects.length; i++) {
          if (shownProjects[i].project_id !== project.project_id) {
            tempList.push(shownProjects[i]);
          }
        }

        setShownProjects(tempList);
      } else {
        const tempList = new Array(0);
        for (let i = 0; i < shownProjects.length; i++) {
          tempList.push(shownProjects[i]);
        }
        tempList.push(project);

        setShownProjects(tempList);
      }
    }
  };

  const page2 = (
    <div className="edit-profile-body projects">
      <div className="edit-region projects">
        <div className="edit-region-header projects">Projects</div>
        <div className="edit-region-instruct projects">
          Choose to hide/show projects you've worked on.
        </div>
        <div className="edit-region-input projects">
          {userProjects !== undefined && shownProjects !== undefined
            ? userProjects.map((project) => {
                if (project.thumbnail === null || project.thumbnail == '') {
                  return (
                    <div className="list-project">
                      <div className="inner-list-project">{project.title}</div>
                      <div className="list-project-hide-icon">
                        <button
                          className="list-project-hide-icon-button"
                          onClick={(e) => {
                            updateHiddenProjects(project);
                          }}
                        >
                          {checkIfProjectIsShown(project.project_id) ? (
                            <i className="fa-solid fa-eye"></i>
                          ) : (
                            <i className="fa-solid fa-eye-slash"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  const projectURL = `${API_BASE}/images/thumbnails/${project.thumbnail}`;
                  return (
                    <div className="list-project">
                      <div className="inner-list-project">
                        <img
                          className="list-project-photo"
                          src={projectURL}
                          alt={`${project.title}'s Thumbnail`}
                        ></img>
                      </div>
                      <div className="list-project-hide-icon">
                        <button
                          className="list-project-hide-icon-button"
                          onClick={(e) => {
                            updateHiddenProjects(project);
                          }}
                        >
                          {checkIfProjectIsShown(project.project_id) ? (
                            <i className="fa-solid fa-eye"></i>
                          ) : (
                            <i className="fa-solid fa-eye-slash"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                }
              })
            : ''}
        </div>
      </div>
    </div>
  );

  // "Skills"
  if (userData.skills == null) {
    userData.skills = [];
  }

  const [currentSkills, setCurrentSkills] = useState(
    userData.skills.toSorted((a, b) => a.position - b.position)
  );

  const addToSkillsList = (newSkill) => {
    if (userData.skills != null) {
      let found = false;
      for (let i = 0; i < currentSkills.length; i++) {
        if (currentSkills[i].type == newSkill.type && currentSkills[i].skill == newSkill.skill) {
          found = true;
        }
      }

      if (!found) {
        const tempList = new Array(0);
        for (let i = 0; i < currentSkills.length; i++) {
          tempList.push(currentSkills[i]);
        }
        tempList.push(newSkill);
        tempList.sort((a, b) => a.position - b.position);

        for (let i = 0; i < tempList.length; i++) {
          if (tempList[i].position > i + 1) {
            tempList[i].position = i + 1;
          }
        }

        setCurrentSkills(tempList);
      }
    }
  };

  const removeFromSkillsList = (index: number) => {
    const tempList = new Array(0);
    for (let i = 0; i < currentSkills.length; i++) {
      if (i != index) {
        tempList.push(currentSkills[i]);
      }
    }
    tempList.sort((a, b) => a.position - b.position);

    for (let i = 0; i < tempList.length; i++) {
      if (tempList[i].position > i + 1) {
        tempList[i].position = i + 1;
      }
    }

    setCurrentSkills(tempList);
  };

  const editSkillPosition = (index: number, newPos: number) => {
    if (index + 1 === newPos || index + 1 === newPos - 1) {
      setCurrentSkills(currentSkills);
    } else {
      const tempList = [
        {
          id: currentSkills[index].id,
          type: currentSkills[index].type,
          skill: currentSkills[index].skill,
          position: newPos,
        },
      ];
      for (let i = 0; i < currentSkills.length; i++) {
        if (i != index) {
          if (currentSkills[i].position >= newPos) {
            tempList.push({
              id: currentSkills[i].id,
              type: currentSkills[i].type,
              skill: currentSkills[i].skill,
              position: currentSkills[i].position + 1,
            });
          } else {
            tempList.push(currentSkills[i]);
          }
        }
      }
      tempList.sort((a, b) => a.position - b.position);

      for (let i = 0; i < tempList.length; i++) {
        if (tempList[i].position > i + 1) {
          tempList[i].position = i + 1;
        }
      }

      setCurrentSkills(tempList);
    }
  };

  const allowDrop = (ev) => {
    ev.preventDefault();
    ev.target.style.borderColor = 'black';
  };

  const disallowDrop = (ev) => {
    ev.preventDefault();
    ev.target.style.borderColor = '#00000000';
  };

  const drag = (ev) => {
    ev.dataTransfer.setData('text', ev.target.id);
  };

  const drop = (ev) => {
    ev.preventDefault();
    ev.target.style.borderColor = '#00000000';
    const data = ev.dataTransfer.getData('text');

    const theSkill = document.querySelector(`#${data}`);
    if (theSkill !== undefined && theSkill !== null) {
      const thePos = parseInt(theSkill.id.substring(4));
      const theSpot = parseInt(ev.target.id.substring(4));
      editSkillPosition(thePos - 1, theSpot);
    }
  };

  const mySkillsList = new Array(0);
  mySkillsList.push(
    <span
      className="chosen-gap"
      id="spot1"
      key="key-1"
      onDrop={(e) => {
        drop(e);
      }}
      onDragOver={(e) => {
        allowDrop(e);
      }}
      onDragLeave={(e) => {
        disallowDrop(e);
      }}
    ></span>
  );
  for (let i = 0; i < currentSkills.length; i++) {
    if (currentSkills[i].skill != '') {
      // Skill
      let chosenClass = 'skill-item chosen';
      chosenClass += ` ${currentSkills[i].type.toLowerCase().substring(0, 4)}`;
      mySkillsList.push(
        <div
          className="chosen-item"
          id={'drag' + (i + 1)}
          key={'skill' + i}
          draggable="true"
          onDragStart={(e) => {
            drag(e);
          }}
        >
          ≡
          <span className={chosenClass}>
            <button
              className="chosen-button"
              onClick={(e) => {
                removeFromSkillsList(i);
              }}
            >
              X
            </button>
            {currentSkills[i].skill}
          </span>
        </div>
      );

      // Gap
      const newGap = (
        <span
          className="chosen-gap"
          id={'spot' + (i + 2)}
          key={'key' + i}
          onDrop={(e) => {
            drop(e);
          }}
          onDragOver={(e) => {
            allowDrop(e);
          }}
          onDragLeave={(e) => {
            disallowDrop(e);
          }}
        ></span>
      );
      mySkillsList.push(newGap);
    }
  }

  const displayedSkillsList = <div className="chosen-skills-list">{mySkillsList}</div>;

  const [currentSearch, setCurrentSearch] = useState('');
  const [skillsList, setSkillsList] = useState();

  const getSkillsList = async (type: string) => {
    if (
      type.toLowerCase() === 'developer' ||
      type.toLowerCase() === 'designer' ||
      type.toLowerCase() === 'soft'
    ) {
      const url = `/api/datasets/skills?type=${type.toLowerCase()}`;
      try {
        const response = await fetch(url);

        const rawData = await response.json();
        setSkillsList(
          rawData.data.toSorted((a, b) => {
            if (a.label.toLowerCase() < b.label.toLowerCase()) {
              return -1;
            }
            if (a.label.toLowerCase() > b.label.toLowerCase()) {
              return 1;
            }
            return 0;
          })
        );
      } catch (error) {
        console.log(error);
      }
    } else {
      const url = `/api/datasets/skills`;
      try {
        const response = await fetch(url);

        const rawData = await response.json();
        setSkillsList(rawData.data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (skillsList === undefined) {
    getSkillsList('developer');
  }

  const [filterSel, setFilterSel] = useState(0);
  // 0 -> Developer Skills -> Hard Skills
  // 1 -> Designer Skills -> Proficiencies
  // 2 -> Soft Skills -> Soft Skills
  const changeFilter = (val: number) => {
    if (currentSearch === '') {
      setFilterSel(val);
      switch (val) {
        case 0:
          getSkillsList('developer');
          break;

        case 1:
          getSkillsList('designer');
          break;

        case 2:
          getSkillsList('soft');
          break;
      }
    }
  };

  const filterButton1 = (
    <button
      className="skills-filter-button"
      id={filterSel === 0 ? 'selected' : ''}
      onClick={() => changeFilter(0)}
    >
      Developer Skills
    </button>
  );
  const filterButton2 = (
    <button
      className="skills-filter-button"
      id={filterSel === 1 ? 'selected' : ''}
      onClick={() => changeFilter(1)}
    >
      Designer Skills
    </button>
  );
  const filterButton3 = (
    <button
      className="skills-filter-button"
      id={filterSel === 2 ? 'selected' : ''}
      onClick={() => changeFilter(2)}
    >
      Soft Skills
    </button>
  );

  let filteredSkillsListDisplay = <div className="skills-list"></div>;
  if (currentSearch !== '') {
    filteredSkillsListDisplay = (
      <div className="skills-list">
        {skillsList === undefined
          ? ''
          : skillsList.map((skillItem) => {
              if (
                skillItem.label.substring(0, currentSearch.length).toLowerCase() ==
                currentSearch.toLowerCase()
              ) {
                let skillClass = `skill-item-button ${skillItem.type.toLowerCase().substring(0, 4)}`;
                let found = false;
                for (let i = 0; i < currentSkills.length; i++) {
                  if (currentSkills[i].skill == skillItem.label) {
                    found = true;
                  }
                }
                if (found) {
                  skillClass += ' chosen';
                }

                return (
                  <button
                    className={skillClass}
                    onClick={(e) => {
                      addToSkillsList({
                        id: skillItem.skill_id,
                        type: skillItem.type,
                        skill: skillItem.label,
                        position: currentSkills.length + 1,
                      });
                    }}
                  >
                    {found ? '✓' : '+'}&nbsp;&nbsp;&nbsp;{skillItem.label}
                  </button>
                );
              }
            })}
      </div>
    );
  } else {
    filteredSkillsListDisplay = (
      <div className="skills-list">
        {skillsList === undefined
          ? ''
          : skillsList.map((skillItem) => {
              let skillClass = `skill-item-button ${skillItem.type.toLowerCase().substring(0, 4)}`;
              let found = false;
              for (let i = 0; i < currentSkills.length; i++) {
                if (currentSkills[i].skill == skillItem.label) {
                  found = true;
                }
              }
              if (found) {
                skillClass += ' chosen';
              }

              return (
                <button
                  className={skillClass}
                  onClick={(e) => {
                    addToSkillsList({
                      id: skillItem.skill_id,
                      type: skillItem.type,
                      skill: skillItem.label,
                      position: currentSkills.length + 1,
                    });
                  }}
                >
                  {found ? '✓' : '+'}&nbsp;&nbsp;&nbsp;{skillItem.label}
                </button>
              );
            })}
      </div>
    );
  }

  const page3 = (
    <div className="edit-profile-body skills">
      <div className="edit-profile-skills-section">
        {/* Current skills area */}
        <div className="selected-skills-region">
          <div className="edit-region-header skills">Selected</div>
          <div className="edit-region-instruct skills">Drag and drop to reorder</div>
          {displayedSkillsList}
        </div>

        {/* All skills area */}
        <div className="skills-list-region">
          {/* Search Bar */}
          <div className="skills-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              className="skill-searchbar"
              value={currentSearch}
              onChange={(e) => {
                setCurrentSearch(e.target.value);
              }}
              placeholder="Search"
            ></input>
          </div>

          {/* Filter Tabs */}
          <div className="skills-header">
            {filterButton1}
            {filterButton2}
            {filterButton3}
          </div>

          {/* Skills List */}
          {filteredSkillsListDisplay}
        </div>
      </div>
    </div>
  );

  // "Links"
  const [currentLinks, setCurrentLinks] = useState(
    userData.socials == null ? [] : userData.socials
  );
  const [socialLinks, setSocialLinks] = useState();

  const getSocials = async () => {
    const url = `/api/datasets/socials`;
    try {
      const response = await fetch(url);

      const rawData = await response.json();
      setSocialLinks(rawData.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (socialLinks === undefined) {
    getSocials();
  }

  const getWebsiteIcon = (websiteName: string) => {
    switch (websiteName.toLowerCase()) {
      case 'instagram':
        return <>&#xf16d;</>;
        break;

      case 'x':
        return <>&#xe61b;</>;
        break;

      case 'facebook':
        return <>&#xf39e;</>;
        break;

      case 'discord':
        return <>&#xf392;</>;
        break;

      case 'bluesky':
        return <>&#xe671;</>;
        break;

      case 'linkedin':
        return <>&#xf08c;</>;
        break;

      case 'youtube':
        return <>&#xf167;</>;
        break;

      case 'steam':
        return <>&#xf1b6;</>;
        break;

      case 'itch':
        return <>&#xf83a;</>;
        break;

      case 'other':
        return <>&#xf0c1;</>;
        break;
    }
  };

  const getLinksDropDown = (currentSite: string, index: number) => {
    if (socialLinks !== undefined) {
      const socialsList = new Array(0);
      for (let i = 0; i < socialLinks.length; i++) {
        const tempLink = (
          <option value={socialLinks[i].label.toLowerCase()}>
            {getWebsiteIcon(socialLinks[i].label)} &nbsp; {socialLinks[i].label}
          </option>
        );
        socialsList.push(tempLink);
      }

      const dropDownList = (
        <select
          className="link-options-list"
          value={currentSite.toLowerCase()}
          onChange={(e) => {
            updateSite(index, e.target.value);
          }}
        >
          <option value="select">Select</option>
          {socialsList}
        </select>
      );

      return dropDownList;
    }
  };

  const getIdOfWebsite = (theSite: string) => {
    if (socialLinks !== undefined) {
      for (let i = 0; i < socialLinks.length; i++) {
        if (socialLinks[i].label == theSite) {
          return socialLinks[i].website_id;
        }
      }
      return 0;
    }
    return 0;
  };

  const addNewLink = () => {
    const tempList = new Array(0);
    for (let i = 0; i < currentLinks.length; i++) {
      tempList.push(currentLinks[i]);
    }
    tempList.push({ id: 0, website: 'select', url: '' });
    setCurrentLinks(tempList);
  };

  const removeLink = (index: number) => {
    const tempList = new Array(0);
    for (let i = 0; i < currentLinks.length; i++) {
      if (i !== index) {
        tempList.push(currentLinks[i]);
      }
    }
    setCurrentLinks(tempList);
  };

  const updateSite = (index: number, newSite: string) => {
    const tempList = new Array(0);
    for (let i = 0; i < currentLinks.length; i++) {
      if (i === index) {
        tempList.push({ id: getIdOfWebsite(newSite), website: newSite, url: currentLinks[i].url });
      } else {
        tempList.push(currentLinks[i]);
      }
    }
    setCurrentLinks(tempList);
  };

  const updateURL = (index: number, newURL: string) => {
    const tempList = new Array(0);
    for (let i = 0; i < currentLinks.length; i++) {
      if (i === index) {
        tempList.push({ id: currentLinks[i].id, website: currentLinks[i].website, url: newURL });
      } else {
        tempList.push(currentLinks[i]);
      }
    }
    setCurrentLinks(tempList);
  };

  const page4 = (
    <div className="edit-profile-body links">
      <div className="edit-profile-section">
        <div className="edit-region links">
          <div className="edit-region-header links">Social Links</div>
          <div className="edit-region-instruct links">
            Provide the links to pages you wish to include on your page.
          </div>
          <div className="edit-region-links-list">
            {currentLinks == null
              ? ''
              : currentLinks.map((linkItem, index: number) => {
                  return (
                    <div className="edit-region-link-item">
                      {getLinksDropDown(linkItem.website, index)}
                      <div className="edit-region-input links">
                        <input
                          type="text"
                          className="edit-region-input-text"
                          placeholder="URL"
                          value={linkItem.url}
                          onChange={(e) => {
                            updateURL(index, e.target.value);
                          }}
                        ></input>
                        <button
                          className="remove-button"
                          onClick={(e) => {
                            removeLink(index);
                          }}
                        >
                          —
                        </button>
                      </div>
                    </div>
                  );
                })}
            <div className="edit-region-button-section links">
              <button
                className="edit-region-button links"
                onClick={(e) => {
                  addNewLink();
                }}
              >
                + <em>Add social profile</em>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Overall page
  const [page, setPage] = useState(1);

  let displayedPage = <></>;
  if (page === 1) {
    displayedPage = page1;
  } else if (page === 2) {
    displayedPage = page2;
  } else if (page === 3) {
    displayedPage = page3;
  } else if (page === 4) {
    displayedPage = page4;
  }

  let button1 = (
    <button className="profile-discover-button" onClick={() => setPage(1)}>
      About
    </button>
  );
  if (page === 1) {
    button1 = (
      <button className="profile-discover-button" id="selected" onClick={() => setPage(1)}>
        About
      </button>
    );
  }
  let button2 = (
    <button className="profile-discover-button" onClick={() => setPage(2)}>
      Projects
    </button>
  );
  if (page === 2) {
    button2 = (
      <button className="profile-discover-button" id="selected" onClick={() => setPage(2)}>
        Projects
      </button>
    );
  }
  let button3 = (
    <button className="profile-discover-button" onClick={() => setPage(3)}>
      Skills
    </button>
  );
  if (page === 3) {
    button3 = (
      <button className="profile-discover-button" id="selected" onClick={() => setPage(3)}>
        Skills
      </button>
    );
  }
  let button4 = (
    <button className="profile-discover-button" onClick={() => setPage(4)}>
      Links
    </button>
  );
  if (page === 4) {
    button4 = (
      <button className="profile-discover-button" id="selected" onClick={() => setPage(4)}>
        Links
      </button>
    );
  }

  const getRoleId = (roleName: string) => {
    if (rolesList !== undefined) {
      for (let i = 0; i < rolesList.length; i++) {
        if (rolesList[i].label == roleName) {
          return rolesList[i].title_id;
        }
      }
      return -1;
    }
  };

  const getMajorId = (majorName: string) => {
    if (majorsList !== undefined) {
      for (let i = 0; i < majorsList.length; i++) {
        if (majorsList[i].label == majorName) {
          return majorsList[i].major_id;
        }
      }
      return -1;
    }
  };

  const createSkillsList = () => {
    const tempList = new Array(0);
    for (let i = 0; i < currentSkills.length; i++) {
      tempList.push({ id: currentSkills[i].id, position: currentSkills[i].position });
    }
    return tempList;
  };

  const createLinksList = () => {
    const tempList = new Array(0);
    for (let i = 0; i < currentLinks.length; i++) {
      if (currentLinks[i].id !== 0) {
        tempList.push({ id: currentLinks[i].id, url: currentLinks[i].url });
      }
    }
    return tempList;
  };

  const saveData = async () => {
    // User
    await saveUserData();

    // Projects
    await saveProjectsPage();

    openClosePopup(showPopup, setShowPopup);

    window.location.reload();
  };

  const saveUserData = async () => {
    console.log("I'M BEING RAN HAHAHAAHAHAHAHAHAHH");
    const url = `/api/users/${userData.user_id}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: currentFirstName,
          lastName: currentLastName,
          headline: currentQuote,
          pronouns: currentPronouns,
          jobTitleId: getRoleId(currentRole),
          majorId: getMajorId(currentMajor),
          academicYear: currentYear,
          location: currentLocation,
          funFact: currentFunFact,
          bio: currentAbout,
          skills: createSkillsList(),
          socials: createLinksList(),
        }),
      });

      console.log(`User data: Response status: ${response.status}`);
    } catch (error) {
      console.log(error);
    }
  };

  const saveProjectsPage = async () => {
    if (userProjects !== undefined) {
      for (let i = 0; i < userProjects.length; i++) {
        const url = `/api/users/${userData.user_id}/projects/visibility`;
        try {
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              projectId: userProjects[i].project_id,
              visibility: checkIfProjectIsShown(userProjects[i].project_id) ? 'public' : 'private',
            }),
          });

          console.log(`Projects data #${i + 1}: Response status: ${response.status}`);
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  return (
    <div id="profile-edit-button-section">
      <button
        className="profile-edit-button"
        id="edit-profile-button"
        onClick={() => openClosePopup(showPopup, setShowPopup)}
      >
        Edit Profile
      </button>
      {/* <PopupButton buttonId={"profile-edit-button"} callback={() => setShowPopup}>Edit Profile</PopupButton> */}

      {/* The "Edit Profile" popup */}
      <PagePopup
        width={'1120px'}
        height={'850px'}
        popupId={0}
        zIndex={3}
        show={showPopup}
        setShow={setShowPopup}
      >
        <div id="edit-profile-modal">
          <div id="edit-profile-header">
            {button1}
            {button2}
            {button3}
            {button4}
          </div>

          <div id="edit-profile-content">{displayedPage}</div>

          <div id="edit-profile-save">
            {/* Save button */}
            <button
              className="edit-region-save-button"
              onClick={() => {
                saveData();
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </PagePopup>
      {/* <Popup children={content}></Popup> */}
    </div>
  );
};

export default EditButton;
