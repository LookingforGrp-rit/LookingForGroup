import { useEffect, useState } from 'react';
import { getUsersById } from '../api/users.ts';
import { Popup } from './Popup.tsx';
import profilePicture from '../images/lfrog.png';
import { PagePopup } from './PagePopup.tsx';
import { ApiResponse } from '@looking-for-group/shared';

//import shares types
import { UserDetail, BugReport } from '@looking-for-group/shared';
import { PopupButton, PopupContent } from './Popup.tsx';
import { getBugReportById, updateBugReport } from '../api/mod-tools.ts';

interface BugPanelProps {
  currentUserId: number;
  reporterId: number;
  reportId: number;
  onResolved?: (reportId: number) => void;
}

/**
 * Displays a preview panel for a bug report, used in moderation page.
 * Allows mods to see full bug report and manage its status in a Popup
 *
 * @param currentUserId The current user's ID
 * @param reporterId The ID of the user reporting the bug
 * @param reportId The ID of the report itself
 * @param onResolved Optional callback function to handle when a report is resolved
 * @returns JSX element rendering a clickable bug report preview panel
 */
export const BugPanel = ({ reporterId, reportId, onResolved }: BugPanelProps) => {

  const [bugReport, setBugReport] = useState<BugReport>();
  const [reporter, setReporter] = useState<UserDetail>();
  const BUG_REPORT_MAX = 2000;

  const [bugReportText, setBugReportText] = useState<string>('');

  // State variable for displaying output of API request, whether success or failure
  const [showResult, setShowResult] = useState(false);
  const [requestType, setRequestType] = useState<"handled-report" | null>(null);
  const [resultObj, setResultObj] = useState<ApiResponse>({
    status: 400,
    data: null,
    error: "Not initialized",
  });

  // Fetch bug report
  useEffect(() => {
    const getBugReport = async () => {
      if (reportId !== -1) {
        const reportResp = await getBugReportById(reportId);
        if (reportResp.data) setBugReport(reportResp.data);
      }
    };
    getBugReport();
  }, [reportId]);

  useEffect(() => {
    const getReporter = async () => {
      const userResp = await getUsersById(bugReport ? bugReport.userId : -1);
      if (userResp.data) setReporter(userResp.data);
    };
    getReporter();
  }, [bugReport]);

  /**
   * Handles what happens when a bug report is updated
   * Updating the isResolved status occurs in the PagePopup component
   */
  const handleUpdateReport = async (shouldResolve: boolean) => {
    const response = await updateBugReport(reportId, bugReportText, shouldResolve);
    setRequestType("handled-report");
    setResultObj(response);
    setShowResult(true);
    if (shouldResolve && response.status === 200) {
      onResolved?.(reportId);
    }
  };

  // Mirrors the old Input component: the count turns orange/red as it fills up
  const bugReportCountClass = () => {
    const percentLeft = (BUG_REPORT_MAX - bugReportText.length) / BUG_REPORT_MAX;
    let className = 'character-count';
    if (percentLeft <= .25) className += ' character-count-close';
    if (percentLeft <= .1) className += ' character-count-danger';
    return className;
  };

  if (bugReport && reporter) {
    return (
      <div className={'bug-panel'}>
        <div className="bug-reporter" key={reporterId}>
          <img
            className="bug-reporter-profile"
            src={reporter.profileImage ? reporter.profileImage : `${profilePicture}`}
            alt={`Profile photo of ${reporter.firstName} ${reporter.lastName}`}
          />
          <div className="bug-reporter-info">
            <h2 className="bug-reporter-name">Report From {reporter.firstName ? reporter.firstName : "User"} {reporter.lastName}</h2>
            <Popup>
              <PopupButton buttonId="see-details-btn">See Details</PopupButton>
              <PopupContent>
                <div className="small-popup" id="report-popup">
                  <h3>Bug Report from {reporter.firstName ?? "User"} {reporter.lastName ?? ""}</h3>
                  <p>{bugReport.reportText ? "Here is the message that the user sent: " : "No message was provided from the user."}</p>
                  <p>{bugReport.reportText ? bugReport.reportText : ""}</p>

                  <p>You can send the user a message about their report and/or close the report as resolved.</p>

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
                      buttonId="mod-send-btn"
                      className="button-reset"
                      callback={() => { void handleUpdateReport(false); }}
                    >
                      Send Update
                    </PopupButton>
                    <PopupButton
                      buttonId="mod-dismiss-btn"
                      callback={() => { void handleUpdateReport(true); }}>
                      Close Report
                    </PopupButton>
                  </div>
                </div>
              </PopupContent>
            </Popup>
          </div>
          {/* Bug Report result popup */}
          <PagePopup
            width={"fit-content"}
            height={"fit-content"}
            popupId={"result"}
            zIndex={16} //keep at 16 so success msg appears over all popups, including dropdown
            show={showResult}
            setShow={setShowResult}
            onClose={() => { }}
          >
            <div className="small-popup">
              {resultObj.status === 200 ? (
                <p>
                  <span className="success-msg">Success:</span>
                  &nbsp;
                  {requestType === "handled-report"
                    ? "The report was updated and the reporter will be notified!"
                    : "Uh oh! This wasn't supposed to happen."}
                </p>
              ) : (
                <p>
                  <span className="error-msg">Error:</span>
                  &nbsp;
                  {resultObj.error}
                </p>
              )}
            </div>
          </PagePopup>
        </div>
      </div>
    );
  } else {
    return (
      <div className='placeholder-spacing'>
        <div className='spinning-loader'></div>
      </div>
    );
  }
};