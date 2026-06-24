import { data, useNavigate } from "react-router-dom";
import { Dispatch, SetStateAction, useState } from "react";
import { EmailInput, ProjectWithFollowers, RequestToJoinInput } from "@looking-for-group/shared";
import { PopupButton } from "./Popup";
import * as paths from "../constants/routes";

import {
  JobAvailability as JobAvailabilityEnums,
  JobDuration as JobDurationEnums,
  JobLocation as JobLocationEnums,
  JobCompensation as JobCompensationEnums,
} from "@looking-for-group/shared/enums";

import requestJoinController from "../../../server/src/api/controllers/projects/members/request-to-join"
import { getCurrentAccount } from "../api/users";
import { requestToJoinService } from "../../../server/src/services/projects/members/request-to-join";

interface TeamPositionsPanelProps {
  displayedProject: ProjectWithFollowers;
  viewedPosition: number;
  setViewedPosition: Dispatch<SetStateAction<number>>;
}

export const TeamPositionsPanel = ({ displayedProject, viewedPosition, setViewedPosition }: TeamPositionsPanelProps) => {
  const navigate = useNavigate();

  //Find first member with the job title of 'Project Lead'
  //If no such member exists, use first member in project member list
  const projectLead = displayedProject?.owner;

  // Local state for the Quick Apply UI. Delivery (email / notification / etc.)
  // is not wired up yet — the click handler currently only flips local state.
  // TODO: replace the console.log below with the real send call once the delivery
  // mechanism is decided.
  const [joinMessage, setJoinMessage] = useState("");
  const [quickApplyOpen, setQuickApplyOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleQuickApply = async () => {
    const viewedRole = displayedProject.jobs?.[viewedPosition]?.role?.label;

    console.log("[Quick Apply] would notify owner", {
      projectId: displayedProject.projectId,
      projectTitle: displayedProject.title,
      ownerUserId: projectLead?.userId,
      viewedRole,
      message: joinMessage,
    });

    const currentUserId = (await getCurrentAccount()).data?.userId;
    let requestInfo;

    if (currentUserId) {
      requestInfo = {
        ownerUserId: projectLead.userId,
        prospectiveMemberId: currentUserId,
        roleId: displayedProject.jobs?.[viewedPosition]?.role.roleId,
        message: joinMessage
      };
    }

    if (requestInfo) {
      requestToJoinService(displayedProject.projectId, requestInfo);
    }

    setRequestSent(true);
  };

  return <div id="project-open-positions-popup">
    <div id="positions-popup-header">Join The Team</div>
    <div id="join-team-open-positions-info">
      {/* Left Container */}
      <div className="positions-popup-list">
        <p className="positions-popup-info-title">
          Open Positions
        </p>
        <div id="team-positions-popup-list-buttons">
          {displayedProject.jobs?.map((job, index) => (
            <button
              className={`positions-popup-list-item`}
              id={
                index === viewedPosition
                  ? "positions-popup-list-item-active"
                  : ""
              }
              onClick={() => setViewedPosition(index)}
              key={index}
            >
              {job.role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Container */}
      <div className="positions-popup-info-wrapper">
        <div className="positions-popup-info">
          <div className="positions-popup-info-title">
            {displayedProject.jobs[viewedPosition]?.role
              ?.label ?? undefined}
          </div>

          <div id="position-description-header">
            What we are looking for:
          </div>

          <div
            id="position-description-content"
            className="positions-popup-info-description"
          >
            {displayedProject.jobs[viewedPosition]?.description}
          </div>

          <div id="open-position-details">
            <div id="open-position-details-left">
              <div id="position-availability">
                <span className="position-detail-indicator">
                  Availability:{" "}
                </span>
                {
                  JobAvailabilityEnums[
                  displayedProject.jobs[viewedPosition]
                    ?.availability
                  ]
                }
              </div>
              <div id="position-location">
                <span className="position-detail-indicator">
                  Location:{" "}
                </span>
                {
                  JobLocationEnums[
                  displayedProject.jobs[viewedPosition]
                    ?.location
                  ]
                }
              </div>
            </div>

            <div id="open-position-details-right">
              <div id="position-duration">
                <span className="position-detail-indicator">
                  Duration:{" "}
                </span>
                {
                  JobDurationEnums[
                  displayedProject.jobs[viewedPosition]
                    ?.duration
                  ]
                }
              </div>
              <div id="position-compensation">
                <span className="position-detail-indicator">
                  Compensation:{" "}
                </span>
                {
                  JobCompensationEnums[
                  displayedProject.jobs[viewedPosition]
                    ?.compensation
                  ]
                }
              </div>
            </div>
          </div>
        </div>

        <div id="position-contact">
          {requestSent ? (
            <span id="position-join-request-confirmation">
              Request sent! {projectLead?.firstName} will be in touch.
            </span>
          ) : (
            <>
              Message{" "}
              <span
                onClick={() =>
                  navigate(
                    `${paths.routes.PROFILE}?userID=${projectLead?.userId}`
                  )
                }
                id="position-contact-link"
              >
                {projectLead?.firstName} {projectLead?.lastName}
              </span>
              {" "}or{" "}
              <button
                type="button"
                id="position-join-request-button"
                onClick={() => {
                  if (quickApplyOpen) {
                    handleQuickApply();
                  } else {
                    setQuickApplyOpen(true);
                  }
                }}
              >
                {quickApplyOpen ? "Send" : "Quick Apply"}
              </button>
            </>
          )}
        </div>

        {quickApplyOpen && !requestSent && (
          <div id="position-join-request">
            <label
              htmlFor="position-join-request-message"
              id="position-join-request-label"
            >
              Add a message (optional)
            </label>
            <textarea
              id="position-join-request-message"
              placeholder={`Let ${projectLead?.firstName ?? "the owner"} know why you'd be a good fit...`}
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              maxLength={500}
            />
          </div>
        )}
      </div>
    </div>

    <PopupButton buttonId="positions-popup-close">
      Close
    </PopupButton>
  </div>
}