import type { SkillProfile, Opportunity, MatchResult, SkillLevel } from '@/types';

export function getSkillLevel(score: number): SkillLevel {
  if (score >= 85) return 'expert';
  if (score >= 70) return 'advanced';
  if (score >= 50) return 'intermediate';
  return 'beginner';
}

export function calculateMatchScore(
  studentSkills: SkillProfile[],
  opportunity: Pick<Opportunity, 'required_skills' | 'preferred_skills'>
): MatchResult {
  const required = (opportunity.required_skills || []).map((s) => s.toLowerCase());
  const preferred = (opportunity.preferred_skills || []).map((s) => s.toLowerCase());

  const studentSkillMap = new Map<string, number>();
  studentSkills.forEach((sp) => {
    studentSkillMap.set(sp.skill_name.toLowerCase(), sp.score);
  });

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  let requiredScore = 0;
  let requiredTotal = required.length || 1;

  required.forEach((skill) => {
    const studentScore = studentSkillMap.get(skill);
    if (studentScore !== undefined && studentScore >= 40) {
      matchedSkills.push(skill);
      requiredScore += studentScore;
    } else {
      missingSkills.push(skill);
    }
  });

  let preferredBonus = 0;
  preferred.forEach((skill) => {
    const studentScore = studentSkillMap.get(skill);
    if (studentScore !== undefined && studentScore >= 40) {
      matchedSkills.push(skill);
      preferredBonus += studentScore * 0.3;
    }
  });

  const requiredPct = required.length > 0 ? (matchedSkills.filter((s) => required.includes(s.toLowerCase())).length / required.length) * 100 : 50;
  const avgScore = required.length > 0 ? requiredScore / required.length : 0;
  const preferredPct = preferred.length > 0 ? (preferredBonus / (preferred.length * 30)) * 50 : 25;

  const score = Math.round(Math.min(100, requiredPct * 0.6 + avgScore * 0.25 + preferredPct * 0.15));

  let label = 'Moderate Match';
  if (score >= 85) label = 'Excellent Match';
  else if (score >= 70) label = 'Good Match';
  else if (score >= 50) label = 'Fair Match';

  const uniqueMatched = [...new Set(matchedSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)))];
  const uniqueMissing = [...new Set(missingSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)))];

  return { score, matchedSkills: uniqueMatched, missingSkills: uniqueMissing, label };
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function titleCase(str: string): string {
  return str
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const OPPORTUNITY_TYPES: { value: string; label: string }[] = [
  { value: 'internship', label: 'Internship' },
  { value: 'job', label: 'Full-time Job' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
  { value: 'live_project', label: 'Live Project' },
  { value: 'industrial_training', label: 'Industrial Training' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'guest_lecture', label: 'Guest Lecture' },
  { value: 'innovation_challenge', label: 'Innovation Challenge' },
  { value: 'faculty_internship', label: 'Faculty Internship' },
  { value: 'research_collaboration', label: 'Research Collaboration' },
];

export const COLLABORATION_TYPES: { value: string; label: string }[] = [
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'guest_lecture', label: 'Guest Lecture' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'research', label: 'Research' },
  { value: 'consultancy', label: 'Consultancy' },
  { value: 'innovation_challenge', label: 'Innovation Challenge' },
  { value: 'live_project', label: 'Live Project' },
  { value: 'industrial_training', label: 'Industrial Training' },
  { value: 'fdp', label: 'Faculty Development Program' },
];

export const ALL_SKILLS = [
  'JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'Java', 'SQL',
  'Communication', 'Leadership', 'Problem Solving', 'Data Analysis',
  'AI/ML', 'Cloud Computing', 'Cybersecurity', 'Project Management',
  'TypeScript', 'Express.js', 'PostgreSQL', 'Docker', 'AWS',
  'UI/UX Design', 'Machine Learning', 'Deep Learning', 'NLP',
  'DevOps', 'Git', 'REST APIs', 'GraphQL', 'C++', 'Flutter',
];
