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
