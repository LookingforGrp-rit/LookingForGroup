//Styles
import './Styles/credits.css';
import './Styles/discoverMeet.css';
import './Styles/emailConfirmation.css';
import './Styles/general.css';
import './Styles/loginSignup.css';
// import './Styles/messages.css';
// import './Styles/notification.css';
import './Styles/profile.css';
import './Styles/projects.css';
import './Styles/settings.css';
import './Styles/pages.css';

import { useState, useEffect, ReactElement } from 'react';
import { getMajors as fetchMajors } from '../api/users';

interface Major {
  major_id: string;
  label: string;
}

const getMajors = async (): Promise<Major[]> => {
  const response = await fetchMajors();
  return response.data;
  // console.log(data);
};

// MajorSelector component allows users to select their major from a dropdown list
export const MajorSelector = () => {
  // State to hold the options for the dropdown
  const [options, setOptions] = useState<ReactElement[] | null>(null);

  // useEffect runs once when the component mounts to fetch the majors and set the options
  useEffect(() => {
    const setUp = async () => {
      const jobTitles = await getMajors();
      const selectorOptions = jobTitles.map((job: Major) => (
        <option key={job.major_id} value={job.major_id}>
          {job.label}
        </option>
      ));
      setOptions(selectorOptions);
    };
    setUp();
  }, []);

  return (
    <div className="editor-input-item">
      <label>Major*</label>
      {/* <br /> */}
      <select id="profile-editor-major">{options}</select>
    </div>
  );
};
