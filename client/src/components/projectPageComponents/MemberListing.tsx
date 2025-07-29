import profilePlaceholder from '../../icons/profile-user.png';
import { ThemeIcon } from '../ThemeIcon';

//This component is used in the MemberSettings component,
//  where it is used to render one listing of a full list of project members
//Contains a profile picture of the member, their name, their role in the project, A button to edit their role, an a dropdown menu with more options
//Currently, the edit button requires functionality.
//  It should open an input to allow a string or role type to be selected, then write the new info to the database when done inputting & confirming
//The dropdown menu containing more options allow the user to add/remove different administration roles to members, as well as remove members
//Currently, there are issues regarding the positions of these dropdown menus
//  When there are enough members for the settings window to become scrollable, the menu still renders
//  where the listing was originally located. This means that some menus may only render off-screen, making them inaccessible
//Funcitonality also needs to be added to the dropdown menu options

//Takes in a user's name, their project role, and an id number for the dropdown menu as props
//  The user name is used as the rendered name, role contains a string showing what their role is,
//  and the id number is used to ensure correct functionality when opening/closing menus
export const MemberListing = (props) => {
  //Opens/closes the relevant 'more options' dropdown menu
  //i - the number id for the relevant menu. Allows the function to correctly open specific menus
  const moreSettingsToggle = (i) => {
    const currentId = 'member-settings-dropdown-' + i;
    const dropdown = document.getElementById(currentId);
    dropdown ? dropdown.classList.toggle('settings-show') : console.log('element not found');
  };

  //Toggles whether or not the role editing input is displayed or not
  const openCloseInput = () => {
    document.getElementsByClassName('member-settings-role')[props.num].classList.toggle('hide');
    document.getElementsByClassName('member-settings-edit')[props.num].classList.toggle('hide');
    document
      .getElementsByClassName('member-settings-role-input')
      [props.num].classList.toggle('member-settings-show');
    document
      .getElementsByClassName('member-settings-edit-done')
      [props.num].classList.toggle('member-settings-show');
  };

  //When closing the role edit input, saves the current changes
  //Changes will still be lost if the user doesn't click 'save' in the bottom right
  const saveRoleName = () => {
    openCloseInput();
    const roleNameInput = document.getElementsByClassName('member-settings-role-input')[props.num];
    const roleNameDisplay = document.getElementsByClassName('member-settings-role')[props.num];
    roleNameDisplay.innerHTML = roleNameInput.value;
    props.updateMemberSettings(0, props.idNum, roleNameInput.value);
  };

  //Removes selected member from the project & covers the listing
  //Not finalized until 'save' is clicked
  const tempRemoveMember = () => {
    moreSettingsToggle(props.idNum);
    props.updateMemberSettings(3, props.idNum);
    document
      .getElementsByClassName('member-settings-cover')
      [props.num].classList.toggle('member-settings-cover-show');
  };

  //Undoes the removal of a member & uncovers their listing
  const undoRemoveMember = () => {
    props.updateMemberSettings(4, props.idNum);
    document
      .getElementsByClassName('member-settings-cover')
      [props.num].classList.toggle('member-settings-cover-show');
  };

  return (
    <div className="member-settings-listing">
      <div className="member-settings-cover">
        Member Removed. Saving changes will finalize this.
        <button onClick={undoRemoveMember}>undo</button>
      </div>
      <img className="member-settings-profile" src={profilePlaceholder} alt="profilePlaceholder" />
      <span className="member-settings-name">{props.name}</span>
      <span className="member-settings-role">{props.role}</span>
      <input className="member-settings-role-input" type="text" defaultValue={props.role}></input>
      <button className="member-settings-edit" onClick={openCloseInput}>
        edit
      </button>
      <button className="member-settings-edit-done" onClick={saveRoleName}>
        done
      </button>
      <button className="member-settings-more" onClick={() => moreSettingsToggle(props.idNum)}>
        <ThemeIcon src={'assets/menu_light.svg'} darkSrc={'assets/menu_dark.svg'} alt={'more settings'} />
      </button>
      <div id={'member-settings-dropdown-' + props.idNum} className="settings-hide">
        <button className="white-button" onClick={() => props.updateMemberSettings(1, props.idNum)}>
          Add/Remove Admin Role
        </button>
        <button className="white-button" onClick={() => props.updateMemberSettings(2, props.idNum)}>
          Add/Remove Mentor Role
        </button>
        <button className="white-button" onClick={tempRemoveMember}>
          Remove Member
        </button>
      </div>
    </div>
  );
};
