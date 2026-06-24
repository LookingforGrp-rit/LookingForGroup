import { useNavigate } from "react-router-dom";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { ProjectWithFollowers } from "@looking-for-group/shared";
import profileImage from "../images/blue_frog.png";
import { PopupButton } from "./Popup";
import * as paths from "../constants/routes";
import {
  JobAvailability as JobAvailabilityEnums,
  JobDuration as JobDurationEnums,
  JobLocation as JobLocationEnums,
  JobCompensation as JobCompensationEnums,
} from "@looking-for-group/shared/enums";

interface TeamPositionsPanelProps {
  displayedProject: ProjectWithFollowers;
  viewedPosition: number;
  setViewedPosition: Dispatch<SetStateAction<number>>;
}

export const TeamPositionsPanel = ({ displayedProject, viewedPosition, setViewedPosition }: TeamPositionsPanelProps) => {
  const navigate = useNavigate();

  const currentJob = displayedProject.jobs?.[viewedPosition];
  const jobContact = useMemo(() => {
    if (!currentJob?.contact) {
      return displayedProject?.owner;
    }
    return currentJob.contact;
  }, [currentJob, displayedProject?.owner]);

  // Local state for the Quick Apply UI. Delivery (email / notification / etc.)
  // is not wired up yet — the click handler currently only flips local state.
  // TODO: replace the console.log below with the real send call once the delivery
  // mechanism is decided.
  const [joinMessage, setJoinMessage] = useState("");
  const [quickApplyOpen, setQuickApplyOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleQuickApply = () => {
    const viewedRole = displayedProject.jobs?.[viewedPosition]?.role?.label;
    console.log("[Quick Apply] would notify owner", {
      projectId: displayedProject.projectId,
      projectTitle: displayedProject.title,
      ownerUserId: jobContact?.userId,
      viewedRole,
      message: joinMessage,
    });
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
          {requestSent ? (
            <span id="position-join-request-confirmation">
              Request sent! {jobContact?.firstName} will be in touch.
            </span>
          ) : (
            <>
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