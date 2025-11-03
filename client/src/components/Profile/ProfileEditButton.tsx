import React, { useState, useEffect, JSX } from "react";
import { PagePopup, openClosePopup } from "../PagePopup";
import {
  getJobTitles,
  getMajors,
  getSkills,
  getSocials as fetchSocials,
  editUser,
  updateProjectVisibility,
  getVisibleProjects,
  getProjectsByUser,
} from "../../api/users";
// import { Popup, PopupContent, PopupButton } from "../Popup"; // Unused because I got confused while trying to use it and couldn't get it to work
import {
  MeDetail,
  UserSkill,
  MySocial,
  Role,
  Major,
  ProjectPreview,
  Social,
  MyMajor,
  AcademicYear,
  Skill,
} from "@looking-for-group/shared";

interface ProfileEditButtonProps {
  user: MeDetail;
}

type EditProfileData = Partial<MeDetail>;

//backend base url for getting images


/*
TO DO: 
 - Convert currentPFPLink to a useEffect instead of a useState 
*/

// On click, this button should open the Profile Edit modal
const EditButton: React.FC<ProfileEditButtonProps> = ({ user }) => {
  // console.log(user);

  const [showPopup, setShowPopup] = useState(false);

  // "About"
  const [rolesList, setRolesList] = useState<Role[]>();
  const [majorsList, setMajorsList] = useState<Major[]>();

  const getJobTitlesData = async () => {
    const response = await getJobTitles();
    if (response.data) {
      setRolesList(response.data as Role[]);
    }
  };

  const getMajorsData = async () => {
    const response = await getMajors();
    if (response.data) {
      setMajorsList(response.data as Major[]);
    }
  };
  

  useEffect(() => {
    getJobTitlesData();
    getMajorsData();
  }, []);

  // const [currentPFPLink, setCurrentPFPLink] = useState(require(`../../../../server/images/profiles/${user.profile_image}`));
  const [currentPFPLink, setCurrentPFPLink] = useState("");

  useEffect(() => {
    setCurrentPFPLink(`images/profiles/${user.profileImage}`);
  }, [user.profileImage]);

  const [currentEditData, setCurrentEditData] = useState<EditProfileData>(user as EditProfileData);

  const getOrdinal = (index: number) => {
    if (index === 1) {
      return "1st";
    }
    if (index === 2) {
      return "2nd";
    }
    if (index === 3) {
      return "3rd";
    }
    return `${index}th`;
  };

  const yearOptions = [<option value="blank"></option>];
  for (let i = 0; i < 10; i++) {
    // The "10" can be replaced with any value we choose to use as the maximum number of years
    yearOptions.push(
      <option value={getOrdinal(i + 1)}>{getOrdinal(i + 1)}</option>
    );
  }

  const getImage = async (theImageName: string) => {
    const url = `images/profiles/${theImageName}`;
    setCurrentPFPLink(url);
  };

  /*if (currentPFPLink === undefined) {
        getImage(user.profile_image);
    }*/

  const uploadNewImage = async (theInput: HTMLInputElement) => {
    const form = document.querySelector(".edit-region-button-wrapper.photo");
    if (
      form !== undefined &&
      form !== null &&
      theInput.files !== undefined &&
      theInput.files !== null &&
      theInput.files.length > 0
    ) {
      const file = theInput.files[0];

      try {
        const response = await editUser({profileImage: file});

        console.log(`User data: Response status: ${response.status}`);

        const rawData = response;
        console.log(rawData);
        if(rawData.data && rawData.data?.profileImage !== null) getImage(rawData.data.profileImage);

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
              alt={`${user.firstName}'s Profile Pic`}
            ></img>
            <div className="edit-region-button-div photo">
              <form className="edit-region-button-wrapper photo">
                <div className="edit-region-fake-button photo">
                  <img src="assets/upload_image.png" alt="upload image" />
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
              value={currentEditData.firstName ?? ""}
              onChange={(e) => {
                setCurrentEditData({
                  ...currentEditData,
                  firstName: e.target.value,
                });
              }}
            ></input>
          </div>

          {/* Last Name */}
          <div className="edit-region last-name">
            <div className="edit-region-header last-name">Last Name*</div>
            <input
              type="text"
              className="edit-region-input last-name"
              value={currentEditData.lastName ?? ""}
              onChange={(e) => {
                setCurrentEditData({
                  ...currentEditData,
                  lastName: e.target.value,
                });
              }}
            ></input>
          </div>

          {/* Pronouns */}
          <div className="edit-region pronouns">
            <div className="edit-region-header pronouns">Pronouns</div>
            <input
              type="text"
              className="edit-region-input pronouns"
              value={currentEditData.pronouns ?? ""}
              onChange={(e) => {
                setCurrentEditData({
                  ...currentEditData,
                  pronouns: e.target.value,
                });
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
              value={currentEditData.title ?? ""}
              onChange={(e) => {
                setCurrentEditData({
                  ...currentEditData,
                  title: e.target.value,
                });
              }}
            >
              <option value="none" disabled>
                Select
              </option>
              {rolesList === undefined
                ? ""
                : rolesList.map((roleItem) => {
                    return (
                      <option value={roleItem.label}>{roleItem.label}</option>
                    );
                  })}
            </select>
          </div>

          {/* Major */}
          <div className="edit-region major">
            <div className="edit-region-header major">Major*</div>
            <select
              className="edit-region-input major"
              value={currentEditData.majors ?? ""}
              onChange={(e) => {
                setCurrentEditData({
                  ...currentEditData,
                  majors: [e.target.value as unknown as MyMajor],
                });
              }}
            >
              <option value="none" disabled>
                Select
              </option>
              {majorsList === undefined
                ? ""
                : majorsList.map((majorItem) => {
                    return (
                      <option value={majorItem.label}>{majorItem.label}</option>
                    );
                  })}
            </select>
          </div>

          {/* Year */}
          <div className="edit-region year">
            <div className="edit-region-header year">Year</div>
            <select
              className="edit-region-input year"
              value={currentEditData.academicYear ?? ""}
              onChange={(e) => {
                setCurrentEditData({
                  ...currentEditData,
                  academicYear: e.target.value as unknown as AcademicYear,
                });
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
            value={currentEditData.location ?? ""}
            onChange={(e) => {
              setCurrentEditData({
                ...currentEditData,
                location: e.target.value,
              });
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
              value={currentEditData.headline ?? ""}
              onChange={(e) => {
                setCurrentEditData({
                  ...currentEditData,
                  headline: e.target.value,
                });
              }}
            ></textarea>
            <span className="word-limit-label quote">
              {currentEditData.headline?.length} / 100
            </span>
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
              value={currentEditData.funFact ?? ""}
              onChange={(e) => {
                setCurrentEditData({
                  ...currentEditData,
                  funFact: e.target.value,
                });
              }}
            ></textarea>
            <span className="word-limit-label fact">
              {currentEditData.funFact?.length} / 100
            </span>
          </div>
        </div>
      </div>

      <div className="edit-profile-section-3">
        {/* About You */}
        <div className="edit-region you">
          <div className="edit-region-header you">About You</div>
          <div className="edit-region-instruct you">
            Share a brief overview of who you are, your interests, and what
            drives you!
          </div>
          <div className="edit-region-text-area you">
            <textarea
              className="edit-region-input big you"
              maxLength={600}
              value={currentEditData.bio ?? ""}
              onChange={(e) => {
                setCurrentEditData({ ...currentEditData, bio: e.target.value });
              }}
            ></textarea>
            <span className="word-limit-label you">
              {currentEditData.bio?.length} / 600
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // "Projects"
  const [userProjects, setUserProjects] = useState<ProjectPreview[]>();
  const [shownProjects, setShownProjects] = useState<ProjectPreview[]>();

  // Fetches projects that are current on that profile
  useEffect(() => {
    const fetchUserProjects = async () => {
      const data = await getProjectsByUser();
      if (data.error) {
        return console.error("Failed to fetch user projects:", data.error);
      }
      if (data.data) setUserProjects(data.data);
    };
    fetchUserProjects();
  }, [user.userId]);

  // Fetches projects that are currently shown on profile
  useEffect(() => {
    const fetchVisibleProjects = async () => {
      const data = await getVisibleProjects(user.userId);
      if (data.error) {
        return console.error("Failed to fetch visible projects:", data.error);
      }
      if (data.data) setShownProjects(data.data);
    };
    fetchVisibleProjects();
  }, [user.userId]);

  const checkIfProjectIsShown = (projectID: number) => {
    return shownProjects?.some((p) => p.projectId === projectID) ?? false;
  };

  const toggleProjectVisibility = (project: ProjectPreview) => {
    if (!shownProjects) return;

    const isShown = checkIfProjectIsShown(project.projectId);
    setShownProjects(
      isShown
        ? shownProjects.filter((p) => p.projectId !== project.projectId)
        : [...shownProjects, project]
    );
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
                if (project.thumbnail === null) {
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
                          {checkIfProjectIsShown(project.projectId) ? (
                            <i className="fa-solid fa-eye"></i>
                          ) : (
                            <i className="fa-solid fa-eye-slash"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  const projectURL = `images/thumbnails/${project.thumbnail}`;
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
                          {checkIfProjectIsShown(project.projectId) ? (
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
            : ""}
        </div>
      </div>
    </div>
  );

  // "Skills"
  if (user.skills == null) {
    user.skills = [];
  }

  const [currentSkills, setCurrentSkills] = useState<UserSkill[]>(
    user.skills ?? []
  );

  const addToSkillsList = (newSkill: UserSkill) => {
    if (user.skills != null) {
      let found = false;
      for (let i = 0; i < currentSkills.length; i++) {
        if (
          currentSkills[i].type == newSkill.type &&
          currentSkills[i].label == newSkill.label
        ) {
          found = true;
        }
      }

      if (!found) {
        const tempList: UserSkill[] = [];
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
    const tempList: UserSkill[] = [];
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
      currentSkills[index].position++; //the position parameter.
      const tempList = [
        currentSkills[index],
      ];
      for (let i = 0; i < currentSkills.length; i++) {
        if (i != index) {
          if (currentSkills[i].position >= newPos) {
            currentSkills[i].position++;
            tempList.push(currentSkills[i]);
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
    ev.target.style.borderColor = "black";
  };

  const disallowDrop = (ev) => {
    ev.preventDefault();
    ev.target.style.borderColor = "#00000000";
  };

  const drag = (ev) => {
    ev.dataTransfer.setData("text", ev.target.id);
  };

  const drop = (ev) => {
    ev.preventDefault();
    ev.target.style.borderColor = "#00000000";
    const data = ev.dataTransfer.getData("text");

    const theSkill = document.querySelector(`#${data}`);
    if (theSkill !== undefined && theSkill !== null) {
      const thePos = parseInt(theSkill.id.substring(4));
      const theSpot = parseInt(ev.target.id.substring(4));
      editSkillPosition(thePos - 1, theSpot);
    }
  };

  const mySkillsList: JSX.Element[] = [];
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
    if (currentSkills[i].label != "") {
      // Skill
      let chosenClass = "skill-item chosen";
      chosenClass += ` ${currentSkills[i].type.toLowerCase().substring(0, 4)}`;
      mySkillsList.push(
        <div
          className="chosen-item"
          id={"drag" + (i + 1)}
          key={"skill" + i}
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
            {currentSkills[i].label}
          </span>
        </div>
      );

      // Gap
      const newGap = (
        <span
          className="chosen-gap"
          id={"spot" + (i + 2)}
          key={"key" + i}
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

  const displayedSkillsList = (
    <div className="chosen-skills-list">{mySkillsList}</div>
  );

  const [currentSearch, setCurrentSearch] = useState("");
  const [skillsList, setSkillsList] = useState<Skill[]>();

  const getSkillsList = async (type: string) => { //filters the skills properly
      const response = await getSkills();
      if(response.data){
      let finalList = response.data;
    if (
      type.toLowerCase() === "developer" ||
      type.toLowerCase() === "designer" ||
      type.toLowerCase() === "soft"
    ) {
      finalList = response.data?.filter((skill) => skill.type === type)
      setSkillsList(
        finalList.sort((a: Skill, b: Skill) => {
          if (a.label.toLowerCase() < b.label.toLowerCase()) {
            return -1;
          }
          if (a.label.toLowerCase() > b.label.toLowerCase()) {
            return 1;
          }
          return 0;
        })
      );
    }
    setSkillsList(finalList);
    }
  };

  useEffect(() => {
    if (!skillsList) getSkillsList("developer");
  }, []);

  const [filterSel, setFilterSel] = useState(0);
  // 0 -> Developer Skills -> Hard Skills
  // 1 -> Designer Skills -> Proficiencies
  // 2 -> Soft Skills -> Soft Skills
  const changeFilter = (val: number) => {
    if (currentSearch === "") {
      setFilterSel(val);
      switch (val) {
        case 0:
          getSkillsList("developer");
          break;

        case 1:
          getSkillsList("designer");
          break;

        case 2:
          getSkillsList("soft");
          break;
      }
    }
  };

  const filterButton1 = (
    <button
      className="skills-filter-button"
      id={filterSel === 0 ? "selected" : ""}
      onClick={() => changeFilter(0)}
    >
      Developer Skills
    </button>
  );
  const filterButton2 = (
    <button
      className="skills-filter-button"
      id={filterSel === 1 ? "selected" : ""}
      onClick={() => changeFilter(1)}
    >
      Designer Skills
    </button>
  );
  const filterButton3 = (
    <button
      className="skills-filter-button"
      id={filterSel === 2 ? "selected" : ""}
      onClick={() => changeFilter(2)}
    >
      Soft Skills
    </button>
  );

  let filteredSkillsListDisplay = <div className="skills-list"></div>;
  if (currentSearch !== "") {
    filteredSkillsListDisplay = (
      <div className="skills-list">
        {skillsList === undefined
          ? ""
          : skillsList.map((skillItem) => {
              if (
                skillItem.label
                  .substring(0, currentSearch.length)
                  .toLowerCase() == currentSearch.toLowerCase()
              ) {
                let skillClass = `skill-item-button ${skillItem.type.toLowerCase().substring(0, 4)}`;
                let found = false;
                for (let i = 0; i < currentSkills.length; i++) {
                  if (currentSkills[i].label == skillItem.label) {
                    found = true;
                  }
                }
                if (found) {
                  skillClass += " chosen";
                }

                return (
                  <button
                    className={skillClass}
                    onClick={(e) => {
                      addToSkillsList(skillItem);
                    }}
                  >
                    {found ? "✓" : "+"}&nbsp;&nbsp;&nbsp;{skillItem.label}
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
          ? ""
          : skillsList.map((skillItem) => {
              let skillClass = `skill-item-button ${skillItem.type.toLowerCase().substring(0, 4)}`;
              let found = false;
              for (let i = 0; i < currentSkills.length; i++) {
                if (currentSkills[i].label == skillItem.label) {
                  found = true;
                }
              }
              if (found) {
                skillClass += " chosen";
              }

              return (
                <button
                  className={skillClass}
                  onClick={(e) => {
                    addToSkillsList({
                      skillId: skillItem.skillId,
                      type: skillItem.type,
                      label: skillItem.label,
                      proficiency: "Novice", //it's just a placeholder for now we'll figure it out
                      position: currentSkills.length + 1,
                    });
                  }}
                >
                  {found ? "✓" : "+"}&nbsp;&nbsp;&nbsp;{skillItem.label}
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
          <div className="edit-region-instruct skills">
            Drag and drop to reorder
          </div>
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
  const [currentLinks, setCurrentLinks] = useState<MySocial[]>(
    user.socials ?? []
  );
  const [socialLinks, setSocialLinks] = useState<Social[]>();

  const getSocials = async () => {
      const response = await fetchSocials();
     if(response.data !== null) setSocialLinks(response.data);
  };

  useEffect(() => {
    if (!socialLinks) getSocials();
  }, []);

  const getWebsiteIcon = (websiteName: string) => {
    switch (websiteName.toLowerCase()) {
      case "instagram":
        return <>&#xf16d;</>;

      case "x":
        return <>&#xe61b;</>;

      case "facebook":
        return <>&#xf39e;</>;

      case "discord":
        return <>&#xf392;</>;

      case "bluesky":
        return <>&#xe671;</>;

      case "linkedin":
        return <>&#xf08c;</>;

      case "youtube":
        return <>&#xf167;</>;

      case "steam":
        return <>&#xf1b6;</>;

      case "itch":
        return <>&#xf83a;</>;

      case "other":
        return <>&#xf0c1;</>;
    }
  };

  const getLinksDropDown = (currentSite: string, index: number) => {
    if (socialLinks !== undefined) {
      const socialsList: JSX.Element[] = [];
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
          return socialLinks[i].websiteId;
        }
      }
      return 0;
    }
    return 0;
  };

  const addNewLink = () => {
    const tempList: MySocial[] = [];
    for (let i = 0; i < currentLinks.length; i++) {
      tempList.push(currentLinks[i]);
    }
    const newLink: MySocial = { id: 0, website: "select", url: "" };
    setCurrentLinks([...currentLinks, { id: 0, website: "select", url: "" }]);
  };

  const removeLink = (index: number) => {
    const tempList: MySocial[] = [];
    for (let i = 0; i < currentLinks.length; i++) {
      if (i !== index) {
        tempList.push(currentLinks[i]);
      }
    }
    setCurrentLinks(tempList);
  };

  const updateSite = (index: number, newSite: string) => {
    const tempList: MySocial[] = [];
    for (let i = 0; i < currentLinks.length; i++) {
      if (i === index) {
        tempList.push({
          id: getIdOfWebsite(newSite),
          website: newSite,
          url: currentLinks[i].url,
        });
      } else {
        tempList.push(currentLinks[i]);
      }
    }
    setCurrentLinks(tempList);
  };

  const updateURL = (index: number, newURL: string) => {
    const tempList: MySocial[] = [];
    for (let i = 0; i < currentLinks.length; i++) {
      if (i === index) {
        tempList.push({
          id: currentLinks[i].id,
          website: currentLinks[i].website,
          url: newURL,
        });
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
              ? ""
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
      <button
        className="profile-discover-button"
        id="selected"
        onClick={() => setPage(1)}
      >
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
      <button
        className="profile-discover-button"
        id="selected"
        onClick={() => setPage(2)}
      >
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
      <button
        className="profile-discover-button"
        id="selected"
        onClick={() => setPage(3)}
      >
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
      <button
        className="profile-discover-button"
        id="selected"
        onClick={() => setPage(4)}
      >
        Links
      </button>
    );
  }

  const getRoleId = (roleName: string) => {
    if (rolesList !== undefined) {
      for (let i = 0; i < rolesList.length; i++) {
        if (rolesList[i].label == roleName) {
          return rolesList[i].titleId;
        }
      }
      return -1;
    }
  };

  const getMajorId = (majorName: string) => {
    if (majorsList !== undefined) {
      for (let i = 0; i < majorsList.length; i++) {
        if (majorsList[i].label == majorName) {
          return majorsList[i].majorId;
        }
      }
      return -1;
    }
  };

  const createSkillsList = (): Pick<UserSkill, "skillId" | "position">[] =>
    currentSkills.map((skill) => ({ id: skill.skillId, position: skill.position }));

  const createLinksList = (): Pick<MySocial, "id" | "url">[] =>
    currentLinks
      .filter((link) => link.id !== 0)
      .map((link) => ({ id: link.id, url: link.url }));

  const saveData = async () => {
    // User
    await saveUser();

    // Projects
    await saveProjectsPage();

    openClosePopup(showPopup, setShowPopup);

    window.location.reload();
  };

  const saveUser = async () => {
    console.log("I'M BEING RAN HAHAHAAHAHAHAHAHAHH");
    try {
      const response = await editUser({
          ...currentEditData
        });
      console.log(`User data: Response status: ${response.status}`);
    } catch (error) {
      console.log(error);
    }
  };

  const saveProjectsPage = async () => {
    if (userProjects !== undefined) {
      for (let i = 0; i < userProjects.length; i++) {
        try {
          const response = await updateProjectVisibility(userProjects[i].projectId,
             checkIfProjectIsShown(userProjects[i].projectId) ? 'public' : 'private');
            //console.log(`Projects data #${i + 1}: Response status: ${response.status}`);
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
        width={"1120px"}
        height={"850px"}
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
