import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  ExternalLink,
  Github,
  Linkedin,
  Award,
  Briefcase,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { Card, Badge } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import SkillBadge from '@/components/ui/SkillBadge';
import toast from 'react-hot-toast';
import type {
  SkillProfile,
  Project,
  Certificate,
  Internship,
} from '@/types';
import { formatDate, ALL_SKILLS } from '@/utils';

interface ApiSkillProfile {
  _id?: string;
  id?: string;
  user?: string;
  skillId?: string;
  skillName?: string;
  category?: string;
  score?: number;
  level?: string;
  source?: string;
  isVerified?: boolean;
}

interface ApiProject {
  _id?: string;
  id?: string;
  user?: string;
  title?: string;
  description?: string;
  projectUrl?: string;
  repoUrl?: string;
  skillsUsed?: string[];
  startDate?: string | null;
  endDate?: string | null;
  isVerified?: boolean;
}

interface ApiCertificate {
  _id?: string;
  id?: string;
  user?: string;
  title?: string;
  issuer?: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  certificateUrl?: string;
  skillName?: string;
}

interface ApiInternship {
  _id?: string;
  id?: string;
  user?: string;
  opportunity?: string | null;
  companyName?: string;
  title?: string;
  mentorName?: string;
  mentorEmail?: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  progress?: number;
}

interface SkillsResponse {
  success: boolean;
  skills?: ApiSkillProfile[];
  data?: ApiSkillProfile[];
}

interface ProjectsResponse {
  success: boolean;
  projects?: ApiProject[];
  data?: ApiProject[];
}

interface CertificatesResponse {
  success: boolean;
  certificates?: ApiCertificate[];
  data?: ApiCertificate[];
}

interface InternshipsResponse {
  success: boolean;
  internships?: ApiInternship[];
  data?: ApiInternship[];
}

function normalizeSkill(
  skill: ApiSkillProfile
): SkillProfile {
  return {
    id: skill._id || skill.id || '',
    user_id: skill.user || '',
    skill_name: skill.skillName || '',
    category: skill.category || '',
    score: skill.score ?? 0,
    level:
      (skill.level as SkillProfile['level']) ||
      'beginner',
    source: skill.source || 'manual',
    is_verified: skill.isVerified ?? false,
  } as SkillProfile;
}

function normalizeProject(
  project: ApiProject
): Project {
  return {
    id: project._id || project.id || '',
    user_id: project.user || '',
    title: project.title || '',
    description: project.description || '',
    project_url: project.projectUrl || '',
    repo_url: project.repoUrl || '',
    skills_used: project.skillsUsed || [],
    start_date: project.startDate || null,
    end_date: project.endDate || null,
    is_verified: project.isVerified ?? false,
  } as Project;
}

function normalizeCertificate(
  certificate: ApiCertificate
): Certificate {
  return {
    id: certificate._id || certificate.id || '',
    user_id: certificate.user || '',
    title: certificate.title || '',
    issuer: certificate.issuer || '',
    issue_date: certificate.issueDate || null,
    expiry_date: certificate.expiryDate || null,
    certificate_url:
      certificate.certificateUrl || '',
    skill_name: certificate.skillName || '',
  } as Certificate;
}

function normalizeInternship(
  internship: ApiInternship
): Internship {
  return {
    id: internship._id || internship.id || '',
    user_id: internship.user || '',
    company_name:
      internship.companyName || '',
    title: internship.title || '',
    mentor_name:
      internship.mentorName || '',
    mentor_email:
      internship.mentorEmail || '',
    start_date:
      internship.startDate || null,
    end_date:
      internship.endDate || null,
    status:
      (internship.status as Internship['status']) ||
      'started',
    progress: internship.progress ?? 0,
  } as Internship;
}

export default function PortfolioPage() {
  const { user } = useAuth();

  const [skills, setSkills] = useState<SkillProfile[]>(
    []
  );

  const [projects, setProjects] = useState<Project[]>(
    []
  );

  const [certificates, setCertificates] =
    useState<Certificate[]>([]);

  const [internships, setInternships] =
    useState<Internship[]>([]);

  const [loading, setLoading] = useState(true);

  const [savingProject, setSavingProject] =
    useState(false);

  const [savingCertificate, setSavingCertificate] =
    useState(false);

  const [deletingProjectId, setDeletingProjectId] =
    useState<string | null>(null);

  const [
    deletingCertificateId,
    setDeletingCertificateId,
  ] = useState<string | null>(null);

  const [showAddProject, setShowAddProject] =
    useState(false);

  const [showAddCert, setShowAddCert] =
    useState(false);

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    project_url: '',
    repo_url: '',
    skills_used: [] as string[],
  });

  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    skill_name: '',
  });

  useEffect(() => {
    if (!user) {
      setSkills([]);
      setProjects([]);
      setCertificates([]);
      setInternships([]);
      setLoading(false);
      return;
    }

    const loadPortfolio = async () => {
      setLoading(true);

      try {
        const [
          skillsResponse,
          projectsResponse,
          certificatesResponse,
          internshipsResponse,
        ] = await Promise.all([
          apiFetch<SkillsResponse>(
            '/skill-profiles'
          ),

          apiFetch<ProjectsResponse>(
            '/projects'
          ),

          apiFetch<CertificatesResponse>(
            '/certificates'
          ),

          apiFetch<InternshipsResponse>(
            '/internships'
          ),
        ]);

        const rawSkills =
          skillsResponse.skills ||
          skillsResponse.data ||
          [];

        const rawProjects =
          projectsResponse.projects ||
          projectsResponse.data ||
          [];

        const rawCertificates =
          certificatesResponse.certificates ||
          certificatesResponse.data ||
          [];

        const rawInternships =
          internshipsResponse.internships ||
          internshipsResponse.data ||
          [];

        setSkills(
          Array.isArray(rawSkills)
            ? rawSkills.map(normalizeSkill)
            : []
        );

        setProjects(
          Array.isArray(rawProjects)
            ? rawProjects.map(normalizeProject)
            : []
        );

        setCertificates(
          Array.isArray(rawCertificates)
            ? rawCertificates.map(
                normalizeCertificate
              )
            : []
        );

        setInternships(
          Array.isArray(rawInternships)
            ? rawInternships
                .map(normalizeInternship)
                .filter(
                  (internship) =>
                    internship.status ===
                      'completed' ||
                    internship.progress >= 100
                )
            : []
        );
      } catch (error) {
        console.error(
          'Failed to load portfolio:',
          error
        );

        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load portfolio'
        );
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [user]);

  const addProject = async () => {
    if (!newProject.title.trim()) {
      toast.error(
        'Please enter a project title'
      );
      return;
    }

    setSavingProject(true);

    try {
      const response = await apiFetch<{
        success: boolean;
        project?: ApiProject;
        message?: string;
      }>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: newProject.title.trim(),
          description:
            newProject.description.trim(),
          projectUrl:
            newProject.project_url.trim(),
          repoUrl:
            newProject.repo_url.trim(),
          skillsUsed:
            newProject.skills_used,
        }),
      });

      if (!response.project) {
        throw new Error(
          response.message ||
            'Project was not returned by the server'
        );
      }

      setProjects((prev) => [
        ...prev,
        normalizeProject(response.project!),
      ]);

      setNewProject({
        title: '',
        description: '',
        project_url: '',
        repo_url: '',
        skills_used: [],
      });

      setShowAddProject(false);

      toast.success(
        'Project added successfully'
      );
    } catch (error) {
      console.error(
        'Failed to add project:',
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to add project'
      );
    } finally {
      setSavingProject(false);
    }
  };

  const deleteProject = async (
    id: string
  ) => {
    if (!id) {
      toast.error('Invalid project');
      return;
    }

    setDeletingProjectId(id);

    try {
      await apiFetch(
        `/projects/${id}`,
        {
          method: 'DELETE',
        }
      );

      setProjects((prev) =>
        prev.filter(
          (project) => project.id !== id
        )
      );

      toast.success('Project removed');
    } catch (error) {
      console.error(
        'Failed to delete project:',
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete project'
      );
    } finally {
      setDeletingProjectId(null);
    }
  };

  const addCert = async () => {
    if (!newCert.title.trim()) {
      toast.error(
        'Please enter a certificate title'
      );
      return;
    }

    setSavingCertificate(true);

    try {
      const response = await apiFetch<{
        success: boolean;
        certificate?: ApiCertificate;
        message?: string;
      }>('/certificates', {
        method: 'POST',
        body: JSON.stringify({
          title: newCert.title.trim(),
          issuer: newCert.issuer.trim(),
          issueDate:
            newCert.issue_date || null,
          skillName:
            newCert.skill_name.trim(),
        }),
      });

      if (!response.certificate) {
        throw new Error(
          response.message ||
            'Certificate was not returned by the server'
        );
      }

      setCertificates((prev) => [
        ...prev,
        normalizeCertificate(
          response.certificate!
        ),
      ]);

      setNewCert({
        title: '',
        issuer: '',
        issue_date: '',
        skill_name: '',
      });

      setShowAddCert(false);

      toast.success(
        'Certificate added successfully'
      );
    } catch (error) {
      console.error(
        'Failed to add certificate:',
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to add certificate'
      );
    } finally {
      setSavingCertificate(false);
    }
  };

  const deleteCert = async (
    id: string
  ) => {
    if (!id) {
      toast.error('Invalid certificate');
      return;
    }

    setDeletingCertificateId(id);

    try {
      await apiFetch(
        `/certificates/${id}`,
        {
          method: 'DELETE',
        }
      );

      setCertificates((prev) =>
        prev.filter(
          (certificate) =>
            certificate.id !== id
        )
      );

      toast.success('Certificate removed');
    } catch (error) {
      console.error(
        'Failed to delete certificate:',
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete certificate'
      );
    } finally {
      setDeletingCertificateId(null);
    }
  };

  const displayName =
    user?.full_name || 'Student';

  const initials =
    displayName.charAt(0).toUpperCase() ||
    'U';

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-primary to-brand-medium" />

        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-brand-primary shadow-card">
              {initials}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-ink">
                {displayName}
              </h2>

              <p className="text-sm text-ink-muted">
                {user?.degree || 'Student'}
                {user?.institution
                  ? ` · ${user.institution}`
                  : ''}
              </p>
            </div>

            <div className="flex gap-2">
              {user?.linkedin_url && (
                <a
                  href={user.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-2 text-ink-muted hover:bg-gray-100"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}

              {user?.github_url && (
                <a
                  href={user.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-2 text-ink-muted hover:bg-gray-100"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {user?.bio && (
            <p className="mt-4 text-sm text-ink">
              {user.bio}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-muted">
            {user?.location && (
              <span>{user.location}</span>
            )}

            {user?.email && (
              <span>{user.email}</span>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-ink">
          Skills
        </h3>

        {loading ? (
          <p className="mt-3 text-sm text-ink-muted">
            Loading skills...
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.length === 0 ? (
              <span className="text-sm text-ink-muted">
                No skills added yet.
              </span>
            ) : (
              skills.map((skill) => (
                <SkillBadge
                  key={skill.id}
                  name={skill.skill_name}
                  level={skill.level}
                  score={skill.score}
                  verified={skill.is_verified}
                />
              ))
            )}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-ink">
            Projects
          </h3>

          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              setShowAddProject(true)
            }
            disabled={savingProject}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {loading ? (
          <p className="mt-3 text-sm text-ink-muted">
            Loading projects...
          </p>
        ) : projects.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">
            No projects yet. Showcase your work!
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-surface-border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-brand-primary" />

                    <h4 className="font-semibold text-ink">
                      {project.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      deleteProject(
                        project.id
                      )
                    }
                    disabled={
                      deletingProjectId ===
                      project.id
                    }
                    className="text-ink-muted hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {project.description && (
                  <p className="mt-2 text-sm text-ink-muted">
                    {project.description}
                  </p>
                )}

                {project.skills_used &&
                  project.skills_used.length >
                    0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {project.skills_used.map(
                        (skill) => (
                          <Badge
                            key={skill}
                            variant="brand"
                          >
                            {skill}
                          </Badge>
                        )
                      )}
                    </div>
                  )}

                <div className="mt-3 flex gap-3">
                  {project.project_url && (
                    <a
                      href={
                        project.project_url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-brand-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Live
                    </a>
                  )}

                  {project.repo_url && (
                    <a
                      href={project.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-brand-primary hover:underline"
                    >
                      <Github className="h-3 w-3" />
                      Code
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-ink">
            Certificates
          </h3>

          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              setShowAddCert(true)
            }
            disabled={savingCertificate}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {loading ? (
          <p className="mt-3 text-sm text-ink-muted">
            Loading certificates...
          </p>
        ) : certificates.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">
            No certificates yet.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {certificates.map(
              (certificate) => (
                <div
                  key={certificate.id}
                  className="flex items-center justify-between rounded-xl border border-surface-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-brand-primary" />

                    <div>
                      <p className="text-sm font-medium text-ink">
                        {certificate.title}
                      </p>

                      <p className="text-xs text-ink-muted">
                        {certificate.issuer ||
                          'Certificate'}
                        {' · '}
                        {formatDate(
                          certificate.issue_date
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      deleteCert(
                        certificate.id
                      )
                    }
                    disabled={
                      deletingCertificateId ===
                      certificate.id
                    }
                    className="text-ink-muted hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </Card>

      {internships.length > 0 && (
        <Card className="p-5">
          <h3 className="font-bold text-ink">
            Internship History
          </h3>

          <div className="mt-3 space-y-2">
            {internships.map(
              (internship) => (
                <div
                  key={internship.id}
                  className="flex items-center justify-between rounded-xl border border-surface-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-brand-primary" />

                    <div>
                      <p className="text-sm font-medium text-ink">
                        {internship.title}
                      </p>

                      <p className="text-xs text-ink-muted">
                        {internship.company_name ||
                          'Company'}
                        {' · '}
                        {formatDate(
                          internship.start_date
                        )}
                        {' - '}
                        {formatDate(
                          internship.end_date
                        )}
                      </p>
                    </div>
                  </div>

                  <Badge variant="success">
                    Completed
                  </Badge>
                </div>
              )
            )}
          </div>
        </Card>
      )}

      <Modal
        isOpen={showAddProject}
        onClose={() => {
          if (!savingProject) {
            setShowAddProject(false);
          }
        }}
        title="Add Project"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={newProject.title}
            onChange={(e) =>
              setNewProject({
                ...newProject,
                title: e.target.value,
              })
            }
            placeholder="My awesome project"
            disabled={savingProject}
          />

          <Textarea
            label="Description"
            rows={3}
            value={newProject.description}
            onChange={(e) =>
              setNewProject({
                ...newProject,
                description:
                  e.target.value,
              })
            }
            disabled={savingProject}
          />

          <Input
            label="Live URL (optional)"
            value={newProject.project_url}
            onChange={(e) =>
              setNewProject({
                ...newProject,
                project_url:
                  e.target.value,
              })
            }
            placeholder="https://..."
            disabled={savingProject}
          />

          <Input
            label="Repository URL (optional)"
            value={newProject.repo_url}
            onChange={(e) =>
              setNewProject({
                ...newProject,
                repo_url:
                  e.target.value,
              })
            }
            placeholder="https://github.com/..."
            disabled={savingProject}
          />

          <Select
            label="Skills Used"
            value=""
            disabled={savingProject}
            onChange={(e) => {
              if (
                e.target.value &&
                !newProject.skills_used.includes(
                  e.target.value
                )
              ) {
                setNewProject({
                  ...newProject,
                  skills_used: [
                    ...newProject.skills_used,
                    e.target.value,
                  ],
                });
              }
            }}
          >
            <option value="">
              Select a skill to add
            </option>

            {ALL_SKILLS.filter(
              (skill) =>
                !newProject.skills_used.includes(
                  skill
                )
            ).map((skill) => (
              <option
                key={skill}
                value={skill}
              >
                {skill}
              </option>
            ))}
          </Select>

          {newProject.skills_used.length >
            0 && (
            <div className="flex flex-wrap gap-1.5">
              {newProject.skills_used.map(
                (skill) => (
                  <Badge
                    key={skill}
                    variant="brand"
                  >
                    {skill}
                  </Badge>
                )
              )}
            </div>
          )}

          <Button
            onClick={addProject}
            className="w-full"
            disabled={savingProject}
          >
            {savingProject
              ? 'Adding Project...'
              : 'Add Project'}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showAddCert}
        onClose={() => {
          if (!savingCertificate) {
            setShowAddCert(false);
          }
        }}
        title="Add Certificate"
      >
        <div className="space-y-4">
          <Input
            label="Certificate Title"
            value={newCert.title}
            onChange={(e) =>
              setNewCert({
                ...newCert,
                title: e.target.value,
              })
            }
            placeholder="e.g. AWS Certified Developer"
            disabled={savingCertificate}
          />

          <Input
            label="Issuer"
            value={newCert.issuer}
            onChange={(e) =>
              setNewCert({
                ...newCert,
                issuer: e.target.value,
              })
            }
            placeholder="e.g. Amazon Web Services"
            disabled={savingCertificate}
          />

          <Input
            label="Issue Date"
            type="date"
            value={newCert.issue_date}
            onChange={(e) =>
              setNewCert({
                ...newCert,
                issue_date:
                  e.target.value,
              })
            }
            disabled={savingCertificate}
          />

          <Input
            label="Skill (optional)"
            value={newCert.skill_name}
            onChange={(e) =>
              setNewCert({
                ...newCert,
                skill_name:
                  e.target.value,
              })
            }
            placeholder="e.g. Cloud Computing"
            disabled={savingCertificate}
          />

          <Button
            onClick={addCert}
            className="w-full"
            disabled={savingCertificate}
          >
            {savingCertificate
              ? 'Adding Certificate...'
              : 'Add Certificate'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}