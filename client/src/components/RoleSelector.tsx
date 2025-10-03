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
import { getJobTitles } from '../api/users';
import { Role } from '@looking-for-group/shared';

export const RoleSelector = () => {
  const [options, setOptions] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const setUpRoleSelector = async () => {
      const roles: Role[] = (await getJobTitles()) ?? [];
      setOptions(
        roles.map((role) => (
          <option key={role.roleId} value={role.roleId}>
            {role.label}
          </option>
        ))
      );
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
