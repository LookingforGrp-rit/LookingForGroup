import React, { useState, useEffect } from 'react';
import { getCurrentUsername, getUsersById, getSocials } from '../../../api/users';
import { UserSocial, Social, MeDetail } from '@looking-for-group/shared';
import { Select, SelectButton, SelectOptions } from '../../Select';
import { ThemeIcon } from '../../ThemeIcon';
import { Input } from '../../Input';

interface LinksTabProps {
  profile: MeDetail;
  setProfile: React.Dispatch<React.SetStateAction<MeDetail>>
}

export const LinksTab: React.FC<LinksTabProps> = ({ profile, setProfile }) => {
  const [socials, setSocials] = useState<UserSocial[]>(profile.socials || []);

  // complete list of socials
  const [allSocials, setAllSocials] = useState<Social[]>([]);

  // Get social option data
  useEffect(() => {
    const getAllSocials = async () => {
      const response = await getSocials();

      // Reorder so 'Other' is last
      if (response?.data) {
        const otherIndex = response.data.findIndex(s => s.label === 'Other');
        if (otherIndex > -1) {
          const other = response.data.splice(otherIndex, 1)[0];
          response.data.push(other);
        }
      }

      setAllSocials(response.data!);
    };
    getAllSocials();
  }, []);

  
  useEffect(() => {
  setProfile(prev => ({
    ...prev,
    socials: socials
  }));
}, [socials]);

  // Tab Component ----------------------
  return (
    <div id="editor-links">
      <div className="editor-header">Social Links</div>
      <div className="editor-extra-info">
        Provide the links to pages you wish to include on your page.
      </div>
      {/* <div className='error'>{error}</div> */}

      <div id="editor-link-list">
        {/* Social URL inputs */}
        { socials && socials.map((social, index) => (
          <div className="editor-link-item" key={index}>
            {/* Social type dropdown */}
            <Select>
              <SelectButton
                placeholder='Select'
                initialVal={
                  social.label !== '' && <>
                    <ThemeIcon
                      width={20}
                      height={20}
                      id={
                        social.label === 'Other' ? 'link' :
                        // TODO: revisit twitter/x label
                        social.label === 'Twitter' ? 'x' :
                        social.label.toLowerCase()
                      }
                      className={'mono-fill'}
                      ariaLabel={social.label}
                    />
                    {social.label}
                  </>
                }
                className='link-select'
                type={"input"}
                callback={(e) => {
                  e.preventDefault();
                }}
              />
              <SelectOptions
                callback={(e) => {
                  e.preventDefault();
                  const tempSocials = [...socials];
                  tempSocials[index].label = (e.target as HTMLInputElement).value;
                  setSocials(tempSocials);
                }}
                options={allSocials ? allSocials.map(website => {
                  return {
                    markup:
                    <>
                      <ThemeIcon
                        width={20}
                        height={20}
                        id={
                          website.label === 'Other' ? 'link' :
                          // TODO: revisit twitter/x label
                          website.label === 'Twitter' ? 'x' :
                          website.label.toLowerCase()
                        }
                        className={'mono-fill'}
                        ariaLabel={website.label}
                      />
                      {website.label}
                    </>,
                    value: website.label,
                    disabled: false,
                  };
                }) : []}
              />
            </Select>
            {/* Social URL input */}
            <Input
              type="link"
              placeholder="URL"
              value={social.url}
              onChange={(e) => {
                e.preventDefault();
                // TODO: Implement some sort of security check for URLs.
                // Could be as simple as checking the URL matches the social media
                // But since 'Other' is an option, might be good to just find some
                // external list of suspicious sites and make sure it's not one of those.
                const tempSocials = [...socials];
                tempSocials[index].url = (e.target as HTMLInputElement).value;
                setSocials(tempSocials);
              }}
              onClick={(e) => {
                e.preventDefault();
                (e.target as HTMLElement).closest('.editor-link-item')?.remove();
              }}
            />
          </div>
        ))}
        <div id="add-link-container">
          <button id="profile-editor-add-link"
            onClick={(e) => {
              e.preventDefault();
              setSocials([...socials, {
                label: '',
                url: '',
                websiteId: 0
              }]);
            }}>
            <i className="fa fa-plus" />
            <p>Add social profile</p>
          </button>
        </div>
      </div>
    </div>
  );
};