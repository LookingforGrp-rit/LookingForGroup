import { Endorsement } from '../Endorsement';
import edit from '../../icons/edit.png';
import { PagePopup, openClosePopup } from '../PagePopup';
import { useState, useEffect } from 'react';
import {getByID } from '../../api/projects';

interface Project {
  id: number;
  name: string;
  description? :string;
  thumbnail?: string;
  tags?: string[];
}

interface User {
  _id: number;
  likedProjects: number[] | Project[]; //IDs or entire objects
}

interface ProfileEndorsementsProps {
  user: User;
}

export const ProfileEndorsements: React.FC<ProfileEndorsementsProps> = ({ user }) => {
  // usestates for the "edit endorsements" popup
  const [showPopup, setShowPopup] = useState(false);
  const [likedProjects, setLikedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      if (user.likedProjects.length > 0 && typeof user.likedProjects[0] === 'number') {
        // If likedProjects are IDs, fetch those projects
        const projects = await Promise.all (
          (user.likedProjects as number[]).map((id) => getByID(id))
        );
        setLikedProjects(projects.map((p) => p.data));
      } else {
        // For those that are full project objects
        setLikedProjects(user.likedProjects as Project[]);
      }
      setLoading(false);
    };
    fetchProjects();
  }, [user]);

  let content;
  if (loading) {
    content = <p>Loading liked projects...</p>;
  } else if (likedProjects.length > 0) {
    content = likedProjects.map((project) => (
      <Endorsement key={project.id} project={project} />
    ));
  } else {
    content = <p>This user hasn't liked any projects yet.</p>;
  }

  return (
    <section id="profile-endorsements">
      <div className="profile-name-button">
        <h1>Endorsements</h1>
        {/*TODO: only show when a user views their own profile*/}
        <button className="icon-button" onClick={() => openClosePopup(showPopup, setShowPopup)}>
          <img src={edit} alt="Edit" />
        </button>
      </div>

      {/*div containing all the endorsements*/}
      <div id="profile-endorseList">{content}</div>

      {/*edit endorsement popup*/}
      <PagePopup
        width={'80vw'}
        height={'80vh'}
        popupId={0}
        zIndex={3}
        show={showPopup}
        setShow={setShowPopup}
      >
        <div id="profile-edit-endorsements" className="profile-edit">
          <h1>Edit Endorsements</h1>
          <h3>Select projects to be highlighted on your page</h3>
          <div id="profile-edit-endorsements-list" className="profile-list">
            {likedProjects.map((project) => (
              <Endorsement key={project.id} project={project} />
            ))}
          </div>
        </div>
      </PagePopup>
    </section>
  );
};
