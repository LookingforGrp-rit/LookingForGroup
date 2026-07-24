import { useEffect, useState } from 'react';
import { getCurrentAccount, getUsersById } from '../api/users.ts';
import { Popup } from './Popup.tsx';
import profilePicture from '../images/lfrog.png';

//import shares types
import { UserDetail, BugReport } from '@looking-for-group/shared';
import { PopupButton, PopupContent } from './Popup.tsx';
import { getBugReportById } from '../api/mod-tools.ts';

interface BugPanelProps {
  currentUserId: number;
  reporterId: number;
  reportId: number;
}

/**
 * Displays a preview panel for a bug report, used in moderation page.
 * Allows mods to see full bug report and manage its status in a Popup
 *
 * @param currentUserId The current user's ID
 * @param reporterId The ID of the user reporting the bug
 * @param reportId The ID of the report itself
 * @returns JSX element rendering a clickable bug report preview panel
 */
export const BugPanel = ({currentUserId, reporterId, reportId }: BugPanelProps) => {

  // Current user ID
  const [userId, setUserId] = useState<number>(currentUserId);

  const [bugReport, setBugReport] = useState<BugReport>();
  const [reporter, setReporter] = useState<UserDetail>();

  // Fetch bug report
  useEffect(() => {
    const getBugReport = async () => {
      if (!reportId && reportId !== -1) {
        const reportResp = await getBugReportById(reportId);
        if (reportResp.data) setBugReport(reportResp.data);
      }
    };
    getBugReport();
  }, [reportId]);

  // Fetch current user ID and reporter account
  useEffect(() => {
    const getUserData = async () => {
        //get our current user for use later
        if (!userId && userId !== -1) {
          const userResp = await getCurrentAccount();
          if (userResp.data) setUserId(userResp.data.userId);
        }
      };
      getUserData();
    }, [userId]);

    useEffect(() => {
      const getReporter = async () => {
      if (bugReport) {
        const userResp = await getUsersById(bugReport? bugReport.userId : -1);
        if (userResp.data) setReporter(userResp.data);
      }
      };
      getReporter();
    }, [bugReport]);

  return (
      <div className={'bug-panel'}>
        <div className="bug-reporter" key={reporterId}>
            <img
                className="bug-reporter-profile"
                src={reporter?.profileImage ? reporter.profileImage : `${profilePicture}`}
                alt={`Profile photo of ${reporter?.firstName} ${reporter?.lastName}`}
            />
            <div className="bug-reporter-info">
                <h2 className="team-member-name">{reporter?.firstName} {reporter?.lastName}</h2>
                <p className="report-info">Report info here!</p>
                <Popup>
                  <PopupButton>See Details</PopupButton>
                  <PopupContent>
                    <div className="small-popup" id="report-popup">
                      <h3>Bug Report from {reporter?.firstName ?? "User"} {reporter?.lastName ?? ""}</h3>
                      <p>Here is the context behind {reporter?.firstName ?? "this user"}'s report:</p>
                      <p>{bugReport?.reportText}</p>
                      <div className="confirm-deny-btns">
                        <PopupButton
                          buttonId="team-delete-member-cancel-button"
                          className="button-reset"
                        >
                          Cancel
                        </PopupButton>
                          <PopupButton
                            className="delete-button"
                            callback={() => true}>
                            Report
                          </PopupButton>
                      </div>
                    </div>
                  </PopupContent>
                </Popup>
            </div>
        </div>
      </div>
  );
};