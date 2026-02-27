import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import goalsService from "../services/goalsService";
import "./Dashboard.css";

interface Goal {
  _id: string;
  title: string;
  description: string;
  category: string;
  currentStreak: number;
  longestStreak: number;
  completionHistory: Array<{ date: string; completed: boolean }>;
}

interface Stats {
  totalGoals: number;
  activeGoals: number;
  totalCompletions: number;
  thisMonthCompletions: number;
  highestStreak: number;
}

interface WeeklyData {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

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

  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingGoalId, setCompletingGoalId] = useState<string | null>(null);

  const email = auth?.user?.email ?? "user@elevare.app";

  useEffect(() => {
    const loadData = async () => {
      if (!auth?.token) return;

      try {
        setLoading(true);
        const [goalsRes, statsRes, weeklyRes] = await Promise.all([
          goalsService.getAllGoals(auth.token),
          goalsService.getCompletionStats(auth.token),
          goalsService.getWeeklyProgress(auth.token),
        ]);

        setGoals(goalsRes);
        setStats(statsRes);
        setWeeklyData(weeklyRes);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [auth?.token]);

  const handleLogout = () => {
    auth?.logout();
    navigate("/login", { replace: true });
  };

  const getTodayCompletion = (goal: Goal) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return goal.completionHistory.some((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime() && entry.completed;
    });
  };

  const handleCompleteGoal = async (goalId: string) => {
    if (!auth?.token) return;

    try {
      setCompletingGoalId(goalId);
      const completed = await goalsService.completeGoalToday(auth.token, goalId);
      setGoals((prev) => prev.map((goal) => (goal._id === goalId ? completed : goal)));
      const nextStats = await goalsService.getCompletionStats(auth.token);
      setStats(nextStats);
    } catch (error) {
      console.error("Failed to complete goal:", error);
    } finally {
      setCompletingGoalId(null);
    }
  };

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          <div className="brand">Elevare</div>
          <nav className="sidebar-nav">
            <button className="nav-item active" type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-10h8V3h-8v8Z" />
              </svg>
            </button>
            <button className="nav-item" type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
              </svg>
            </button>
            <button className="nav-item" type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m19.14 12.94.86-1.49-.86-1.49-1.71-.29a5.84 5.84 0 0 0-.52-1.25l1-1.44-1.41-1.41-1.44 1a5.84 5.84 0 0 0-1.25-.52l-.29-1.71h-1.98l-.29 1.71a5.84 5.84 0 0 0-1.25.52l-1.44-1-1.41 1.41 1 1.44a5.84 5.84 0 0 0-.52 1.25l-1.71.29-.86 1.49.86 1.49 1.71.29c.12.43.3.85.52 1.25l-1 1.44 1.41 1.41 1.44-1c.4.22.82.4 1.25.52l.29 1.71h1.98l.29-1.71c.43-.12.85-.3 1.25-.52l1.44 1 1.41-1.41-1-1.44c.22-.4.4-.82.52-1.25l1.71-.29ZM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Z" />
              </svg>
            </button>
          </nav>
        </div>
        <button className="logout-btn" type="button" onClick={handleLogout}>
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

        {!loading && (
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

            {stats && (
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
                    <div className="metric-value">
                      {Math.round((stats.totalCompletions / Math.max(stats.totalGoals, 1)) * 100)}%
                    </div>
                    <div className="metric-label">Overall</div>
                  </div>
                </div>
              </section>
            )}

            {weeklyData.length > 0 && (
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
                              height: `${day.percentage}%`,
                            }}
                          />
                        </div>
                        <div className="growth-label">
                          {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {goals.length > 0 && (
              <section className="section-chapters">
                <h2 className="section-title">Active Chapters</h2>
                <div className="chapters-container">
                  {goals.map((goal, idx) => {
                    const completedToday = getTodayCompletion(goal);
                    return (
                      <article key={goal._id} className="chapter-card">
                        <div className="chapter-number">Chapter {idx + 1}</div>
                        <h3 className="chapter-title">{goal.title}</h3>
                        {goal.description && <p className="chapter-description">{goal.description}</p>}
                        <div className="chapter-progress">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${(goal.currentStreak / Math.max(goal.longestStreak, 1)) * 100 || 0}%`,
                              }}
                            />
                          </div>
                          <div className="progress-stats">
                            <span className="progress-current">{goal.currentStreak}</span>
                            <span className="progress-max">/ {goal.longestStreak}</span>
                          </div>
                        </div>
                        <div className="chapter-footer">
                          <span className="chapter-category">{goal.category}</span>
                          <button
                            type="button"
                            className={`chapter-action ${completedToday ? "done" : ""}`}
                            onClick={() => handleCompleteGoal(goal._id)}
                            disabled={completedToday || completingGoalId === goal._id}
                          >
                            {completedToday ? "✓" : completingGoalId === goal._id ? "..." : "+"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {goals.length === 0 && (
              <section className="section-empty">
                <p className="empty-message">Your chapters await. Begin your story.</p>
                <button type="button" className="btn-start">
                  Create First Chapter
                </button>
              </section>
            )}
          </main>
        )}

        {loading && (
          <div className="loading-screen">
            <div className="loading-spinner" />
            <p>Gathering your story...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
