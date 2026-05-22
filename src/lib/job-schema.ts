// Structured representation of a parsed job posting (JD).

export type JobData = {
  jobTitle: string;
  company: string;
  location: string;
  summary: string;
  responsibilities: string[];
  requirements: string[]; // must-have
  niceToHave: string[];
  skills: string[]; // key skills / keywords for matching
};

export type GapSeverity = "high" | "medium" | "low";

export type MatchGap = {
  title: string;
  severity: GapSeverity;
  suggestion: string;
};

// Stored in Adaptation.gaps (score lives in Adaptation.matchScore).
export type MatchAnalysis = {
  verdict: string;
  strengths: string[];
  gaps: MatchGap[];
};

export const EMPTY_JOB: JobData = {
  jobTitle: "",
  company: "",
  location: "",
  summary: "",
  responsibilities: [],
  requirements: [],
  niceToHave: [],
  skills: [],
};
