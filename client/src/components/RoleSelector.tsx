//Styles
import './Styles/credits.css';
import './Styles/discoverMeet.css';
import './Styles/emailConfirmation.css';
import './Styles/general.css';
import './Styles/loginSignup.css';
import './Styles/messages.css';
import './Styles/notification.css';
import './Styles/profile.css';
import './Styles/projects.css';
import './Styles/settings.css';
import './Styles/pages.css';

import { useState, useEffect } from 'react';
import type { JSX } from 'react';


interface JobTitle {
  titleId: string;
  label: string;
}

const getRoles = async (): Promise<JobTitle[]> => {
  // TODO: create error handling, try catch block
  const response = await fetch('/api/datasets/job-titles');
  const { data } = await response.json();
  // console.log(data);
  return data;
};


export const RoleSelector = () => {
  const [options, setOptions] = useState<JSX.Element[] | null>(null);

  useEffect(() => {
    const setUpRoleSelector = async () => {
      const jobTitles = await getRoles();
      const selectorOptions = jobTitles.map((job: JobTitle) => (
        <option key={job.titleId} value={job.titleId}>
          {job.label}
        </option>
      ));
      setOptions(selectorOptions);
    };
    setUpRoleSelector();
  }, []);

  return (
    <div className="editor-input-item">
      <label>Role*</label>
      {/* <br /> */}
      <select id="profile-editor-jobTitle">{options}</select>
    </div>
  );
};
