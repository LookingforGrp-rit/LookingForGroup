import React from 'react';
import { ProjectCard } from './ProjectCard';
import { profiles } from '../constants/fakeData'; // FIXME: use data in db
import { projects } from '../constants/fakeData'; // FIXME: use data in db
import { SearchBar } from './SearchBar';
import { useState, useCallback } from 'react';

interface MyProjectsDisplayProps {
  userID: string | number;
}

interface Project {
  _id: string | number;
  // add other project fields as needed
}


//used on my projects page to display the projects in a container
//and to search them

export const MyProjectsDisplay = ({ userID }: MyProjectsDisplayProps) => {
  // --- Searching ---
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);

  type SearchResult = string | Record<string, unknown>;


const HandleSearch = useCallback((results: SearchResult[][]) => {
  // Filter out values that cannot be projects
  const objectResults = results[0].filter((item): item is Record<string, unknown> => 
    typeof item === 'object' && item !== null
  );
  
  // Filter and transform to valid projects
  const validProjects = objectResults
    .filter((item) => '_id' in item)
    .map((item) => ({
      _id: item._id,
    })) as Project[];
  
  setFilteredProjects(validProjects);
}, []);

  //--------------------------

 
  return (
    <div>
      <SearchBar dataSets={[{ data: projects }]} onSearch={HandleSearch}></SearchBar>

      {filteredProjects.map((proj) => {
        let prof = profiles[0];
        for (const p of profiles) {
          if (String(p._id) === String(userID)) {
            prof = p;
            break;
          }
        }

        if (prof.projects.includes(Number(proj._id))) {
          return <ProjectCard project={proj} />;
        }
      })}
    </div>
  );
};