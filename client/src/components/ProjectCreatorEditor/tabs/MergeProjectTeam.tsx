import { useState } from "react";
import { Popup, PopupButton, PopupContent } from "../../Popup";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { ThemeIcon } from "../../ThemeIcon";
import { getProjectsByUser } from "../../../api/users";
import { getByID } from "../../../api/projects";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
import { MemberRequests, ProjectDetail, ProjectMember } from "@looking-for-group/shared";
import { PendingProjectMember } from "../../../../types/types";

// Local-change ids for queued invites. Starts high so it can't collide with
// TeamTab's own localIdIncrement counter for individually-invited members.
let mergeLocalId = 100000;

interface MergeProjectTeamProps {
  dataManager?: Awaited<ReturnType<typeof projectDataManager>>;
  /** The project being edited (invites are queued onto this project). */
  targetProjectId: number;
  /** Members already on the target team (used to skip duplicates). */
  currentMembers: (ProjectMember | PendingProjectMember)[];
  /** Who the invites are sent from (current user / project owner). */
  ownerUserId: number | null;
  pendingInvitations: MemberRequests[];
  setPendingInvitations: React.Dispatch<React.SetStateAction<MemberRequests[]>>;
  /** Called after invites are queued so the editor marks the project unsaved. */
  onInvitesQueued: () => void;
}

/**
 * "Merge Project Team": invites every member of another project the user is on
 * (e.g. an audio team) onto the project being edited, keeping each member's
 * role from the source project. Reuses the Team tab's invite flow, so nothing
 * is forced — each member gets a normal invite, sent when changes are saved.
 */
export const MergeProjectTeam = ({
  dataManager,
  targetProjectId,
  currentMembers,
  ownerUserId,
  pendingInvitations,
  setPendingInvitations,
  onInvitesQueued,
}: MergeProjectTeamProps) => {
  // The user's other projects, loaded when the popup opens.
  const [myProjects, setMyProjects] = useState<ProjectDetail[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [status, setStatus] = useState("");
  const [succeeded, setSucceeded] = useState(false);

  /** Loads the user's projects (minus the one being edited) for the picker. */
  const loadProjects = async () => {
    setStatus("");
    setSucceeded(false);
    setSelectedProject(null);
    const res = await getProjectsByUser();
    setMyProjects(
      (res.data ?? []).filter((p) => p.projectId !== targetProjectId)
    );
  };

  /** Queues an invite for every source-project member not already involved. */
  const handleMerge = async () => {
    if (!selectedProject) {
      setSucceeded(false);
      setStatus("Select a project to merge from.");
      return;
    }
    if (!dataManager || ownerUserId === null) {
      setSucceeded(false);
      setStatus("Something went wrong. Try reopening the editor.");
      return;
    }

    // Pull the source project's full member list.
    const res = await getByID(selectedProject.projectId);
    const sourceMembers = res.data?.members ?? [];

    // Skip people already on this team, already invited, or the inviter.
    const alreadyOnTeam = new Set(
      currentMembers.map((m) => m.user?.userId).filter(Boolean)
    );
    const alreadyInvited = new Set(
      pendingInvitations
        .filter((i) => i.requestStatus === "Pending")
        .map((i) => i.prospectiveMemberId)
    );

    const toInvite = sourceMembers.filter(
      (m) =>
        m.user &&
        m.user.userId !== ownerUserId &&
        !alreadyOnTeam.has(m.user.userId) &&
        !alreadyInvited.has(m.user.userId)
    );

    if (toInvite.length === 0) {
      setSucceeded(false);
      setStatus(
        "Everyone on that project is already on this team or has a pending invite."
      );
      return;
    }

    // Queue an invite per member, keeping their role from the source project.
    const newInvites: MemberRequests[] = [];
    for (const member of toInvite) {
      dataManager.createMember({
        id: { value: ++mergeLocalId, type: "local" },
        data: {
          prospectiveMemberId: member.user.userId,
          ownerUserId: ownerUserId,
          roleId: member.role.roleId,
          message: `Your team from "${selectedProject.title}" is merging into this project.`,
        },
      });

      newInvites.push({
        requestId: 0,
        prospectiveMemberId: member.user.userId,
        projectId: targetProjectId,
        roleId: member.role.roleId,
        sentFromProject: true,
        requestStatus: "Pending",
      });
    }

    setPendingInvitations((prev) => [...prev, ...newInvites]);
    onInvitesQueued();

    setSucceeded(true);
    setStatus(
      `Queued ${newInvites.length} invite${newInvites.length === 1 ? "" : "s"} from "${selectedProject.title}". They'll be sent when you save changes.`
    );
  };

  return (
    <div id="merge-project-team">
      <Popup>
        <PopupButton buttonId="project-editor-merge-team" callback={loadProjects}>
          <ThemeIcon
            id="add-person"
            width={40}
            height={40}
            className="header-color-fill"
            ariaLabel="merge project team"
          />
          <div id="project-team-merge-text">Merge Project Team</div>
        </PopupButton>
        <PopupContent useClose={true}>
          <div id="project-team-add-member-title">Merge Project Team</div>
          <div className="project-editor-extra-info" id="merge-team-info">
            Invite everyone from another one of your projects onto this team,
            keeping their current roles. Each member gets a normal invite to
            accept or decline — invites are sent when you save changes.
          </div>
          <div className={succeeded ? "success" : "error"} id="merge-team-status">
            {status}
          </div>
          <div id="merge-team-select">
            <Select>
              <SelectButton
                placeholder="Select one of your projects"
                searchable={true}
                type="input"
              />
              <SelectOptions
                callback={(e) => {
                  const value = (e.target as HTMLButtonElement).value;
                  setSelectedProject(
                    myProjects.find((p) => p.title === value) ?? null
                  );
                }}
                options={myProjects.map((p) => ({
                  markup: <>{p.title}</>,
                  value: p.title,
                  disabled: false,
                }))}
              />
            </Select>
          </div>
          <div className="project-editor-button-pair">
            <PopupButton
              buttonId="team-add-member-add-button"
              doNotClose={() => true}
              callback={handleMerge}
            >
              Merge Team
            </PopupButton>
            <PopupButton buttonId="team-add-member-cancel-button" className="button-reset">
              Cancel
            </PopupButton>
          </div>
        </PopupContent>
      </Popup>
    </div>
  );
};

export default MergeProjectTeam;
