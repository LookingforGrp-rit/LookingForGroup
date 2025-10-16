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
import { getJobTitles } from '../api/users';
import { Role } from '@looking-for-group/shared';
import LabelInputBox from './LabelInputBox';
import { Select, SelectButton, SelectOptions } from './Select';

export const RoleSelector = () => {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const setUpRoleSelector = async () => {
      const response = await getJobTitles();
      const roles: Role[] = response?.data ?? [];
      setRoles(roles);
      console.log(roles);
    };
    setUpRoleSelector();
  }, []);

  return (
    <>
    <LabelInputBox
      label={'Year'}
      inputType={'none'}
    >
      <Select>
        <SelectButton
          placeholder="Select"
          initialVal={''}
          callback={(e) => { e.preventDefault(); }}
          type={'input'}
        />
        <SelectOptions
          callback={(e) => { e.preventDefault(); }}
          options={roles.map(r => ({
          value: r.label,
          markup: <>{r.label}</>,
          disabled: false
          }))}
        />
      </Select>
    </LabelInputBox>
    </>
  );
};
