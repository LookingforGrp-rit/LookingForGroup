import { useState } from 'react';
import { ItemMaker } from '../ItemMaker';

//page to create a project
//accessed from my projects
const CreateProject = () => {
  const [pName, setName] = useState('');
  const [pDesc, setDesc] = useState('');
  const [tags, setTags] = useState(['']);
  const [roles, setRoles] = useState(['']);

  const grabTags = (grabbedTags: string[]) => {
    setTags(grabbedTags);
  };
  const grabRoles = (grabbedRoles: string[]) => {
    setRoles(grabbedRoles);
  };

  return (
    <div>
      <h3>Project Name</h3>
      <input
        type="text"
        onChange={(e) => {
          setName(e.target.value);
        }}
        className="c-proj-text"
      />
      <br />

      <h3>Description</h3>
      <input
        type="text"
        onChange={(e) => {
          setDesc(e.target.value);
        }}
        className="c-proj-text"
      />

      <h3>Add Tags</h3>
      <ItemMaker type="tag" grabber={grabTags} />

      <h3>Add Needed Roles</h3>
      <ItemMaker type="role" grabber={grabRoles} />

      <button
        className="orange-button"
        onClick={() => {
          const newProj = {
            name: pName,
            desc: pDesc,
            tags: tags,
            roles: roles,
          };

          // This will be database writing in the future
          console.log(newProj);
        }}
      >
        Create
      </button>
    </div>
  );
};

export default CreateProject;
