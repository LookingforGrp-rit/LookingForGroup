import { useEffect, useState } from 'react';
import { getCurrentAccount, getUsersById } from '../api/users.ts';
import { Popup } from './Popup.tsx';
import profilePicture from '../images/lfrog.png';

//import shares types
import { UserDetail, BugReport } from '@looking-for-group/shared';
import { PopupButton, PopupContent } from './Popup.tsx';
import { getBugReportById, updateBugReport } from '../api/mod-tools.ts';

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

  const [bugReport, setBugReport] = useState<BugReport>();
  const [reporter, setReporter] = useState<UserDetail>();
  const BUG_REPORT_MAX = 500;

  const [bugReportText, setBugReportText] = useState<string>('');

  // Fetch bug report
  useEffect(() => {
    const getBugReport = async () => {
      if (reportId !== -1) {
        const reportResp = await getBugReportById(reportId);
        if (reportResp.data) setBugReport(reportResp.data);
      }
    };
    getBugReport();
    console.log(reportId);
    console.log(bugReport);
  }, [reportId]);


  useEffect(() => {
    const getReporter = async () => {
      console.log("bug report id" + bugReport?.userId ? bugReport?.userId : -1);
      const userResp = await getUsersById(bugReport? bugReport.userId : -1);
      if (userResp.data) setReporter(userResp.data);
    };
    getReporter();
  }, [bugReport]);

  /**
   * Handles what happens when a bug report is updated
   * @param isResolved Is this bug report closed? Was it solved?
   */
  const handleUpdateReport = async (isResolved: boolean) => {
    const response = await updateBugReport(reportId, bugReportText, isResolved);
  };

  // Mirrors the old Input component: the count turns orange/red as it fills up
  const bugReportCountClass = () => {
    const percentLeft = (BUG_REPORT_MAX - bugReportText.length) / BUG_REPORT_MAX;
    let className = 'character-count';
    if (percentLeft <= .25) className += ' character-count-close';
    if (percentLeft <= .1) className += ' character-count-danger';
    return className;
  };

  return (
      <div className={'bug-panel'}>
        <div className="bug-reporter" key={reporterId}>
            <img
                className="bug-reporter-profile"
                src={reporter?.profileImage ? reporter.profileImage : `${profilePicture}`}
                alt={`Profile photo of ${reporter?.firstName} ${reporter?.lastName}`}
            />
            <div className="bug-reporter-info">
                <h2 className="bug-reporter-name">Report From {reporter?.firstName ? reporter.firstName : "User"} {reporter?.lastName}</h2>
                <Popup>
                  <PopupButton buttonId="see-details-btn">See Details</PopupButton>
                  <PopupContent>
                    <div className="small-popup" id="report-popup">
                      <h3>Bug Report from {reporter?.firstName ?? "User"} {reporter?.lastName ?? ""}</h3>
                      <p>{bugReport?.reportText ? "Here is the message that the user sent: " : "No message was provided from the user."}</p>
                      <p>{bugReport?.reportText ? bugReport?.reportText : ""}</p>

                      <p>You can send the user a message about their report, or close the report as resolved.</p>

                      <div id='bug-report-field'>
                      <div className="input-multiline-container" style={{ position: 'relative' }}>
                        <span className={bugReportCountClass()}>
                          {bugReportText.length} / {BUG_REPORT_MAX}
                        </span>
                        <textarea
                          id='input-bug-report'
                          name='input-bug-report'
                          className="input input-multiline"
                          placeholder="Write your reasoning here..."
                          minLength={1}
                          maxLength={BUG_REPORT_MAX}
                          rows={5}
                          value={bugReportText}
                          onChange={(e) => {
                            // Match the old Input behaviour: strip leading spaces and
                            // collapse trailing runs of spaces to a single one.
                            const trimmed = e.currentTarget.value
                              .replace(/ +$/g, " ")
                              .replace(/^ +/g, "");
                            setBugReportText(trimmed);
                          }}
                        />
                      </div>
                    </div>
                      <div className="mod-options-btns">
                        <PopupButton
                          buttonId="mod-edit-btn"
                          className="button-reset"
                          callback={() => handleUpdateReport(false)}
                        >
                          Send Update
                        </PopupButton>
                          <PopupButton
                            buttonId="mod-dismiss-btn"
                            callback={() => {handleUpdateReport(true);}}>
                            Close Report
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