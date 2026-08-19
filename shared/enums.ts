// Enums cannot be in .d.ts files

// Enums for better typing
export enum SkillType {
  Developer = "Developer",
  Designer = "Designer",
  Artist = "Artist",
  Music = "Music",
  Soft = "Soft"
}
export enum TagType {
  Creative = "Creative",
  Technical = "Technical",
  Games = "Games",
  Multimedia = "Multimedia",
  Music = "Music",
  Other = "Other",
  DeveloperSkill = "Developer Skill",
  DesignerSkill = "Designer Skill",
  SoftSkill = "Soft Skill",
  Purpose = "Purpose",
  Context = "Context",
  ContentWarning = "Content Warning"
}
export enum RitStatus {
  'FirstYear' = "1st Year",
  'SecondYear' = "2nd Year",
  'ThirdYear' = "3rd Year",
  'FourthYear' = "4th Year",
  'FifthYear' = "5th Year",
  'GraduateStudent' = "Graduate Student",
  'Alumni' = "Alumni",
  'Faculty' = "Faculty",
  'Staff' = "Staff",
};
export enum Visibility {
  Public = "Public",
  Private = "Private"
};
export enum SkillProficiency {
  Novice = "Novice",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert"
};
export enum ProjectContext {
  Personal = "Personal",
  PortfolioPiece = "Portfolio Piece",
  Academic = "Academic",
  CoOp = "Co-op"
};
export enum ProjectStatus {
  Planning = "Planning",
  Development = "In Development",
  PostProduction = "Post-Production",
  Complete = "Complete"
}
export enum JobAvailability {
  FullTime = "Full-time",
  PartTime = "Part-time",
  PtFt = "Part-time/Full-time"
}
export enum JobLocation {
  OnSite = "On-Site",
  Remote = "Remote",
  Hybrid = "Hybrid",
  Flexible = "Flexible",
}
export enum JobCompensation {
  Unpaid = "Unpaid",
  Paid = "Paid"
};
export enum BaseSocialUrl {
  "Instagram" = 'https://instagram.com/',
  'Twitter' = 'https://x.com/',
  'Facebook' = 'https://facebook.com/',
  'Discord' = 'https://discord.gg/',
  'Bluesky' = 'https://bsky.app/profile/',
  'LinkedIn' = 'https://linkedin.com/in/',
  'YouTube' = 'https://youtube.com/',
  'Steam' = 'https://',
  'Itch' = 'https://', //because itch links might have the itch.io part later in the url
  'Other' = 'https://',
  'Tumblr' = 'https://tumblr.com/'
}
export interface BaseUrlValidation { //a surprise tool that'll help us later
  Instagram: 'https://instagram.com/',
  Twitter: 'https://x.com/',
  Facebook: 'https://facebook.com/',
  Discord: 'https://discord.gg/',
  Bluesky: 'https://bsky.app/profile/',
  LinkedIn: 'https://linkedin.com/in/',
  YouTube: 'https://youtube.com/' | 'youtu.be',
  Steam: 'https://steamcommunity.com/' | 'https://store.steampowered.com/app/',
  Itch: '.itch.io',
  Other: 'https://', //idk what imma do with this but for now we'll just make sure it's a working link (TERRIBLE! AWFUL IDEA!)
  Tumblr: 'https://tumblr.com/'
}

export enum AspectRatios {
  '16:9' = '16/9',
  '4:3' = '4/3',
  '1:1' = '1/1',
  '2:3' = '2/3',
  '6:13' = '6/13',
}

export enum ProjectApprovalStatus {
  'approved' = 'Approved',
  'under-review' = 'Under Review',
  'not-approved' = 'Not Approved',
}

export enum UserAccessLevel {
  User = 'User',
  Moderator = 'Moderator',
  Administrator = 'Administrator'
}