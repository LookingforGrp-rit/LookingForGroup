import {
  MePrivate,
  MyMember,
  ProjectPreview,
  Visibility,
} from "@looking-for-group/shared";
import { userDataManager } from "../../../api/data-managers/user-data-manager";
import { PendingUserProfile } from "../../../../types/types";

// TODO add visibility toggle
const ProjectTile = ({
  projectData,
  onVisibilityChanged,
}: {
  projectData: ProjectPreview;
  onVisibilityChanged: (visibility: Visibility) => void;
}) => {
  return (
    <div className="projectTile" id={`project-tile-${projectData.projectId}`}>
      <img
        src={projectData.thumbnail?.image}
        alt={
          projectData.thumbnail?.altText || `Thumbnail for ${projectData.title}`
        }
      />
      {<p>{projectData.title}</p>}
    </div>
  );
};

type ProjectsTabProps = {
  profile: MePrivate;
  dataManager: Awaited<ReturnType<typeof userDataManager>>;
  updatePendingProfile: (profileData: PendingUserProfile) => void;
};

export const ProjectsTab = ({
  profile,
  dataManager,
  updatePendingProfile,
}: ProjectsTabProps) => {
  const onProjectVisibilityChanged = (
    projectId: number,
    newVisibility: Visibility
  ) => {
    dataManager.updateProjectVisibility({
      id: {
        type: "canon",
        value: projectId,
      },
      data: {
        visibility: newVisibility,
      },
    });

    const updatedProject: MyMember = {
      ...profile.projects.find(
        ({ project }) => project.projectId === projectId
      )!,
      visibility: newVisibility,
    };

    updatePendingProfile({
      ...profile,
      projects: [
        ...profile.projects.filter(
          ({ project }) => project.projectId !== projectId
        ),
        updatedProject,
      ],
    });
  };

  return (
    <div id="profile-editor-projects">
      <div className="project-editor-section-header">Projects</div>
      <div className="project-editor-extra-info">
        Choose to hide/show projects you've worked on.
      </div>
      <div id="profile-editor-project-selection">
        {profile.projects.length > 0 ? (
          profile.projects.map(({ project }: { project: ProjectPreview }) => (
            <ProjectTile
              projectData={project}
              onVisibilityChanged={(visibility: Visibility) =>
                onProjectVisibilityChanged(project.projectId, visibility)
              }
            />
          ))
        ) : (
          <p>You have no projects yet!</p>
        )}
      </div>
    </div>
  );
};
