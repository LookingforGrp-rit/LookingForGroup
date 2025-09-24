import profilePicture from '../images/blue_frog.png';
import { Tags } from './Tags';

interface Project {
  id: number;
  name: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];
}

interface EndorsementProps {
  project: Project;
}

//used on the profile page to show an endorsement
export const Endorsement: React.FC<EndorsementProps> = ({ project }) => {
  return (
    <div id="endorsement" className="endorsement-card">
      <img
        id="endorsement-thumbnail"
        src={project.thumbnail ?? profilePicture}
        alt={project.name}
        className="endorsement-image"
      />
      <div id="endorsement-body">
        <p id="endorsement-text">
          <b>{project.name}</b>
        </p>
        {project.description && <p>{project.description}</p>}
        {project.tags && project.tags.length > 0 && (
          <div id="profile-endorsement-tags" className="profile-list">
            {/* The tags that go with the project */}
            {project.tags.map((tag) => (
              <Tags key={tag}>{tag}</Tags>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
