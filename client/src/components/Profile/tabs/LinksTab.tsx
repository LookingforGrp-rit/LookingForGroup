import React, { useState, useEffect, useRef } from 'react';
import { sendPut, sendFile } from '../../../functions/fetch';
import { SocialSelector } from '../../SocialSelector';
import { getByID } from '../../../api/projects';
import { getCurrentUsername, getUsers, getUsersById } from '../../../api/users';
import { UserSocial, ProjectSocial, UserDetail, ProjectDetail } from '@looking-for-group/shared';

interface LinksTabProps {
  type: 'project' | 'user';
  socials?: UserSocial[] | ProjectSocial[];
}

export const LinksTab: React.FC<LinksTabProps> = ({ type, socials: initialSocials }) => {
  const [links, setLinks] = useState<UserSocial[] | ProjectSocial[]>(initialSocials || []);

  useEffect(() => {
    const loadSocials = async () => {
      if (initialSocials && initialSocials.length > 0) return;

      // Pick which socials to use based on type
      const userID = await getCurrentUsername();

      let response;
      
      if (type === 'project') {
        const projectData = await getByID(userID.toString());
        if (projectData.projectSocials) {
          setLinks(projectData.projectSocials);
        }
      } else {
        response = await getUsersById(userID.toString());
        if (response.data[0].socials) {
          setLinks(response.data[0].socials);
        }
      }
    };
    loadSocials();

  }, [initialSocials, type]);
  // Update Functions ----------------------

  const updateURL = (index: number, newUrl: string) => {
    setLinks(prev => prev.map((l, i) => (i === index ? { ...l, url: newUrl } : l)));
  }

  const updateWebsite = (index: number, newId: number) => {
    setLinks(prev => prev.map((l, i) => (i === index ? { ...l, websiteId: newId } : l)));
  }

  // Button Functions ----------------------

  const onAddLinkClicked = (e: React.MouseEvent) => {
    e.preventDefault();
    // Save current state
    // Adds another LinkInput into the chain
    setLinks(prev => [...prev, { websiteId: 0, url: ''} as UserSocial]);
  };

  const onRemoveLinkClicked = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    // save this change into the state
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  // Components ----------------------

  const LinkInput: React.FC<{ data: UserSocial | ProjectSocial; index: number }> = ({ data, index }) => {
    const [text, setText] = useState(data.url || '');

    return (
      <div id={`link-${index}`} className='link-input'>
        <SocialSelector value={data.websiteId}
          onChange={e => updateWebsite(index, e.target.selectedIndex)} />
        <div className='link-input-wrapper'>
          <div className='editor-input-item'>
            <input type="text" name="url" id="link-url-input" placeholder="URL" value={text}
              onChange={e => {setText(e.target.value); updateURL(index, e.target.value);
                }}/>
            <button className='remove-link-button' onClick={e => onRemoveLinkClicked(e, index)}>
              <i className="fa-solid fa-minus"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LinkContainer = () => {
    if (links.length === 0) return <p>No Socials Posted!</p>;

    return (
      <div id="links-container">
        {links.map((link, i) => (
          <LinkInput key={i} data={link} index={i}/>
        ))}
      </div>
    )
  };

  // Tab Component ----------------------

  return (
    <div id="profile-editor-links" className="hidden">
      <div className="project-editor-section-header">Social Links</div>
      <div className="project-editor-extra-info">
        Provide any links you wish to include on your page.
      </div>
      <div id="project-editor-link-list">
        <LinkContainer />
        <div id='add-link-container'>
          <button id="profile-editor-add-link" onClick={onAddLinkClicked}>+ Add Social Profile</button>
        </div>
      </div>
    </div>
  );
};

export const getSocials = (linksState: UserSocial[] | ProjectSocial[]): UserSocial[] | ProjectSocial[] => {
  return linksState;
}