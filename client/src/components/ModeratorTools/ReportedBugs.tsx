import { useState, useEffect } from "react";
import { getBugReports } from "../../api/mod-tools";
import { BugReport } from "@looking-for-group/shared";
import { PanelBox } from "../PanelBox";

type ReportedBugsProps = {
    currentUserId: number,
    currentTab: number
};

/**
 * Gets all bug reports for the tab in Mod Page
 * @param ReportedBugsProps current user ID and the current tab of Mod Page
 */
const ReportedBugs = ({ currentUserId, currentTab }: ReportedBugsProps) => {
    // Variables ==============================================================
    const [loaded, setLoaded] = useState<boolean>(false);
    const [bugReports, setBugReports] = useState<BugReport[]>([]);

    // Helper Methods =========================================================
    useEffect(() => {
        //get reported projects to display
        const displayReportedBugs = async () => {
            const reportedBugs = (await getBugReports());
            const tempBugsArray = [];

            if (reportedBugs.data !== undefined && reportedBugs.data !== null) {
                for (const bug of reportedBugs.data) {
                    tempBugsArray.push(bug);
                }
            }

            // Filter out already resolved bugs

            setBugReports(tempBugsArray.filter(b => !b.isResolved));
            setLoaded(true);
        }

        displayReportedBugs();
    }, [currentTab]);

    // The final component ====================================================
    if (loaded) {
        return (
            <div className="mod-tool">
                <div className="bug-reports">
                    {bugReports.length >= 1 ?
                    <PanelBox
                        category={"bugs"}
                        itemList={bugReports ? bugReports : []}
                        userId={currentUserId}
                    ></PanelBox> : "No reported bugs!"}
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
export default ReportedBugs;