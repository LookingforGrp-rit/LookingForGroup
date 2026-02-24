import { useNavigate } from "react-router-dom";
import { Dispatch, SetStateAction } from "react";
import { ProjectWithFollowers } from "@looking-for-group/shared";
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
  viewedPosition : number;
  setViewedPosition : Dispatch<SetStateAction<number>>;
}

export const TeamPositionsPanel = ({ displayedProject, viewedPosition, setViewedPosition } : TeamPositionsPanelProps) => {
  const navigate = useNavigate();

  //Find first member with the job title of 'Project Lead'
  //If no such member exists, use first member in project member list
  const projectLead = displayedProject?.owner;

  return <div id="project-open-positions-popup">
    <div id="positions-popup-header">Join The Team</div>

    {/* Left Container */}
    <div id="project-team-open-positions-popup">
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
      If interested, please contact:{" "}
        <span
          onClick={() =>
            navigate(
              `${paths.routes.PROFILE}?userID=${projectLead?.userId}`
            )
          }
          id="position-contact-link"
        >
          {/* {FIXME: get project lead profile image in a different way} */}
          {/* <img src={(projectLead?.profile_image) 
            ? `images/profiles/${projectLead?.profile_image}` 
            : profilePicture} 
            /> */}
          {projectLead?.firstName} {projectLead?.lastName}
        </span>
      </div>
    </div>
    
    <PopupButton buttonId="positions-popup-close">
      Close
    </PopupButton>
  </div>
}