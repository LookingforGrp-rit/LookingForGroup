import { useState, useEffect, useMemo, useCallback } from "react";
import ProjectListView from "./ListViews/ProjectListView";
import { ProjectDetail } from "@looking-for-group/shared";
import { getPendingProjects } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import { SearchBar } from "../SearchBar";

type PendingProjectsProps = {
    currentUserId: number,
    currentTab: number,
    displayMode: 'grid' | 'list',
};

/**
 * Gets all pending projects for the tab in Mod Page
 * @param PendingProjectsProps current user ID and the current tab of Mod Page
 */
const PendingProjects = ({ currentUserId, currentTab, displayMode }: PendingProjectsProps) => {
    // Variables ==============================================================
    const [loaded, setLoaded] = useState<boolean>(false);
    const [pendingProjects, setPendingProjects] = useState<ProjectDetail[]>([]);
    const [association, setAssociation] = useState<Record<number, boolean>>({});

    // Search - self-contained to this tab, not shared with the page header
    const [currentSearch, setCurrentSearch] = useState('');
    const [searchedProjectIds, setSearchedProjectIds] = useState<number[]>([]);

    const projectDataSet = useMemo(() => [{ data: pendingProjects }], [pendingProjects]);

    // Helper Methods =========================================================
    /**
     * Checks if the current user (moderator) is associated to this project in any way
     * @param project Project detail
     * @returns [Project id, associated or not]
     */
    const checkAssociation = (project: ProjectDetail) => {
        // check if the moderator is the owner or a member
        if (project.owner.userId === currentUserId ||
            project.members.some(member => member.user.userId === currentUserId)
        ) {
            return [project.projectId, true];
        }
        return [project.projectId, false];
    }

    /**
     * SearchBar hands back the actual matched items (filtered straight from
     * projectDataSet's data), not just names - so this just reads the IDs
     * off of them directly, no re-lookup needed.
     * @param searchResults Raw results from the SearchBar component
     */
    const searchProjects = useCallback((searchResults: unknown[][]) => {
        const matched = (searchResults[0] ?? []) as ProjectDetail[];
        setSearchedProjectIds(matched.map((project) => project.projectId));
    }, []);

    // Loaders ================================================================
    useEffect(() => {
        //get reported projects to display
        const displayPendingProjects = async () => {
            const pendingProjects = await getPendingProjects();
            const tempPendingProjectArray = [];
            let tempIds: Set<number> = new Set();

            if (pendingProjects.data !== undefined && pendingProjects.data !== null) {
                let entries = [];

                for (const project of pendingProjects.data) {
                    tempPendingProjectArray.push(project);
                    tempIds.add(project.projectId);

                    entries.push(checkAssociation(project));
                }

                setAssociation(Object.fromEntries(entries));
            }
            setPendingProjects(tempPendingProjectArray);
            setLoaded(true);
        }

        displayPendingProjects();
    }, [currentTab]);

    // SearchBar fires its search effect on mount, before this fetch above has
    // necessarily resolved - so only trust searchedProjectIds once the mod has
    // actually typed something. Otherwise always show everything that's loaded.
    const displayedProjects = currentSearch.trim() === ''
        ? pendingProjects
        : pendingProjects.filter((project) => searchedProjectIds.includes(project.projectId));

    // The final component ====================================================
    if (loaded) {
        return (
            <div className="mod-tool">
                <div className="pending-projects-search">
                    <SearchBar
                        dataSets={projectDataSet}
                        onSearch={searchProjects}
                        value={currentSearch}
                        setValue={setCurrentSearch}
                        placeholderText="Search by Project"
                    />
                </div>
                <div className="pending-projects">
                    {displayedProjects.length > 0 ?
                        displayMode === 'grid' ?
                            // Grid view
                            <PanelBox
                                category={"projects"}
                                itemList={displayedProjects}
                                userId={currentUserId}
                            ></PanelBox>
                            // List view
                            : <ProjectListView projects={displayedProjects} association={association} />
                        : (currentSearch.trim() !== '' ? "No matching projects!" : "No pending projects!")}
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
export default PendingProjects;
