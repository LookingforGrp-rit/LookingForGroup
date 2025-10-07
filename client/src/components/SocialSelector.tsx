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
import '../../public/FontAwesome/css/brands.css';

import { JSX, useState, useEffect } from 'react';
import { getSocials as fetchSocials } from '../api/users'; 
import type { Social } from '@looking-for-group/shared';

interface SocialSelectorProps {
  value: number;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
}

export const SocialSelector = ({ value, onChange}: SocialSelectorProps): JSX.Element => {
const [socials, setSocials] = useState<Social[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchSocials();
      setSocials(data);
    };
    fetchData();
  }, []);

  return (
    <div className="editor-input-item">
      <select id="profile-editor-social" onChange={onChange}>
        {socials.map((social) => (
          <option
            key={`${social.websiteId}-${social.label}`}
            value={social.websiteId}
          >
            {social.label}
          </option>
        ))}
      </select>
    </div>
  );
};
