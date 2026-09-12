export type UserRole = 'student' | 'academician' | 'industry' | 'institution' | 'admin';

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'interview'
  | 'selected'
  | 'rejected'
  | 'withdrawn';

export type InternshipStatus =
  | 'started'
  | 'in_progress'
  | 'mentor_feedback'
  | 'final_evaluation'
  | 'completed'
  | 'cancelled';

export type OpportunityType =
  | 'internship'
  | 'job'
  | 'apprenticeship'
  | 'live_project'
  | 'industrial_training'
  | 'workshop'
  | 'mentorship'
  | 'guest_lecture'
  | 'innovation_challenge'
  | 'faculty_internship'
  | 'research_collaboration';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type CollaborationType =
  | 'mentorship'
  | 'guest_lecture'
  | 'workshop'
  | 'research'
  | 'consultancy'
  | 'innovation_challenge'
  | 'live_project'
  | 'industrial_training'
  | 'fdp';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone: string;
  avatar_url: string;
  status: string;
  is_profile_complete: boolean;
  institution: string;
  degree: string;
  department: string;
  graduation_year: number | null;
  location: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  bio: string;
  company_name: string;
  industry_type: string;
  company_size: string;
  website_url: string;
  institution_name: string;
  designation: string;
  specialization: string;
  created_at: string;
  updated_at: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Skill {
  id: string;
  name: string;
  category_id: string;
  description: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  category_id: string;
  skill_id: string;
  assessment_type: string;
  difficulty: string;
  time_limit_minutes: number;
  passing_score: number;
  is_active: boolean;
  created_by: string;
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'short_answer';
  options: string[];
  correct_answer: string;
  weight: number;
  difficulty: string;
}

export interface AssessmentAttempt {
  id: string;
  user_id: string;
  assessment_id: string;
  score: number;
  percentage: number;
  skill_level: SkillLevel;
  total_questions: number;
  correct_answers: number;
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at: string;
}

export interface SkillProfile {
  id: string;
  user_id: string;
  skill_id: string;
  skill_name: string;
  category: string;
  score: number;
  level: SkillLevel;
  source: string;
  is_verified: boolean;
  verified_by: string;
  created_at: string;
}

export interface LearningProgram {
  id: string;
  title: string;
  description: string;
  skills_taught: string[];
  level: SkillLevel;
  duration_weeks: number;
  provider: string;
  certification_available: boolean;
  url: string;
  cost: string;
  category: string;
}

export interface Opportunity {
  id: string;
  user_id: string;
  company_name: string;
  title: string;
  description: string;
  opportunity_type: OpportunityType;
  required_skills: string[];
  preferred_skills: string[];
  eligibility: string;
  education: string;
  experience: string;
  location: string;
  work_mode: 'onsite' | 'remote' | 'hybrid';
  duration: string;
  stipend: string;
  salary: string;
  application_deadline: string | null;
  num_positions: number;
  start_date: string | null;
  end_date: string | null;
  contact_email: string;
  contact_phone: string;
  status: 'draft' | 'open' | 'closed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  opportunity_id: string;
  cover_letter: string;
  resume_url: string;
  status: ApplicationStatus;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  industry_notes: string;
  created_at: string;
  updated_at: string;
  opportunity?: Opportunity;
}

export interface Internship {
  id: string;
  application_id: string;
  user_id: string;
  opportunity_id: string;
  company_name: string;
  title: string;
  mentor_name: string;
  mentor_email: string;
  start_date: string | null;
  end_date: string | null;
  goals: string[];
  status: InternshipStatus;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface InternshipProgress {
  id: string;
  internship_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  completed_at: string | null;
}

export interface MentorFeedback {
  id: string;
  internship_id: string;
  mentor_name: string;
  rating: number;
  strengths: string;
  improvements: string;
  comments: string;
  created_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  expiry_date: string | null;
  certificate_url: string;
  skill_name: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  project_url: string;
  repo_url: string;
  skills_used: string[];
  start_date: string | null;
  end_date: string | null;
  is_verified: boolean;
}

export interface Collaboration {
  id: string;
  user_id: string;
  title: string;
  description: string;
  collaboration_type: CollaborationType;
  institution: string;
  industry: string;
  status: 'draft' | 'open' | 'active' | 'completed' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string;
  created_at: string;
}

export interface MatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  label: string;
}
