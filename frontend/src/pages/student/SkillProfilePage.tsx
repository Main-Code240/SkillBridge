import { useEffect, useState } from 'react';
import { Brain, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Badge } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/StateViews';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import SkillBadge from '@/components/ui/SkillBadge';
import toast from 'react-hot-toast';
import type { SkillProfile, SkillLevel } from '@/types';
import { getSkillLevel, ALL_SKILLS, titleCase } from '@/utils';
import { apiFetch } from '@/lib/api';

const levelColors: Record<SkillLevel, string> = {
  beginner: 'bg-gray-100 text-gray-600',
  intermediate: 'bg-blue-50 text-brand-secondary',
  advanced: 'bg-brand-primary/10 text-brand-primary',
  expert: 'bg-green-50 text-success',
};

interface ApiSkillProfile {
  _id?: string;
  id?: string;
  user?: string;
  skillId?: string | null;
  skillName?: string;
  category?: string;
  score?: number;
  level?: string;
  source?: string;
  isVerified?: boolean;
}

interface SkillsResponse {
  success?: boolean;
  skills?: ApiSkillProfile[];
  skillProfiles?: ApiSkillProfile[];
  data?: ApiSkillProfile[];
}

function normalizeSkill(skill: ApiSkillProfile): SkillProfile {
  return {
    id: skill._id || skill.id || '',
    user_id: skill.user || '',
    skill_name: skill.skillName || '',
    category: skill.category || '',
    score: skill.score ?? 0,
    level:
      (skill.level as SkillLevel) || 'beginner',
    source: skill.source || 'manual',
    is_verified: skill.isVerified ?? false,
  } as SkillProfile;
}

export default function SkillProfilePage() {
  const { user } = useAuth();

  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Technical',
    score: 50,
    source: 'manual',
  });

  useEffect(() => {
    if (!user) {
      setSkills([]);
      setLoading(false);
      return;
    }

    const loadSkills = async () => {
      try {
        setLoading(true);

        const response =
          await apiFetch<SkillsResponse>(
            '/skill-profiles'
          );

        const apiSkills =
          response.skills ||
          response.skillProfiles ||
          response.data ||
          [];

        const normalizedSkills =
          apiSkills
            .map(normalizeSkill)
            .sort((a, b) => b.score - a.score);

        setSkills(normalizedSkills);
      } catch (error) {
        console.error('Failed to load skills:', error);

        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load skills'
        );
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, [user]);

  const handleAdd = async () => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    if (!newSkill.name.trim()) {
      toast.error('Please select a skill');
      return;
    }

    try {
      setSaving(true);

      const level = getSkillLevel(
        newSkill.score
      );

      const response =
        await apiFetch<{
          success?: boolean;
          skill?: ApiSkillProfile;
          data?: ApiSkillProfile;
        }>('/skill-profiles', {
          method: 'POST',
          body: JSON.stringify({
            skillName: newSkill.name.trim(),
            category: newSkill.category,
            score: newSkill.score,
            level,
            source: newSkill.source,
          }),
        });

      const createdSkill =
        response.skill || response.data;

      if (createdSkill) {
        const normalizedSkill =
          normalizeSkill(createdSkill);

        setSkills((prev) =>
          [...prev, normalizedSkill].sort(
            (a, b) => b.score - a.score
          )
        );
      } else {
        const refreshed =
          await apiFetch<SkillsResponse>(
            '/skill-profiles'
          );

        const apiSkills =
          refreshed.skills ||
          refreshed.skillProfiles ||
          refreshed.data ||
          [];

        setSkills(
          apiSkills
            .map(normalizeSkill)
            .sort((a, b) => b.score - a.score)
        );
      }

      toast.success('Skill added successfully');

      setShowAdd(false);

      setNewSkill({
        name: '',
        category: 'Technical',
        score: 50,
        source: 'manual',
      });
    } catch (error) {
      console.error('Failed to add skill:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to add skill'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;

    try {
      setDeletingId(id);

      await apiFetch(
        `/skill-profiles/${id}`,
        {
          method: 'DELETE',
        }
      );

      setSkills((prev) =>
        prev.filter((skill) => skill.id !== id)
      );

      toast.success('Skill removed successfully');
    } catch (error) {
      console.error(
        'Failed to delete skill:',
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to remove skill'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const categories = [
    ...new Set(
      skills.map((skill) => skill.category)
    ),
  ].sort();

  const gaps = skills.filter(
    (skill) => skill.score < 50
  );

  const strengths = skills.filter(
    (skill) => skill.score >= 70
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink">
              My Skill Profile
            </h2>

            <p className="text-sm text-ink-muted">
              Loading your skills...
            </p>
          </div>

          <Button disabled>
            <Plus className="h-4 w-4" />
            Add Skill
          </Button>
        </div>

        <Card className="p-8">
          <div className="text-center text-sm text-ink-muted">
            Loading skill profile...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">
            My Skill Profile
          </h2>

          <p className="text-sm text-ink-muted">
            {skills.length} skills tracked ·{' '}
            {strengths.length} strengths ·{' '}
            {gaps.length} gaps
          </p>
        </div>

        <Button
          onClick={() => setShowAdd(true)}
        >
          <Plus className="h-4 w-4" />
          Add Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <Brain className="h-8 w-8 text-brand-primary/40" />
            }
            title="No skills yet"
            description="Add skills manually or take an assessment to build your skill profile."
            action={
              <Button
                onClick={() => setShowAdd(true)}
              >
                <Plus className="h-4 w-4" />
                Add Your First Skill
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-bold text-success">
                Strengths
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {strengths.length === 0 ? (
                  <span className="text-sm text-ink-muted">
                    No strengths yet. Take assessments to identify
                    your strong skills.
                  </span>
                ) : (
                  strengths.map((skill) => (
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
            </Card>

            <Card className="p-5">
              <h3 className="font-bold text-error">
                Skill Gaps
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {gaps.length === 0 ? (
                  <span className="text-sm text-ink-muted">
                    No significant gaps detected. Great job!
                  </span>
                ) : (
                  gaps.map((skill) => (
                    <SkillBadge
                      key={skill.id}
                      name={skill.skill_name}
                      level={skill.level}
                      score={skill.score}
                    />
                  ))
                )}
              </div>
            </Card>
          </div>

          {categories.map((category) => (
            <Card
              key={category}
              className="p-5"
            >
              <h3 className="mb-4 font-bold text-ink">
                {category}
              </h3>

              <div className="space-y-3">
                {skills
                  .filter(
                    (skill) =>
                      skill.category === category
                  )
                  .map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-ink">
                              {skill.skill_name}
                            </span>

                            {skill.is_verified && (
                              <Badge variant="success">
                                Verified
                              </Badge>
                            )}

                            <span className="text-xs text-ink-muted">
                              · {titleCase(skill.source)}
                            </span>
                          </div>

                          <span className="text-sm font-bold text-brand-primary">
                            {skill.score}%
                          </span>
                        </div>

                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full ${
                              skill.score >= 70
                                ? 'bg-success'
                                : skill.score >= 50
                                  ? 'bg-brand-primary'
                                  : 'bg-error'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  skill.score
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          levelColors[
                            skill.level
                          ]
                        }`}
                      >
                        {titleCase(
                          skill.level
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            skill.id
                          )
                        }
                        disabled={
                          deletingId ===
                          skill.id
                        }
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </Card>
          ))}
        </>
      )}

      <Modal
        isOpen={showAdd}
        onClose={() =>
          !saving && setShowAdd(false)
        }
        title="Add Skill"
      >
        <div className="space-y-4">
          <Select
            label="Skill"
            value={newSkill.name}
            onChange={(e) =>
              setNewSkill({
                ...newSkill,
                name: e.target.value,
              })
            }
            disabled={saving}
          >
            <option value="">
              Select a skill
            </option>

            {ALL_SKILLS.map((skill) => (
              <option
                key={skill}
                value={skill}
              >
                {skill}
              </option>
            ))}
          </Select>

          <Select
            label="Category"
            value={newSkill.category}
            onChange={(e) =>
              setNewSkill({
                ...newSkill,
                category: e.target.value,
              })
            }
            disabled={saving}
          >
            <option value="Technical">
              Technical
            </option>

            <option value="Soft Skills">
              Soft Skills
            </option>

            <option value="Domain">
              Domain Knowledge
            </option>

            <option value="Aptitude">
              Aptitude
            </option>
          </Select>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Proficiency Score:{' '}
              {newSkill.score}%
            </label>

            <input
              type="range"
              min="0"
              max="100"
              value={newSkill.score}
              onChange={(e) =>
                setNewSkill({
                  ...newSkill,
                  score: parseInt(
                    e.target.value,
                    10
                  ),
                })
              }
              disabled={saving}
              className="w-full accent-brand-primary"
            />

            <div className="mt-1 flex justify-between text-xs text-ink-muted">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Advanced</span>
              <span>Expert</span>
            </div>
          </div>

          <Select
            label="Source"
            value={newSkill.source}
            onChange={(e) =>
              setNewSkill({
                ...newSkill,
                source: e.target.value,
              })
            }
            disabled={saving}
          >
            <option value="manual">
              Manual Entry
            </option>

            <option value="certification">
              Certification
            </option>

            <option value="project">
              Project
            </option>

            <option value="internship">
              Internship
            </option>
          </Select>

          <Button
            onClick={handleAdd}
            disabled={saving}
            className="w-full"
          >
            {saving
              ? 'Adding Skill...'
              : 'Add Skill'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}