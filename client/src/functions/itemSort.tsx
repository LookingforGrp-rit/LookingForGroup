import { projects, profiles } from '../constants/fakeData';
// import { interests } from '../constants/interests';
import { softSkills, hardSkills, proficiencies } from '../constants/skills';

//Interest & skill imports are currently unused, but may become relevant later in development
//This file will hold code that will allow sorting and filtering projects & people via tags

//tags - string array representing the tags to use for sorting
//projectSearch - boolean determining if the funciton will sort through projects or profiles
//    true: sort projects; false: sort profiles
export const sortItems = (tags: string[], projectSearch: boolean) => {
  //Get list of tags (string array) to use for sorting
  //Are we sorting through projects or people?
  //if projects...
  if (projectSearch) {
    //get projects currently in the database
    //let projectList = projects;
    //Create an empty array to hold projects that meet criteria (project array)
    const sortedProjectList: {
      _id: number;
      name: string;
      members: { userID: number; admin: boolean; owner: boolean; role: string }[];
      description: string;
      tags: string[];
      neededRoles: { Role: string; amount: number; description: string }[];
      posts: number[];
    }[] = [];
    //iterate through all the projects. For each one...
    for (const project of projects) {
      //Compare the list of tags we are using to the tags of the project
      let matchingTags = 0;
      for (const tag of tags) {
        if (!project.tags.includes(tag)) {
          break;
        }
        matchingTags++;
      }
      //If project contains the specified tags...
      if (matchingTags == tags.length) {
        //add project to sorted list
        sortedProjectList.push(project);
      }
    }
    //Once all projects are filtered, return the filled list
    //If no filters were run, just return full project list
    if (sortedProjectList.length == 0) {
      return projects;
    }
    return sortedProjectList;
  }
  //if people...
  else {
    //get people currently in the database
    //Create an empty array to hold people that meet criteria (profile array)
    const sortedProfileList: {
      _id: number;
      name: string;
      username: string;
      pronouns: string[];
      bio: string;
      // interests: string[];
      // messages: number[];
      skills: { skill: string; type: string; highlighted: boolean }[];
      profilePicture: {
        name: string;
        data: string;
        mimeType: string;
      };
      projects: number[];
      links: { text: string; url: string }[];
      // endorsements: {
      //   endorsement: string;
      //   endorserID: string;
      //   endorseProjectID: string;
      //   skills: number[];
      // }[];
    }[] = [];
    //iterate through all people. For each one...
    for (const profile of profiles) {
      //Compare the list of tags we are using to the tags of the person
      //No tags exist for profiles yet, so skills & interests will be used instead
      let matchingTags: number = 0;
      for (const tag of tags) {
        //Search interests first
        // if (profile.interests.includes(tag)) {
        //   matchingTags++;
        //   continue;
        // }
        //If it is not found in interests, search skills next
        for (const skill of profile.skills) {
          if (skill.skill == tag) {
            matchingTags++;
            break;
          }
        }
      }
      //If person contains the specified tags...
      if (matchingTags == tags.length) {
        //add person to sorted list
        sortedProfileList.push(profile);
      }
    }
    //Once all people are filtered, return the filled list
    //If no filters were run, just return full profile list
    if (sortedProfileList.length == 0) {
      return profiles;
    }
    return sortedProfileList;
  }
};
