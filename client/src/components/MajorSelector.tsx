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

import { useState, useEffect } from 'react';
import { getMajors as fetchMajors } from '../api/users';
import { Major } from '@looking-for-group/shared';
import LabelInputBox from './LabelInputBox';
import { Select, SelectButton, SelectOptions } from './Select';

// MajorSelector component allows users to select their major from a dropdown list
export const MajorSelector = () => {
  // State to hold the options for the dropdown
  const [majors, setMajors] = useState<Major[]>([]);

  // useEffect runs once when the component mounts to fetch the majors and set the options
  useEffect(() => {
    const setUp = async () => {
      const response = await fetchMajors();
      setMajors(response?.data ?? []);
    };
    setUp();
  }, []);

  return (
    <>
    <LabelInputBox
      label={'Major'}
      inputType={'none'}
    >
      <Select>
        <SelectButton
          placeholder='Select'
          initialVal={''}
          callback={(e) => { e.preventDefault(); }}
          type={'input'}
        />
        <SelectOptions
          callback={(e) => { e.preventDefault(); }}
          options={majors.map(m => ({
          value: m.label,
          markup: <>{m.label}</>,
          disabled: false
          }))}
        />
      </Select>
    </LabelInputBox>
    </>
  );
};
