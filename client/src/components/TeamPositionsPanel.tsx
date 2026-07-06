import { useNavigate, useLocation } from "react-router-dom";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { ProjectWithFollowers } from "@looking-for-group/shared";
import profileImage from "../images/lfrog.png";
import { PopupButton } from "./Popup";
import * as paths from "../constants/routes";
import { requestToJoin, getMemberRequest } from '../api/projects.ts';
import {
  JobAvailability as JobAvailabilityEnums,
  JobDuration as JobDurationEnums,
  JobLocation as JobLocationEnums,
  JobCompensation as JobCompensationEnums,
} from "@looking-for-group/shared/enums";

interface TeamPositionsPanelProps {
  currentUserId?: number,
  displayedProject: ProjectWithFollowers;
  viewedPosition: number;
  setViewedPosition: Dispatch<SetStateAction<number>>;
}

export const TeamPositionsPanel = ({ currentUserId, displayedProject, viewedPosition, setViewedPosition }: TeamPositionsPanelProps) => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access the current location

  const currentJob = displayedProject.jobs?.[viewedPosition];
  const jobContact = useMemo(() => {
    if (!currentJob?.contact) {
      return displayedProject?.owner;
    }
    return currentJob.contact;
  }, [currentJob, displayedProject?.owner]);

  // Local state for the Quick Apply UI. Delivery (email / notification / etc.)
  // is not wired up yet — the click handler currently only flips local state.
  const [joinMessage, setJoinMessage] = useState<string>("");
  const [systemMessage, setSystemMessage] = useState<string>("");
  const [allowApply, setAllowApply] = useState<boolean>(true);
  const [quickApplyOpen, setQuickApplyOpen] = useState<boolean>(false);
  const [requestSent, setRequestSent] = useState<boolean>(false);

  /**
   * Handles application and updates the application status message
   * @returns Void
   */
  const handleQuickApply = async (): Promise<void> => {
    if (!currentUserId) return;

    try {
      await requestToJoin(displayedProject.projectId, {
        ownerUserId: jobContact?.userId,
        prospectiveMemberId: currentUserId,
        roleId: displayedProject.jobs?.[viewedPosition]?.role?.roleId,
        message: joinMessage,
      });
      setSystemMessage(`Request sent! ${jobContact?.firstName} will be in touch.`);
    } catch (e) {
      console.log(e);
      setSystemMessage('Uh-oh! Something went wrong. Please try again later.');
    }
    setRequestSent(true);
  };

  /**
   * Checks whether the current user has already applied for or been invited to
   * this position, then updates the application status message and whether they
   * can apply.
   * @param jobIndex Index of the position
   * @returns Void
   */
  const checkApplied = async (jobIndex: number): Promise<void> => {
    // check if user is logged in
    if (!currentUserId) {
      return;
    }
    try {
      // if an error is thrown -> no request found
      const result = await getMemberRequest({
        projectId: displayedProject.projectId,
        prospectiveMemberId: currentUserId,
        roleId: displayedProject.jobs?.[jobIndex]?.role?.roleId
      });

      if (result.data?.requestStatus === "Accepted") {
        setSystemMessage('Your have been accepted for this position.');
        setAllowApply(false);
      } else if (result.data?.requestStatus === "Pending") {
        setSystemMessage('Your status for this position is currently under review.');
        setAllowApply(false);
      } else if (result.data?.requestStatus === "Declined") {
        setSystemMessage('Note: You were previously invited to or applied for this position, but you declined the opportunity or your application was not accepted.');
        setAllowApply(true);
      }

    } catch (e) {
      // no request made before
      setAllowApply(true);
      setSystemMessage('');
    }
  };

  useEffect(() => {
    checkApplied(viewedPosition);
  }, []);

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
              onClick={async () => { await checkApplied(index); setViewedPosition(index); }}
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
            {currentJob.role?.label ?? undefined}
          </div>

          <div id="position-description-header">
            What we are looking for:
          </div>

          <div
            id="position-description-content"
            className="positions-popup-info-description"
          >
            {currentJob?.description}
          </div>

          <div id="open-position-details">
            <div id="open-position-details-left">
              <div id="position-availability">
                <span className="position-detail-indicator">
                  Availability:{" "}
                </span>
                {JobAvailabilityEnums[currentJob?.availability]}
              </div>
              <div id="position-location">
                <span className="position-detail-indicator">
                  Location:{" "}
                </span>
                {JobLocationEnums[currentJob?.location]}
              </div>
            </div>

            <div id="open-position-details-right">
              <div id="position-duration">
                <span className="position-detail-indicator">
                  Duration:{" "}
                </span>
                {JobDurationEnums[currentJob?.duration]}
              </div>
              <div id="position-compensation">
                <span className="position-detail-indicator">
                  Compensation:{" "}
                </span>
                {JobCompensationEnums[currentJob?.compensation]}
              </div>
            </div>
          </div>
        </div>

        <div id="position-contact">
          <span id="position-join-request-confirmation">
            {systemMessage}
          </span>
          {(allowApply && !requestSent) && (
            <div id="position-apply">
              Message{" "}
              <span
                onClick={() =>
                  navigate(
                    `${paths.routes.PROFILE}?userID=${jobContact?.userId}`
                  )
                }
                id="position-contact-link"
              >
                <img
                  className="project-member-image"
                  src={
                    jobContact?.profileImage ?? profileImage
                  }
                  alt="profile picture"
                  onError={(e) => {
                    // default profile picture if user image doesn't load
                    // Cannot use usePreloadedImage function because this is in a callback
                    const profileImg = e.target as HTMLImageElement;
                    profileImg.src = profileImage;
                  }}
                />
                {jobContact?.firstName} {jobContact?.lastName}
              </span>

              {" "}or{" "}
              <button
                type="button"
                id="position-join-request-button"
                onClick={() => {
                  if (quickApplyOpen) {
                    handleQuickApply();
                  } else {
                    // if not logged in, send to login page
                    if (!currentUserId) {
                      navigate(paths.routes.LOGIN, {
                        state: { from: location }
                      });
                    // otherwise, show quick apply fields 
                    } else {
                      setQuickApplyOpen(true);
                    }
                  }
                }}
              >
                {quickApplyOpen ? "Send" : "Quick Apply"}
              </button>
            </div>
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
              placeholder={`Let ${jobContact?.firstName ?? "the owner"} know why you'd be a good fit...`}
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