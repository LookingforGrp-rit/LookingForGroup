
/**
 * This component will display a role entry in a project. This will show the role’s name, 
 * amount of available positions, and a description that’s hidden via dropdown. 
 * There is editing functionality and a toggle for deleting with the chance to undo that deletion.
 * @param props Props passed in
 * @returns HTML - particular role’s details and interactive buttons to change data within it.
 */
export const RoleListing = (props) => {
  //editMode - tells when this listing is currently being edited
  let editMode = false;
  //descHidden - tells whether or not the description is visible or not
  let descHidden = true;

  // Shows/Hides a role’s description or its editing features depending on the mode
  //i - the number index of this listing, used to open/close the correct description
  const toggleDescription = (i) => {
    descHidden = !descHidden;
    if (!editMode) {
      const roleListing = document.getElementById('role-desc-' + i);
      roleListing
        ? roleListing.classList.toggle('role-list-description')
        : console.log('cannot find listing');
    } else {
      const roleInput = document.getElementById('role-desc-edit-' + i);
      roleInput
        ? roleInput.classList.toggle('role-list-desc-input')
        : console.log('cannot find listing');
    }
  };

  // Switches between editing modes and updates visible user interaction elements
  //i - the number index of this listing, used to toggle editing mode on the correct listing
  const toggleEdit = (i) => {
    //toggle editMode
    editMode = !editMode;

    //assign elements to modify
    // listParent - DOM node for listing a role
    // desc - DOM node for role description
    // descInput - DOM node for an editable description
    const listParent = document.getElementById('role-list-' + i);
    const desc = document.getElementById('role-desc-' + i);
    const descInput = document.getElementById('role-desc-edit-' + i);

    //hide/show different elements inside listParent
    //The below errors are due to typescript. It would take so many different checks to make sure they're not 'undefined', so I'm not doing them.
    listParent.querySelector('.role-list-name').classList.toggle('hide');
    listParent.querySelector('.role-list-num').classList.toggle('hide');
    listParent.querySelector('.role-list-edit').classList.toggle('hide');
    listParent.querySelector('.role-list-name-edit-hide').classList.toggle('role-show');
    listParent.querySelector('.role-list-num-edit-hide').classList.toggle('role-show');
    listParent.querySelector('.role-list-done-hide').classList.toggle('role-show');
    listParent.querySelector('.role-list-delete').classList.toggle('hide');

    //Only modifies description displays if the description dropdown is open
    if (!descHidden) {
      desc ? desc.classList.toggle('role-list-description') : console.log('cannot find listing');
      descInput
        ? descInput.classList.toggle('role-list-desc-input')
        : console.log('cannot find listing');
    }
  };

  // Hides particular role then removes it
  const removeRole = (roleIndex) => {
    if (!descHidden) {
      const desc = document.getElementById('role-desc-' + roleIndex);
      desc ? desc.classList.toggle('role-list-description') : console.log('cannot find listing');
      descHidden = true;
    }
    const cover = document.getElementById('role-cover-' + roleIndex);
    cover ? cover.classList.toggle('role-cover') : console.log('error');
    props.removeRole(roleIndex);
  };

  // Shows particular role then undoes removal
  const undoRemoveRole = (roleIndex) => {
    const cover = document.getElementById('role-cover-' + roleIndex);
    cover ? cover.classList.toggle('role-cover') : console.log('error');
    props.undoRemoveRole(roleIndex);
  };

  // Saves current changes from the user in editing and updates data based on these changes
  const doneEdit = (roleIndex) => {
    const listParent = document.getElementById('role-list-' + roleIndex);

    //contains the name, number of positions, & description of edited inputs
    // roleName - The input value for an edited name
    // roleNum - The input value for an edited number of positions
    // roleDesc - The input value for descriptions
    let roleName, roleNum, roleDesc;
    roleName = listParent.querySelector('.role-list-name-edit-hide').value;
    roleNum = listParent.querySelector('.role-list-num-edit-hide').value;
    roleDesc = document.getElementById('role-desc-edit-' + roleIndex).value;

    //Check to make sure all fields have a value to use, stops function if they don't
    if (roleName === '' || roleNum === '' || roleDesc === '') {
      console.log('all fields must have an appropriate input (display this on interface later)');
      return;
    }

    //Update displays with new info
    listParent.querySelector('.role-list-name').innerHTML = roleName;
    listParent.querySelector('.role-list-num').innerHTML = roleNum;
    document.getElementById('role-desc-' + roleIndex).innerHTML = roleDesc;

    // Object that encapsulates roleName, roleNum, and roleDesc
    const roleObject: { Role: string; amount: number; description: string } = {
      Role: roleName,
      amount: roleNum,
      description: roleDesc,
    };

    //Disables editing mode
    toggleEdit(roleIndex);

    props.updateRoleSettings(roleIndex, roleObject);
  };

  //Check to make sure the role data being passed in exists
  //If this triggers, something's wrong elsewhere here or in Project.tsx
  if (props.role === undefined || props.role === null) {
    console.log('could not find role');
    return;
  }

  return (
    <>
      <div id={'role-cover-' + props.num} className="hide">
        Role Removed <button onClick={() => undoRemoveRole(props.num)}>undo</button>
      </div>
      <div id={'role-list-' + props.num} className="role-list-info">
        <span className="role-list-name">{props.role.Role}</span>
        <input type="text" className="role-list-name-edit-hide" defaultValue={props.role.Role} />
        <span className="role-list-num">{props.role.amount}</span>
        <input type="number" className="role-list-num-edit-hide" defaultValue={props.role.amount} />
        <button className="role-list-desc-dropdown" onClick={() => toggleDescription(props.num)}>
          V
        </button>
        <button className="role-list-edit" onClick={() => toggleEdit(props.num)}>
          edit
        </button>
        <button className="role-list-done-hide" onClick={() => doneEdit(props.num)}>
          done
        </button>
        <button className="role-list-delete" onClick={() => removeRole(props.num)}>
          X
        </button>
      </div>
      <div id={'role-desc-' + props.num} className="hide">
        {props.role.description}
      </div>
      <textarea
        id={'role-desc-edit-' + props.num}
        className="hide"
        defaultValue={props.role.description}
      />
    </>
  );
};
