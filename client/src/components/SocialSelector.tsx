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

import { useState, useEffect } from 'react';
import { JSX } from 'react';

interface Social {
  id: string | number;
  label: string;
}

interface SocialSelectorProps {
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
}

const getSocials = async (): Promise<Social[]> => {
  // TODO: create error handling, try catch block
  const response = await fetch('/api/datasets/socials');
  const { data } = await response.json();
  return data;
};

export const SocialSelector: React.FC<SocialSelectorProps> = (props) => {
const [options, setOptions] = useState<JSX.Element[] | null>(null);

  useEffect(() => {
    const setUpSocialSelector = async () => {
      const socials = await getSocials();
      const selectorOptions = socials.map((social, i) => {
        if(`${props.value}` === `${i}`) {
          console.log('Social Website:');
          console.log(social.label.toLowerCase());
          
          return <option value={social.id} key={`${social.id}-${social.label}`} selected>{/*<i className={`fa-brands fa-${social.label.toLowerCase()}`}></i>*/}{social.label}</option>;
        }
        return <option value={social.id} key={`${social.id}-${social.label}`}>{/*<i className={`fa-brands fa-${social.label.toLowerCase()}`}></i>*/}{social.label}</option>;
      });
      setOptions(selectorOptions);
    };
    setUpSocialSelector();
  }, []);

  return (
    <div className="editor-input-item">
      <select id="profile-editor-social" onChange={props.onChange}>{options}</select>
    </div>
  );
};
