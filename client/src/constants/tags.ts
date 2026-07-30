

export const projectTabs = {
  'Project Type': { categoryTags: [], categoryName: 'Project Type', color: 'blue' },
  'Genre': { categoryTags: [], categoryName: 'Genre', color: 'green' },
  'Style': { categoryTags: [], categoryName: 'Style', color: 'pink' },
  'Purpose': { categoryTags: [], categoryName: 'Purpose', color: 'orange' }, //SORTORAMA: add new tag color for purpose, unless the orange looks fine
  'Context': { categoryTags: [], categoryName: 'Context', color: 'grey' },  //SORTORAMA: we should probably add another color for context, but it'd only show up in filters
  'Content Warning': { categoryTags: [], categoryName: 'Content Warning', color: 'red' }, //SORTORAMA: add new tag color for content warning, preferably a different red
  'Positions': { categoryTags: [], categoryName: 'Positions', color: 'purple' },
  'Game Engine': { categoryTags: [], categoryName: 'Game Engine', color: 'yellow' },
};


export const peopleTabs = {
  'Developer Skill': { categoryTags: [], categoryName: 'Developer Skill', color: 'yellow' },
  'Designer Skill': { categoryTags: [], categoryName: 'Designer Skill', color: 'red' },
  'Audio Skill': { categoryTags: [], categoryName: 'Audio Skill', color: 'periwinkle' },
  'Soft Skill': { categoryTags: [], categoryName: 'Soft Skill', color: 'purple' },
  'Engineer Skill': { categoryTags: [], categoryName: 'Engineer Skill', color: 'cyan' },
  'Role': { categoryTags: [], categoryName: 'Role', color: 'orange' },
  'Major': { categoryTags: [], categoryName: 'Major', color: 'blue' },
};

export const tags = [
  /*'New',*/
  'Video Game',
  'Analog Game',
  'Mobile Application',
  'Website',
  'Animation',
  'Film',
  'Software',
  'Other',
];

export enum PeopleSkills {
  Developer = <never>'Developers',
  Designer = <never>'Designers',
  Audio = <never>'Audio Creators',
  Engineer = <never>'Engineers',
  Soft = <never>'Other'
}

