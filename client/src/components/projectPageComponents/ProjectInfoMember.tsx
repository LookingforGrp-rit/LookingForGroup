import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import * as projectPageHelper from './ProjectPageHelper';
import { GeneralSettings } from './GeneralSettings';
import { MemberSettings } from './MemberSettings';
import { RoleListing } from './RoleListing';
import { PagePopup, openClosePopup } from '../PagePopup';
import { projects } from '../../constants/fakeData'; // FIXME: use data in db
import profilePlaceholder from '../../icons/profile-user.png';
import { ThemeIcon } from '../ThemeIcon';

// TODO: this file is old and not used. Has good information regarding past designs and intended userflow, so keep until this is
// properly documented and can be implemented in the future

/**
 * ProjectInfoMember is a React component that displays project information for users who are members of the project. 
 * It provides functionality for project management, including project settings, role management, and member administration. 
 * Unlike the non-member ProjectInfo component, this version includes options to access project settings, leave the project, 
 * edit roles, enter the virtual space, and create new posts. 
 * The component is designed to show different controls based on whether the user is a regular member, an admin, or the project owner.
 * @param props Props passed in - projectData
 * @returns React component - renders project information panel
 */

// To-do: add new header layout elements to this component
// Settings are not functioning correctly, needs to be checked out
// This will be mostly identical to the non-member component above, aside from buttons

// Utilizes the 'PagePopup' component for project settings, and 'GeneralSettings' as the first rendered tab within it
// projectData and a callback for resetProjectData are passed in through props
// projectData is a reference to the current project's info
export const ProjectInfoMember = (props) => {
  const navigate = useNavigate(); // Hook for navigation

  // key - Counter used to generate unique React keys for role listings in the main component
  // key2 - Counter used to generate unique React keys for roles in the edit roles interface
  let key = 0; //key is not required for functionality, but react will give an error without it when using the .map function later
  let key2 = 0;

  //UseState variables used alongside popup components
  // showPopup1 - Controls the visibility of the project settings popup (useState, setShowPopup1)
  // showPopup2 - Controls the visibility of the delete project confirmation popup (useState, setShowPopup2)
  // showPopup 3 - Controls the visibility of the edit roles popup (useState, setShowPopup3)
  const [showPopup1, setShowPopup1] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [showPopup3, setShowPopup3] = useState(false);

  // defaultSettings - Stores the original project settings
  let defaultSettings: {
    projectName: string;
    projectMembers: { userID: number; admin: boolean; owner: boolean; role: string }[];
  } = {
    projectName: '',
    projectMembers: [],
  };
  // defaultRoleSettings - Stores the original role settings
  let defaultRoleSettings: { Role: string; amount: number; description: string }[];

  // tempSettings - Temporary storage for project settings being edited
  // tempRoleSettings - Temporary storage for role settings being edited
  // If settings window is closed, this should be reset using defaultSettings
  let tempSettings;
  let tempRoleSettings;

  // currentTab - Tracks which settings tab is currently active
  let currentTab = 'general';

  //Pass project settings into variables for use in settings tabs
  defaultSettings.projectName = props.projectData.name;
  defaultSettings.projectMembers = [];
  defaultRoleSettings = props.projectData.neededRoles;
  props.projectData.members.forEach((member) => {
    defaultSettings.projectMembers.push(member);
  });
  tempSettings = JSON.parse(JSON.stringify(defaultSettings));
  tempRoleSettings = JSON.parse(JSON.stringify(defaultRoleSettings));

  //Function used to update a specific member's setting
  //It is placed before other variables so that it can be used for one
  //'setting' indicates what setting is being modified
  // 0 - member role; 1 - toggle admin; 2 - toggle mentor(?); 3 - remove member; 4 - undo remove member;
  //'memberId' indicates which member to change via their id
  //'roleName': optional parameter used when setting = 0 to specify the new role
  const updateMemberSettings = (setting, memberId, roleName = undefined) => {
    const editingMember: { userID: number; admin: boolean; owner: boolean; role: string } =
      tempSettings.projectMembers.find((member) => member.userID === Number(memberId));
    if (editingMember === undefined && setting !== 4) {
      console.log('member not found');
      return;
    }
    switch (setting) {
      case 0:
        if (roleName !== undefined) {
          editingMember.role = roleName;
        }
        break;
      case 1:
        editingMember.admin ? (editingMember.admin = false) : (editingMember.admin = true);
        console.log('admin status updated');
        break;
      case 2:
        //Meant to toggle mentor role, but no such thing appears in data at the moment
        console.log('mentor toggle');
        break;
      case 3:
        //Get the array index of the member being deleted
        //References defaultSettings instead of tempSettings due to potential index changes caused by other member removals
        const deletedItem = defaultSettings.projectMembers.find(
          (member) => member.userID === memberId
        );
        let deletedItemIndex;
        deletedItem
          ? (deletedItemIndex = defaultSettings.projectMembers.indexOf(deletedItem))
          : console.log('error getting item index');
        //Add index of deleted member to deletedMemberIndexList
        deletedMemberIndexList.push(deletedItemIndex);
        //Remove the relevant member from tempSettings
        tempSettings.projectMembers.splice(tempSettings.projectMembers.indexOf(editingMember), 1);
        break;
      case 4:
        //Get the original array index of the member being restored
        //Gets data on the member using memberId, then finds the index of that data in defaultSettings
        const deletedMember = defaultSettings.projectMembers.find(
          (member) => member.userID === memberId
        );
        if (deletedMember === undefined) {
          console.log('deleted member not found');
          return;
        }
        let deletedMemberIndex = defaultSettings.projectMembers.indexOf(deletedMember);
        //Also assign an originalIndex value as a reference to the original index value
        //original index is used for comparison, while deletedMemberIndex is changed depending on the comparison
        const originalIndex = defaultSettings.projectMembers.indexOf(deletedMember);
        for (let i = 0; i < deletedMemberIndexList.length; i++) {
          if (originalIndex > deletedMemberIndexList[i]) {
            deletedMemberIndex--;
          }
        }
        //Insert member data back into tempSettings
        tempSettings.projectMembers.splice(deletedMemberIndex, 0, deletedMember);
        break;
      default:
        return;
    }
  };

  //Store settings tab components for switching between tabs
  const generalTab = (
    <GeneralSettings projectId={props.projectData._id} tempSettings={tempSettings} />
  );
  const membersTab = (
    <MemberSettings
      projectId={props.projectData._id}
      tempSettings={tempSettings}
      updateMemberSettings={updateMemberSettings}
    />
  );

  //useState variable used to set what is displayed in settings popup
  const [tabContent, setTabContent] = useState(generalTab);

  //useState variables used when rendering edit roles interface
  const [currentlyNeededRoles, setCurrentlyNeededRoles] = useState(tempRoleSettings);

  //Used to track which members have been deleted
  const deletedMemberIndexList: number[] = [];
  //Used to track the indexes of deleted roles
  let deletedRoleIndexList: number[] = [];

  // Opens settings and resets any setting inputs from previous opening
  // Creates a deep copy of defaultSettings to temporary settings
  // Resets the tab content based on currentTab value
  const openSettings = () => {
    tempSettings = JSON.parse(JSON.stringify(defaultSettings)); //Json manipulation here is to help create a deep copy of the settings object
    if (currentTab === 'general') {
      //The 2 lines of code in these 2 if/else if statements are roundabout ways to reset the content
      //On the tabs. A better solution to accomplish this may be possible.
      setTabContent(membersTab);
      setTimeout(
        () =>
          setTabContent(
            <GeneralSettings projectId={props.projectData._id} tempSettings={tempSettings} />
          ),
        1
      );
    } else if (currentTab === 'members') {
      setTabContent(generalTab);
      setTimeout(
        () =>
          setTabContent(
            <MemberSettings
              projectId={props.projectData._id}
              tempSettings={tempSettings}
              updateMemberSettings={updateMemberSettings}
            />
          ),
        1
      );
    }
    //Timeout is set here to prevent asynchronous tab changes from the 'setTabContent' functions above from being visible
    setTimeout(() => openClosePopup(showPopup1, setShowPopup1), 20);
  };

  //Updates tempSettings with any inputted setting changes, called when switching tabs or when saving settings
  // Currently only updates project name if on the general tab
  const updateSettings = () => {
    if (currentTab === 'general') {
      const nameInput = document.getElementById('name-edit');
      nameInput ? (tempSettings.projectName = nameInput.value) : console.log('error'); //error on 'value' is due to typescript, code still functions correclty
    }
  };

  /* Calls updateSettings to ensure latest changes are captured
  Updates the project in the projects array with the new settings
  Updates defaultSettings to reflect the new saved state
  Calls the callback function to refresh the project data display 
  Closes the settings popup
  */
  const saveSettings = () => {
    updateSettings();
    const currentProject = projects.find((p) => p._id === Number(props.projectData._id));
    if (currentProject !== undefined) {
      currentProject.name = tempSettings.projectName;
      currentProject.members = tempSettings.projectMembers;
    }
    defaultSettings = tempSettings;

    props.callback();

    //Closes the settings popup
    openClosePopup(showPopup1, setShowPopup1);
  };

  // Switches between different tabs in the settings window
  // Updates currentTab and tabContent based on the selected tab
  // Applies CSS classes to visually indicate the active tab
  // Calls updateSettings to save any changes before switching tabs
  const changeTabs = (tab) => {
    //Depending on tab selected, switches settings content to that tab, while also applying styling rules to
    //the relevant tabs themselves

    //Could use useState to change tab display instead
    if (tab === 'general') {
      currentTab = 'general';
      setTabContent(generalTab);
      const generalTabElement = document.getElementById('general-tab');
      const memberTabElement = document.getElementById('member-tab');
      if (generalTabElement && memberTabElement) {
        generalTabElement.className = 'tab-selected';
        memberTabElement.className = 'tab';
      }
    } else if (tab === 'members') {
      updateSettings();
      currentTab = 'members';
      setTabContent(membersTab);
      const generalTabElement = document.getElementById('general-tab');
      const memberTabElement = document.getElementById('member-tab');
      if (generalTabElement && memberTabElement) {
        generalTabElement.className = 'tab';
        memberTabElement.className = 'tab-selected';
      }
    }
  };

  // Adds a new role to tempRoleSettings based on input field values
  // Validates that all required fields have values
  // Updates the currentlyNeededRoles state to refresh the role list display
  const addRole = () => {
    //get input values
    const nameInput = document.getElementById('role-name-input-box').value;
    const numInput = document.getElementById('role-num-input-box').value;
    const descInput = document.getElementById('role-desc-input-box').value;
    //check to make sure all values contain data, cancels function if not
    // * Will also require checks or encryption to prevent code injection
    if (nameInput === '' || numInput === '' || descInput === '') {
      console.log('all fields must have an appropriate input (display this on interface later)');
      return;
    }
    //create new role
    const newRole: { Role: string; amount: number; description: string } = {
      Role: nameInput,
      amount: numInput,
      description: descInput,
    };
    //add new role to project
    tempRoleSettings.push(newRole);
    //update currentlyNeededRoles usestate
    setCurrentlyNeededRoles(defaultRoleSettings);
    setTimeout(() => setCurrentlyNeededRoles(tempRoleSettings), 1);
  };

  // Marks a role for deletion by adding its index to deletedRoleIndexList
  // Does not immediately remove the role, only marks it for removal when saving
  const removeRole = (roleIndex) => {
    deletedRoleIndexList.push(roleIndex);
  };

  //Undoes a role deletion & removes its index from deletedRoleIndexList
  const undoRemoveRole = (roleIndex) => {
    deletedRoleIndexList.splice(deletedRoleIndexList.indexOf(roleIndex), 1);
  };

  //Called when user is done editing a role's details
  //roleIndex passes in a number to use as an index reference for the role
  //note: since there is no id number for roles, need to manipulate deleted index numbers to update correct role
  const updateRoleSettings = (roleIndex, roleObject) => {
    tempRoleSettings[roleIndex] = roleObject;
  };

  //Called when 'save changes' is pressed in edit roles interface
  //Takes data in tempRoleSettings and updates project data with it
  const saveRoleSettings = () => {
    //Runs through deletedRoleIndexList and removes all items from tempRoleSettings with these indexes
    //Sorts indexes from greatest to least first to prevent erroneous deletions
    deletedRoleIndexList.sort(function (a, b) {
      return b - a;
    });
    //Delete items at specified indexes
    deletedRoleIndexList.forEach((index) => {
      tempRoleSettings.splice(index, 1);
    });
    //Clean out deletedRoleIndexList
    deletedRoleIndexList = [];

    //Saves new role data to project data
    const currentProject = projects.find((p) => p._id === Number(props.projectData._id));
    if (currentProject !== undefined) {
      currentProject.neededRoles = tempRoleSettings;
    }
    //Resets defaultRoleSettings with new info
    defaultRoleSettings = tempRoleSettings;

    //Updates page display & closes interface
    props.callback();
    openClosePopup(showPopup3, setShowPopup3);
  };

  // Resets the role editing interface to show the current defaultRoleSettings
  // Clears and then repopulates currentlyNeededRoles with default values
  const resetEditRoles = () => {
    setCurrentlyNeededRoles([]);
    setTimeout(() => setCurrentlyNeededRoles(defaultRoleSettings), 1);
  };

  // Calls resetEditRoles to ensure the interface shows current data
  // Opens the edit roles popup
  const openEditRoles = () => {
    resetEditRoles();
    openClosePopup(showPopup3, setShowPopup3);
  };

  // Some comments may be moved inside html
  // html can also utilize useState and useEffect later to better represent data updates
  return (
    <div id="project-info-member">
      {/* Get image of project and use preloader function in functions/imageLoad.tsx */}
      <img id="project-picture" src={profilePlaceholder} alt="project picture" />

      <div id="project-header">
        <h1 id="project-title">{props.projectData.name}</h1>
        <div id="header-buttons">
          <div id="more-options">
            <button
              id="more-options-button"
              className="icon-button"
              onClick={projectPageHelper.toggleOptionDisplay}
            >
              <ThemeIcon id={'menu'} width={25} height={25} className={'color-fill'} ariaLabel={'more options'}/>
            </button>
            <div id="more-options-popup" className="hide">
              <button className="white-button" onClick={openSettings}>
                Project Settings
              </button>
              <button className="white-button" onClick={projectPageHelper.leaveProject}>
                Leave Project
              </button>
            </div>
          </div>
        </div>
      </div>

      <p id="project-desc">{props.projectData.description}</p>

      <div id="member-buttons">
        {/* <button
          id="virtual-space-entrance"
          className="white-button"
          onClick={projectPageHelper.enterVirtualSpace}
        >
          Enter virtual space
        </button> */}
        <button
          id="make-post-button"
          className="white-button"
          onClick={projectPageHelper.makeProjectPost}
        >
          + New Post
        </button>
      </div>

      <div id="project-listings">
        <h3>Looking for</h3>
        <hr />
        {props.projectData.neededRoles.map((role) => {
          if (role === undefined || role === null) {
            console.log('could not find role');
            return;
          }
          return (
            <div key={key++}>
              {role.Role} &#40;{role.amount}&#41;
            </div>
          );
        })}

        <button id="edit-roles-button" className="white-button" onClick={openEditRoles}>
          Edit Roles
        </button>
      </div>

      <PagePopup
        width={'80vw'}
        height={'80vh'}
        popupId={0}
        zIndex={3}
        show={showPopup1}
        setShow={setShowPopup1}
      >
        <div id="settings-window-test">
          <h1>Project Settings</h1>
          <div id="settings-tabs">
            <button
              id="general-tab"
              className="tab-selected"
              onClick={() => {
                changeTabs('general');
              }}
            >
              General
            </button>
            <button
              id="member-tab"
              className="tab"
              onClick={() => {
                changeTabs('members');
              }}
            >
              Members
            </button>
            <button id="delete-project" onClick={() => openClosePopup(showPopup2, setShowPopup2)}>
              Delete Project
            </button>
          </div>
          <hr />
          <div id="settings-content">{tabContent}</div>
          <button
            id="settings-cancel"
            className="white-button"
            onClick={() => openClosePopup(showPopup1, setShowPopup1)}
          >
            Cancel
          </button>
          <button id="settings-save" className="orange-button" onClick={saveSettings}>
            Save
          </button>
        </div>
      </PagePopup>

      <PagePopup
        width={'600px'}
        height={'400px'}
        popupId={2}
        zIndex={3}
        show={showPopup3}
        setShow={setShowPopup3}
      >
        <div id="edit-roles-window">
          <h1>Edit Roles</h1>
          <div id="edit-roles-options">
            <div id="role-name-input">
              <div>role name</div>
              <input id="role-name-input-box" type="text"></input>
            </div>
            <div id="role-spots-input">
              <div>open spots</div>
              <input id="role-num-input-box" type="number"></input>
            </div>
            <div id="role-desc-input">
              <div>role description</div>
              <textarea id="role-desc-input-box"></textarea>
            </div>
            <button id="role-add-button" onClick={addRole}>
              Add role
            </button>
            <div id="roles-list">
              {currentlyNeededRoles.map((currentRole) => {
                return (
                  <RoleListing
                    role={currentRole}
                    num={key2}
                    key={key2++}
                    updateRoleSettings={updateRoleSettings}
                    removeRole={removeRole}
                    undoRemoveRole={undoRemoveRole}
                  />
                );
              })}
            </div>
          </div>
          <button className="orange-button" onClick={saveRoleSettings}>
            Save Changes
          </button>
        </div>
      </PagePopup>

      <PagePopup
        width={'300px'}
        height={'150px'}
        popupId={1}
        zIndex={4}
        show={showPopup2}
        setShow={setShowPopup2}
      >
        <div id="project-delete-check">
          <h3>Are you sure you want to delete this project?</h3>
          <button
            id="project-delete-cancel"
            onClick={() => openClosePopup(showPopup2, setShowPopup2)}
          >
            Cancel
          </button>
          <button
            id="project-delete-final"
            onClick={() => projectPageHelper.deleteProject(navigate)}
          >
            DELETE
          </button>
        </div>
      </PagePopup>
    </div>
  );
};
