import { useEffect, useState } from "react";
import {
  Award,
  Plus,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Card, Badge } from "@/components/ui/Card";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/StateViews";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import toast from "react-hot-toast";
import type {
  Internship,
  InternshipProgress,
  MentorFeedback,
} from "@/types";
import { formatDate, titleCase } from "@/utils";
import { api } from "@/lib/api";

export default function StudentInternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [progressMap, setProgressMap] = useState<
    Record<string, InternshipProgress[]>
  >({});
  const [feedbackMap, setFeedbackMap] = useState<
    Record<string, MentorFeedback[]>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] =
    useState<Internship | null>(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

  const [addingTask, setAddingTask] =
    useState(false);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<{
        internships: Internship[];
      }>("/internships");

      const loadedInternships =
        response.internships || [];

      setInternships(loadedInternships);

      const taskEntries =
        await Promise.all(
          loadedInternships.map(async (internship) => {
            try {
              const response = await api.get<{
                tasks: InternshipProgress[];
                feedback: MentorFeedback[];
              }>(`/internships/${internship.id}`);

              return {
                id: internship.id,
                tasks: response.tasks || [],
                feedback: response.feedback || [],
              };
            } catch {
              return {
                id: internship.id,
                tasks: [],
                feedback: [],
              };
            }
          })
        );

      const nextProgressMap: Record<
        string,
        InternshipProgress[]
      > = {};

      const nextFeedbackMap: Record<
        string,
        MentorFeedback[]
      > = {};

      taskEntries.forEach((entry) => {
        nextProgressMap[entry.id] = entry.tasks;
        nextFeedbackMap[entry.id] = entry.feedback;
      });

      setProgressMap(nextProgressMap);
      setFeedbackMap(nextFeedbackMap);
    } catch (err: any) {
      setError(
        err?.message || "Failed to load internships."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const updateTaskStatus = async (
    internshipId: string,
    taskId: string,
    status:
      | "pending"
      | "in_progress"
      | "completed"
  ) => {
    try {
      const response = await api.patch<{
        task: InternshipProgress;
        internship?: Internship;
      }>(
        `/internships/${internshipId}/tasks/${taskId}`,
        {
          status,
        }
      );

      setProgressMap((previous) => ({
        ...previous,
        [internshipId]: (
          previous[internshipId] || []
        ).map((task) =>
          task.id === taskId
            ? response.task
            : task
        ),
      }));

      if (response.internship) {
        setInternships((previous) =>
          previous.map((internship) =>
            internship.id === internshipId
              ? response.internship!
              : internship
          )
        );
      }

      toast.success("Task updated");
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to update task"
      );
    }
  };

  const addTask = async () => {
    if (!selected || !newTask.title.trim()) {
      return;
    }

    try {
      setAddingTask(true);

      const response = await api.post<{
        task: InternshipProgress;
        internship?: Internship;
      }>(
        `/internships/${selected.id}/tasks`,
        {
          title: newTask.title.trim(),
          description: newTask.description.trim(),
        }
      );

      setProgressMap((previous) => ({
        ...previous,
        [selected.id]: [
          ...(previous[selected.id] || []),
          response.task,
        ],
      }));

      if (response.internship) {
        setInternships((previous) =>
          previous.map((internship) =>
            internship.id === selected.id
              ? response.internship!
              : internship
          )
        );

        setSelected(response.internship);
      }

      setNewTask({
        title: "",
        description: "",
      });

      toast.success("Task added");
      setSelected(null);
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to add task"
      );
    } finally {
      setAddingTask(false);
    }
  };

  const updateProgress = async (
    internship: Internship
  ) => {
    try {
      const response = await api.patch<{
        internship: Internship;
      }>(`/internships/${internship.id}`, {});

      if (response.internship) {
        setInternships((previous) =>
          previous.map((item) =>
            item.id === internship.id
              ? response.internship
              : item
          )
        );

        toast.success(
          `Progress updated to ${response.internship.progress}%`
        );
      }
    } catch (err: any) {
      const tasks =
        progressMap[internship.id] || [];

      if (tasks.length === 0) {
        toast.error(
          "No tasks available to calculate progress"
        );
        return;
      }

      const completed = tasks.filter(
        (task) => task.status === "completed"
      ).length;

      const progress = Math.round(
        (completed / tasks.length) * 100
      );

      toast.success(
        `Current progress: ${progress}%`
      );
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchInternships}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">
          My Internships
        </h2>

        <p className="text-sm text-ink-muted">
          Track your internship progress, tasks, and mentor
          feedback
        </p>
      </div>

      {internships.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <Award className="h-8 w-8 text-brand-primary/40" />
            }
            title="No internships yet"
            description="When you're selected for an opportunity, your internship will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {internships.map((internship) => {
            const tasks =
              progressMap[internship.id] || [];

            const feedbacks =
              feedbackMap[internship.id] || [];

            const company =
              internship.company_name ||
              (internship as any).companyName ||
              "";

            const startDate =
              internship.start_date ||
              (internship as any).startDate;

            const endDate =
              internship.end_date ||
              (internship as any).endDate;

            const mentorName =
              internship.mentor_name ||
              (internship as any).mentorName ||
              "";

            const mentorEmail =
              internship.mentor_email ||
              (internship as any).mentorEmail ||
              "";

            return (
              <Card
                key={internship.id}
                className="p-5"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-ink">
                          {internship.title}
                        </h3>

                        <StatusBadge
                          status={internship.status}
                        />
                      </div>

                      <p className="text-sm text-ink-muted">
                        {company}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand-primary">
                        {internship.progress}%
                      </p>

                      <p className="text-xs text-ink-muted">
                        Complete
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                    {startDate && (
                      <div>
                        <p className="text-ink-muted">
                          Start
                        </p>

                        <p className="font-medium text-ink">
                          {formatDate(startDate)}
                        </p>
                      </div>
                    )}

                    {endDate && (
                      <div>
                        <p className="text-ink-muted">
                          End
                        </p>

                        <p className="font-medium text-ink">
                          {formatDate(endDate)}
                        </p>
                      </div>
                    )}

                    {mentorName && (
                      <div>
                        <p className="text-ink-muted">
                          Mentor
                        </p>

                        <p className="font-medium text-ink">
                          {mentorName}
                        </p>
                      </div>
                    )}

                    {mentorEmail && (
                      <div>
                        <p className="text-ink-muted">
                          Mentor Email
                        </p>

                        <p className="text-xs font-medium text-ink">
                          {mentorEmail}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-brand-primary transition-all"
                      style={{
                        width: `${internship.progress}%`,
                      }}
                    />
                  </div>

                  {internship.goals &&
                    internship.goals.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          Goals
                        </p>

                        <ul className="mt-1 space-y-1">
                          {internship.goals.map(
                            (goal, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2 text-sm text-ink-muted"
                              >
                                <CheckCircle2 className="h-4 w-4 text-brand-primary/40" />
                                {goal}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink">
                        Tasks ({tasks.length})
                      </p>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setSelected(internship)
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Task
                      </Button>
                    </div>

                    {tasks.length === 0 ? (
                      <p className="mt-2 text-sm text-ink-muted">
                        No tasks yet. Add tasks to track your
                        progress.
                      </p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 rounded-xl border border-surface-border p-3"
                          >
                            <button
                              onClick={() => {
                                const next =
                                  task.status === "pending"
                                    ? "in_progress"
                                    : task.status ===
                                        "in_progress"
                                      ? "completed"
                                      : "pending";

                                updateTaskStatus(
                                  internship.id,
                                  task.id,
                                  next
                                );
                              }}
                              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                                task.status ===
                                "completed"
                                  ? "border-success bg-success text-white"
                                  : task.status ===
                                      "in_progress"
                                    ? "border-brand-primary bg-brand-primary/10"
                                    : "border-gray-300"
                              }`}
                            >
                              {task.status ===
                                "completed" && (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                            </button>

                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium ${
                                  task.status ===
                                  "completed"
                                    ? "text-ink-muted line-through"
                                    : "text-ink"
                                }`}
                              >
                                {task.title}
                              </p>

                              {task.description && (
                                <p className="text-xs text-ink-muted">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            <Badge
                              variant={
                                task.status ===
                                "completed"
                                  ? "success"
                                  : task.status ===
                                      "in_progress"
                                    ? "info"
                                    : "default"
                              }
                            >
                              {titleCase(task.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {feedbacks.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Mentor Feedback
                      </p>

                      <div className="mt-2 space-y-2">
                        {feedbacks.map((feedback) => (
                          <div
                            key={feedback.id}
                            className="rounded-xl bg-brand-primary/5 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-ink">
                                {feedback.mentor_name ||
                                  (feedback as any)
                                    .mentorName}
                              </p>

                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(
                                  (number) => (
                                    <Star
                                      key={number}
                                      className={`h-3.5 w-3.5 ${
                                        number <=
                                        feedback.rating
                                          ? "fill-warning text-warning"
                                          : "text-gray-200"
                                      }`}
                                    />
                                  )
                                )}
                              </div>
                            </div>

                            {feedback.strengths && (
                              <p className="mt-1 text-xs text-ink">
                                <strong>
                                  Strengths:
                                </strong>{" "}
                                {feedback.strengths}
                              </p>
                            )}

                            {feedback.improvements && (
                              <p className="mt-0.5 text-xs text-ink">
                                <strong>
                                  Areas to improve:
                                </strong>{" "}
                                {feedback.improvements}
                              </p>
                            )}

                            {feedback.comments && (
                              <p className="mt-0.5 text-xs text-ink-muted">
                                {feedback.comments}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      updateProgress(internship)
                    }
                  >
                    Refresh Progress
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Add Task"
      >
        <div className="space-y-4">
          <Input
            label="Task Title"
            value={newTask.title}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                title: e.target.value,
              })
            }
            placeholder="e.g. Complete project wireframes"
          />

          <Textarea
            label="Description (optional)"
            rows={3}
            value={newTask.description}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                description: e.target.value,
              })
            }
          />

          <Button
            onClick={addTask}
            disabled={
              addingTask || !newTask.title.trim()
            }
            className="w-full"
          >
            {addingTask ? "Adding..." : "Add Task"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}