import { MyMember, Visibility } from "@looking-for-group/shared";
import { userDataManager } from "../../../api/data-managers/user-data-manager";
import { PendingUserProfile } from "../../../../types/types";
import usePreloadedImage from "../../../functions/imageLoad";
import placeholderThumbnail from "../../../images/project_temp.png";
import { ThemeIcon } from "../../ThemeIcon";

/**
 * Component for each project to display within the Profile Projects tab. Appears as a tile.
 * @param projectData A single project's data.
 * @returns JSX Element
 */
const ProjectTile = ({
  membershipData,
  onVisibilityToggled,
}: {
  membershipData: MyMember;
  onVisibilityToggled: () => void;
}) => {
  const projectData = membershipData.project;

  return (
    <div className="projectTile" key={projectData.projectId}>
      <img
        src={usePreloadedImage(
          projectData.thumbnail?.image || placeholderThumbnail,
          placeholderThumbnail
        )}
        alt={
          projectData.thumbnail?.altText || `Thumbnail for ${projectData.title}`
        }
      />
      {/*TODO: use visibility here*/}
      {/* isVisible && <div className='image-overlay'/> */}
      <button
        className="project-visibility-button"
        onClick={(e) => {
          e.preventDefault();
          onVisibilityToggled();
        }}
      >
        <ThemeIcon
          id={membershipData.visibility === "Public" ? "eye" : "eye-line"}
          width={19}
          height={membershipData.visibility === "Public" ? 13 : 18}
          className={"mono-fill-invert"}
          ariaLabel={"Toggle visibility"}
        />
      </button>
      {/* {<p>{projectData.title}</p>} */}
    </div>
  );
};

type ProjectsTabProps = {
  profile: PendingUserProfile;
  dataManager: Awaited<ReturnType<typeof userDataManager>>;
  updatePendingProfile: (profileData: PendingUserProfile) => void;
};

/**
 * Profile Projects tab. Tab for displaying the projects that the user is currently a part of, rendering each project as "ProjectTiles" to display.
 * @param dataManager Handles data changes to save changes later.
 * @param profile Temporary profile data.
 * @param updatePendingProfile Updates profile data.
 * @returns JSX Element
 */
export const ProjectsTab = ({
  dataManager,
  profile,
  updatePendingProfile,
}: ProjectsTabProps) => {

  /**
   * Changes the visibility of a project.
   * @param projectId Project ID of the project that is affected.
   * @param newVisibility Visibility to set the project to.
   */
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
          profile.projects.map((membership: MyMember) => (
            <ProjectTile
              membershipData={membership}
              key={`project-${membership.project.projectId}`}
              onVisibilityToggled={() =>
                onProjectVisibilityChanged(
                  membership.project.projectId,
                  membership.visibility === "Public" ? "Private" : "Public"
                )
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
