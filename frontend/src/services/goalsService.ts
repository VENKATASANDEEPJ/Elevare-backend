import { apiRequest } from "./apiClient";

export interface GoalCompletionEntry {
  date: string;
  completed: boolean;
}

export interface Goal {
  _id: string;
  title: string;
  description?: string;
  category: string;
  currentStreak: number;
  longestStreak: number;
  completionHistory: GoalCompletionEntry[];
  frequencyType: "daily" | "weekly";
  requiredCount: number;
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  category: "Coding" | "Fitness" | "Language" | "Reading" | "Health" | "Productivity" | "Other";
  frequencyType: "daily" | "weekly";
  requiredCount: number;
  startDate?: string;
  targetDays?: number;
  reminderTime?: string;
}

export interface UpdateGoalPayload {
  title?: string;
  description?: string;
  category?: CreateGoalPayload["category"];
  frequencyType?: "daily" | "weekly";
  requiredCount?: number;
  active?: boolean;
}

export interface GoalStats {
  totalGoals: number;
  activeGoals: number;
  totalCompletions: number;
  thisMonthCompletions: number;
  highestStreak: number;
}

export interface WeeklyProgressItem {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

const goalsService = {
  getAllGoals(token?: string) {
    return apiRequest<Goal[]>("/goals", {
      method: "GET",
      token,
    });
  },

  getGoalById(goalId: string, token?: string) {
    return apiRequest<Goal>(`/goals/${goalId}`, {
      method: "GET",
      token,
    });
  },

  createGoal(goalPayload: CreateGoalPayload, token?: string) {
    return apiRequest<Goal>("/goals", {
      method: "POST",
      token,
      body: JSON.stringify(goalPayload),
    });
  },

  updateGoal(goalId: string, updates: UpdateGoalPayload, token?: string) {
    return apiRequest<Goal>(`/goals/${goalId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(updates),
    });
  },

  deleteGoal(goalId: string, token?: string) {
    return apiRequest<{ message: string }>(`/goals/${goalId}`, {
      method: "DELETE",
      token,
    });
  },

  completeGoal(goalId: string, token?: string) {
    return apiRequest<Goal>(`/goals/${goalId}/complete`, {
      method: "POST",
      token,
    });
  },

  getCompletionStats(token?: string) {
    return apiRequest<GoalStats>("/goals/stats/completion", {
      method: "GET",
      token,
    });
  },

  getWeeklyProgress(token?: string) {
    return apiRequest<WeeklyProgressItem[]>("/goals/stats/weekly", {
      method: "GET",
      token,
    });
  },
};

export default goalsService;
