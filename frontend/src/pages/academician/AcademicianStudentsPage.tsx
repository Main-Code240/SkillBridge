import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/ui/StateViews";
import Modal from "@/components/ui/Modal";
import type { Profile, SkillProfile } from "@/types";

export default function AcademicianStudentsPage() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<SkillProfile[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setStudents([]);
      } catch {
        setError("Failed to load students.");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const viewStudent = async (student: Profile) => {
    setSelected(student);

    try {
      setSkills([]);
    } catch {
      setSkills([]);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const filtered = students.filter((student) => {
    const fullName =
      (student as any).fullName ||
      (student as any).full_name ||
      "";

    const email = student.email || "";

    const institution =
      (student as any).institution ||
      (student as any).institutionName ||
      "";

    const searchValue = search.toLowerCase();

    return (
      !search ||
      fullName.toLowerCase().includes(searchValue) ||
      email.toLowerCase().includes(searchValue) ||
      institution.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">
          Students
        </h2>

        <p className="text-sm text-ink-muted">
          View student profiles and skill assessments
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input-field pl-10"
          placeholder="Search by name, email, or institution..."
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <Users className="h-8 w-8 text-brand-primary/40" />
            }
            title="No students found"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((student) => {
            const fullName =
              (student as any).fullName ||
              (student as any).full_name ||
              "Student";

            const institution =
              (student as any).institution ||
              (student as any).institutionName;

            const degree = (student as any).degree;

            const department =
              (student as any).department;

            const graduationYear =
              (student as any).graduationYear ||
              (student as any).graduation_year;

            return (
              <Card
                key={student.id}
                className="p-5"
                hover
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary font-bold text-white">
                    {fullName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-ink">
                      {fullName}
                    </h3>

                    <p className="text-xs text-ink-muted">
                      {student.email}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm text-ink-muted">
                  {institution && <p>{institution}</p>}

                  {degree && (
                    <p>
                      {degree}
                      {department
                        ? ` · ${department}`
                        : ""}
                    </p>
                  )}

                  {graduationYear && (
                    <p>
                      Graduating: {graduationYear}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => viewStudent(student)}
                  className="mt-3 w-full rounded-xl bg-brand-primary/5 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10"
                >
                  View Skills
                </button>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={
          ((selected as any)?.fullName ||
            (selected as any)?.full_name ||
            "Student")
        }
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {((selected as any).institution ||
                (selected as any).institutionName) && (
                <div>
                  <p className="text-ink-muted">
                    Institution
                  </p>

                  <p className="font-medium text-ink">
                    {(selected as any).institution ||
                      (selected as any).institutionName}
                  </p>
                </div>
              )}

              {(selected as any).degree && (
                <div>
                  <p className="text-ink-muted">
                    Degree
                  </p>

                  <p className="font-medium text-ink">
                    {(selected as any).degree}
                  </p>
                </div>
              )}

              {(selected as any).department && (
                <div>
                  <p className="text-ink-muted">
                    Department
                  </p>

                  <p className="font-medium text-ink">
                    {(selected as any).department}
                  </p>
                </div>
              )}

              {((selected as any).graduationYear ||
                (selected as any).graduation_year) && (
                <div>
                  <p className="text-ink-muted">
                    Graduation
                  </p>

                  <p className="font-medium text-ink">
                    {(selected as any).graduationYear ||
                      (selected as any).graduation_year}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-ink">
                Skill Profile
              </h4>

              {skills.length === 0 ? (
                <p className="mt-2 text-sm text-ink-muted">
                  No skills assessed yet.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {skills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-ink">
                          {skill.skill_name}
                        </span>

                        <span className="font-bold text-brand-primary">
                          {skill.score}%
                        </span>
                      </div>

                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${
                            skill.score >= 70
                              ? "bg-success"
                              : skill.score >= 50
                              ? "bg-brand-primary"
                              : "bg-error"
                          }`}
                          style={{
                            width: `${skill.score}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}