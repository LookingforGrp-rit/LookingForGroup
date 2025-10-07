import React from 'react';
import { ProjectCard } from './ProjectCard';
import { profiles } from '../constants/fakeData'; // FIXME: use data in db
import { projects } from '../constants/fakeData'; // FIXME: use data in db
import { SearchBar } from './SearchBar';
import { useState, useCallback } from 'react';
import { User, ProjectDetail } from '@looking-for-group/shared';

interface MyProjectsDisplayProps {
  userID: string;
}

//used on my projects page to display the projects in a container
//and to search them

export const MyProjectsDisplay = ({ userID }: MyProjectsDisplayProps) => {
  // --- Searching ---
  const [filteredProjects, setFilteredProjects] = useState<ProjectDetail[]>(projects as ProjectDetail[]);

  type SearchResult = string | Record<string, unknown>;


const HandleSearch = useCallback((results: SearchResult[][]) => {
  // Filter out values that cannot be projects
  const objectResults = results[0].filter((item): item is Record<string, unknown> => 
    typeof item === 'object' && item !== null
  );
  
  // Filter and transform to valid projects
  const validProjects = objectResults.filter((item) => '_id' in item) as ProjectDetail[];
  
  setFilteredProjects(validProjects);
}, []);

  //--------------------------

 
  return (
    <div>
      <SearchBar dataSets={[{ data: projects }]} onSearch={HandleSearch}></SearchBar>

      {filteredProjects.map((proj) => {
        let prof: User = profiles[0] as User;
        for (const p of profiles as User[]) {
          if (String(p._id) === String(userID)) {
            prof = p;
            break;
          }
        }

        if (prof.projects.includes(proj._id as unknown as number)) {
          return <ProjectCard key={proj._id} project={proj} />;
        }
        return null;
      })}
    </div>
  );
};