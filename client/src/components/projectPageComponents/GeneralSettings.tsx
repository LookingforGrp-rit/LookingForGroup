import profilePlaceholder from '../../icons/profile-user.png';

//This component is used in the project member view of the project page
//Contains the layout of the 'General' tab of the project settings menu
//Should contain info regarding details of the project, as well as the ability to change said details
//This includes what picture the project uses as a profile, the name of the project,
//  The theme of its virtual space, and whether or not the project is currently hiring new people
//  More project options may need to be added in the future depending on the overall site design
//Also contains a save button that should write any changes made in this menu to the database
//There is currently an issue where swapping between the tabs of the settings window will reset any inputs
//  made within this tab if they weren't saved. Ideally, this shouldn't happen unless the entire settings
//  window is closed without saving.

// projectId is passed through props, which is used to ensure correct data is pulled
// tempSettings is also pulled, containing the current settings inputs

export const GeneralSettings = (props) => {
  return (
    <div id="general-settings">
      {/* Get image of profile and use preloader function in functions/imageLoad.tsx */}
      <img id="picture-edit" src={profilePlaceholder} alt="project" />
      <button id="edit-button" className="white-button">
        Edit Picture
      </button>
      <input
        id="name-edit"
        name="project-name"
        type="text"
        defaultValue={props.tempSettings.projectName}
      ></input>
      <select id="theme-select">
        <option value="classic">Classic</option>
        <option value="cute">Cute</option>
        <option value="western">Western</option>
        <option value="fantasy">Fantasy</option>
        <option value="cyberpunk">Cyberpunk</option>
      </select>
      <div id="hiring-checkbox">
        <label>Is Hiring: </label>
        <input name="is-hiring" type="checkbox" id="is-hiring" />
      </div>
    </div>
  );
};
