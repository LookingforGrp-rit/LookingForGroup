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
import { Major } from '@looking-for-group/shared';

// MajorSelector component allows users to select their major from a dropdown list
export const MajorSelector = () => {
  // State to hold the options for the dropdown
  const [options, setOptions] = useState<ReactElement[]>([]);

  // useEffect runs once when the component mounts to fetch the majors and set the options
  useEffect(() => {
    const setUp = async () => {
      const majors = await fetchMajors();
      setOptions(
        majors.map((major: Major) => (
          <option key={major.majorId} value={major.majorId}>
            {major.label}
          </option>
        ))
      );
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
