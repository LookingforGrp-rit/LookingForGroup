import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from '../../../constants/routes';
import { ProjectDetail } from "@looking-for-group/shared";
import { ProjectContext } from "@looking-for-group/shared/enums";

type ProjectListViewProps = {
    projects: ProjectDetail[],
    association?: Record<number, boolean>
};

const ProjectListView = ({ projects, association = {} }: ProjectListViewProps) => {
    // Variables ==============================================================
    const [associated, setAssociated] = useState<Record<number, boolean>>(association);

    // Helper Methods =========================================================
    /**
     * Used for navigation to other pages
     */
    const navigate = useNavigate();

    /**
     * Converts ISO date string to MM/DD/YYYY format
     * @param dateStr ISO date string
     * @returns MM/DD/YYYY
     */
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'No data';
        const [date] = dateStr.split('T');
        const [year, month, day] = date.split('-');
        return `${month}/${day}/${year}`;
    };

    /**
     * Converts into list view data row
     * @param project Project detail
     * @returns list view data row
     */
    const listView = (project: ProjectDetail) => {
        return <>
            <tr
                key={'pending-project-' + project.projectId}
                className="list-card"
                onClick={() => navigate(`${routes.PROJECT}?projectID=${project.projectId}`)}
            >
                <td className="list-card-title">
                    {associated[project.projectId] &&
                        <span className="tooltip">
                            <i className="fa-solid fa-triangle-exclamation" style={{
                                color: "#F59E0B",
                                fontSize: "1.1rem",
                            }}></i>&nbsp;&nbsp;
                            <span className="tooltip-text">You're associated with this project/report and can't resolve it</span>
                        </span>
                    }
                    {project.title}
                </td>
                <td className="list-card-owner" data-label="Project Owner">{project.owner.firstName} {project.owner.lastName}</td>
                <td className="list-card-contet" data-label="Context">{project.context ? ProjectContext[project.context] : 'Not Provided'}</td>
                <td className="list-card-status" data-label="Status">{project.status}</td>
                <td className="list-card-date" data-label="Date Created">{formatDate(project.createdAt.toString())}</td>
            </tr>
        </>;
    };

    useEffect(() => {
        console.log(associated);
    }, [association]);

    // The final component ====================================================
    return (
        <table className='responsive-table'>
            {/* Projects List Header */}
            <thead className="list-header">
                <tr>
                    <th className="header-label title">Project Title</th>
                    <th className="header-label owner">Owner</th>
                    <th className="header-label context">Context</th>
                    <th className="header-label status">Status</th>
                    <th className="header-label date">Date Created</th>
                </tr>
            </thead>

            <tbody className='list-view'>
                {projects.map(p => listView(p))}
            </tbody>
        </table>
    );
};
export default ProjectListView;