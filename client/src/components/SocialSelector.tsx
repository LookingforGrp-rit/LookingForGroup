import { JSX, useState, useEffect } from 'react';
import { getSocials as fetchSocials } from '../api/users'; 
import type { Social } from '@looking-for-group/shared';

interface SocialSelectorProps {
  value: number; // Currently selected social media website ID
  onChange: React.ChangeEventHandler<HTMLSelectElement>; // Change handler called when the user selects a new option
}

/**
 * Renders a dropdown menu for selecting a social media platform.
 * Fetches available socials from the API on mount and populates the select options.
 *
 * @param value - Currently selected social website ID
 * @param onChange - Change handler called when the user selects a new option
 * @returns JSX element containing a select dropdown of social platforms
 */
export const SocialSelector = ({ value, onChange}: SocialSelectorProps): JSX.Element => {
  // Stores the list of social platforms fetched from the API
  const [socials, setSocials] = useState<Social[]>([]);

  /**
   * Fetches the list of social platforms on component mount.
   * Updates the `socials` state with the fetched data.
   */
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchSocials();
      if(data.data) setSocials(data.data);
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
