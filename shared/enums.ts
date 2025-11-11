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
  Purpose = "Purpose"
}
export enum AcademicYear {
  Freshman = "Freshman",
  Sophomore = "Sophomore",
  Junior = "Junior",
  Senior = "Senior",
  Graduate = "Graduate"
};
export enum Visibility {
  Public = 0,
  Private = 1
};
export enum SkillProficiency {
  Novice = "Novice",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert"
};
export enum ProjectPurpose {
  Personal = "Personal",
  PortfolioPiece = "Portfolio Piece",
  Academic = "Academic",
  CoOp = "Co-op"
};
export enum ProjectStatus {
  Planning = "Planning",
  Development = "Development",
  PostProduction = "Post-Production",
  Complete = "Complete"
}
export enum JobAvailability {
  FullTime = "Full-time",
  PartTime = "Part-time",
  Flexible = "Flexible"
}
export enum JobDuration {
  ShortTerm = "Short-term",
  LongTerm = "Long-term"
}
export enum JobLocation {
  OnSite = "On-Site",
  Remote = "Remote",
  Hybrid = "Hybrid"
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
  'YouTube' = 'https://youtube.com/@',
  'Steam' = 'https://store.steampowered.com/',
  'Itch' = 'https://itch.io/',
  'Other' = 'https://example.com'
}