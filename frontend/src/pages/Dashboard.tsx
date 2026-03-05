import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { useToast } from "../context/ToastContext";
import goalsService, {
  type Goal,
  type GoalStats,
  type WeeklyProgressItem,
} from "../services/goalsService";
import "./Dashboard.css";

const getStreakMessage = (streak: number): string => {
  if (streak === 0) return "Your journey begins today.";
  if (streak === 1) return "First step taken.";
  if (streak < 7) return "Momentum is building.";
  if (streak < 14) return "A rhythm emerges.";
  if (streak < 30) return "Consistency compounds.";
  return "You are unstoppable.";
};

function Dashboard() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [completingGoalId, setCompletingGoalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const authToken = auth?.token ?? localStorage.getItem("token") ?? undefined;
  const email = auth?.user?.email ?? "user@elevare.app";

  const loadDashboardData = useCallback(async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [goalsData, statsData, weeklyProgress] = await Promise.all([
        goalsService.getAllGoals(authToken),
        goalsService.getCompletionStats(authToken),
        goalsService.getWeeklyProgress(authToken),
      ]);

      setGoals(Array.isArray(goalsData) ? goalsData : []);
      setStats(statsData ?? null);
      setWeeklyData(Array.isArray(weeklyProgress) ? weeklyProgress : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [authToken, toast]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const refreshStatsAndWeekly = useCallback(async () => {
    if (!authToken) return;

    try {
      const [statsData, weeklyProgress] = await Promise.all([
        goalsService.getCompletionStats(authToken),
        goalsService.getWeeklyProgress(authToken),
      ]);
      setStats(statsData ?? null);
      setWeeklyData(Array.isArray(weeklyProgress) ? weeklyProgress : []);
    } catch {
      // Keep existing view if secondary refresh fails.
    }
  }, [authToken]);

  const handleLogout = useCallback(() => {
    auth?.logout();
    navigate("/login", { replace: true });
  }, [auth, navigate]);

  const getTodayCompletion = useCallback((goal: Goal): boolean => {
    const history = Array.isArray(goal.completionHistory) ? goal.completionHistory : [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return history.some((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime() && entry.completed;
    });
  }, []);

  const handleCreateFirstChapter = useCallback(async () => {
    if (!authToken) {
      const message = "Authentication required. Please log in again.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsCreatingGoal(true);
    setError(null);

    try {
      const createdGoal = await goalsService.createGoal(
        {
          title: "My First Chapter",
          description: "Start small. Build momentum every day.",
          category: "Productivity",
          frequencyType: "daily",
          requiredCount: 1,
          targetDays: 30,
          reminderTime: "09:00",
        },
        authToken
      );

      setGoals((current) => [createdGoal, ...current]);
      toast.success("First chapter created.");
      await refreshStatsAndWeekly();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create goal.";
      setError(message);
      toast.error(message);
    } finally {
      setIsCreatingGoal(false);
    }
  }, [authToken, refreshStatsAndWeekly, toast]);

  const handleComplete = useCallback(
    async (goalId: string) => {
      if (!authToken) {
        const message = "Authentication required. Please log in again.";
        setError(message);
        toast.error(message);
        return;
      }

      setCompletingGoalId(goalId);
      setError(null);

      try {
        const updatedGoal = await goalsService.completeGoal(goalId, authToken);
        setGoals((current) => current.map((goal) => (goal._id === goalId ? updatedGoal : goal)));
        toast.success("Goal marked complete.");
        await refreshStatsAndWeekly();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to mark goal complete.";
        setError(message);
        toast.error(message);
      } finally {
        setCompletingGoalId(null);
      }
    },
    [authToken, refreshStatsAndWeekly, toast]
  );

  const completionRate = useMemo(() => {
    if (!stats || stats.totalGoals === 0) {
      return 0;
    }

    return Math.round((stats.totalCompletions / stats.totalGoals) * 100);
  }, [stats]);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          <div className="brand">Elevare</div>
          <nav className="sidebar-nav">
            <button className="nav-item active" type="button" aria-label="Dashboard">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-10h8V3h-8v8Z" />
              </svg>
            </button>
            <button className="nav-item" type="button" aria-label="Profile">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
              </svg>
            </button>
            <button className="nav-item" type="button" aria-label="Settings">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m19.14 12.94.86-1.49-.86-1.49-1.71-.29a5.84 5.84 0 0 0-.52-1.25l1-1.44-1.41-1.41-1.44 1a5.84 5.84 0 0 0-1.25-.52l-.29-1.71h-1.98l-.29 1.71a5.84 5.84 0 0 0-1.25.52l-1.44-1-1.41 1.41 1 1.44a5.84 5.84 0 0 0-.52 1.25l-1.71.29-.86 1.49.86 1.49 1.71.29c.12.43.3.85.52 1.25l-1 1.44 1.41 1.41 1.44-1c.4.22.82.4 1.25.52l.29 1.71h1.98l.29-1.71c.43-.12.85-.3 1.25-.52l1.44 1 1.41-1.41-1-1.44c.22-.4.4-.82.52-1.25l1.71-.29ZM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Z" />
              </svg>
            </button>
          </nav>
        </div>

        <button className="logout-btn" type="button" onClick={handleLogout} aria-label="Logout">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 17v-3H3v-4h7V7l5 5-5 5Zm4 4H7a2 2 0 0 1-2-2v-3h2v3h7V5H7v3H5V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2Z" />
          </svg>
        </button>
      </aside>

      <div className="dashboard-main">
        <div className="gradient-orbs" aria-hidden="true" />
        <div className="floating-shapes" aria-hidden="true" />

        <header className="dashboard-header">
          <div className="header-content">
            <p className="header-user">{email}</p>
          </div>
        </header>

        {error ? (
          <div className="error-banner" role="alert">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="loading-screen">
            <div className="loading-spinner" />
            <p>Gathering your story...</p>
          </div>
        ) : (
          <main className="dashboard-narrative">
            <section className="section-welcome">
              <h1 className="journey-heading">Your Journey Continues</h1>
              <p className="journey-subtext">{getStreakMessage(stats?.highestStreak ?? 0)}</p>
            </section>

            <section className="section-momentum">
              <div className="momentum-card">
                <div className="streak-display">
                  <span className="streak-number">{stats?.highestStreak ?? 0}</span>
                  <span className="streak-label">Day Streak</span>
                </div>
                <p className="momentum-quote">Consistency compounds.</p>
              </div>
            </section>

            {stats ? (
              <section className="section-metrics">
                <div className="metrics-trio">
                  <div className="metric-item">
                    <div className="metric-value">{stats.activeGoals}</div>
                    <div className="metric-label">Active Chapters</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{stats.thisMonthCompletions}</div>
                    <div className="metric-label">This Month</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{completionRate}%</div>
                    <div className="metric-label">Overall</div>
                  </div>
                </div>
              </section>
            ) : null}

            {weeklyData.length > 0 ? (
              <section className="section-growth-arc">
                <h2 className="section-title">Growth Arc</h2>
                <div className="growth-container">
                  <div className="growth-bars">
                    {weeklyData.map((day) => (
                      <div key={day.date} className="growth-bar-item">
                        <div className="growth-bar-bg">
                          <div
                            className="growth-bar-fill"
                            style={{
                              height: `${Math.min(day.percentage, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="growth-label">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {goals.length > 0 ? (
              <section className="section-chapters">
                <h2 className="section-title">Active Chapters</h2>
                <div className="chapters-container">
                  {goals.map((goal, idx) => {
                    const completedToday = getTodayCompletion(goal);
                    const isCompleting = completingGoalId === goal._id;

                    return (
                      <article key={goal._id} className="chapter-card">
                        <div className="chapter-number">Chapter {idx + 1}</div>
                        <h3 className="chapter-title">{goal.title}</h3>

                        <p className={goal.currentStreak > 0 ? "streak-active" : "streak-inactive"}>
                          Current Streak: {goal.currentStreak}
                        </p>
                        <p>Longest Streak: {goal.longestStreak}</p>

                        {goal.description ? (
                          <p className="chapter-description">{goal.description}</p>
                        ) : null}

                        <div className="chapter-progress">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${
                                  (goal.currentStreak / Math.max(goal.longestStreak, 1)) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <div className="progress-stats">
                            <span className="progress-current">{goal.currentStreak}</span>
                            <span className="progress-max">/ {Math.max(goal.longestStreak, 1)}</span>
                          </div>
                        </div>

                        <div className="chapter-footer">
                          <span className="chapter-category">{goal.category}</span>
                          <div className="chapter-actions">
                            <button
                              type="button"
                              className="complete-btn"
                              onClick={() => handleComplete(goal._id)}
                              disabled={isCompleting || completedToday}
                              aria-label={`Mark ${goal.title} complete`}
                            >
                              {isCompleting ? "Completing..." : completedToday ? "Done" : "Mark Complete"}
                            </button>
                            <button
                              type="button"
                              className={`chapter-action ${completedToday ? "done" : ""}`}
                              onClick={() => handleComplete(goal._id)}
                              disabled={completedToday || isCompleting}
                              aria-label={`Quick mark ${goal.title}`}
                            >
                              {completedToday ? "OK" : isCompleting ? "..." : "+"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : (
              <section className="section-empty">
                <p className="empty-message">
                  Your chapters are waiting. Start one small habit and grow it every day.
                </p>
                <button
                  type="button"
                  className="btn-start"
                  onClick={handleCreateFirstChapter}
                  disabled={isCreatingGoal}
                >
                  {isCreatingGoal ? (
                    <span className="btn-loading">
                      <span className="btn-spinner" /> Creating...
                    </span>
                  ) : (
                    "Create First Chapter"
                  )}
                </button>
              </section>
            )}
          </main>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
