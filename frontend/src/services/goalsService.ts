const API_URL = "http://localhost:5000/api/goals";

const goalsService = {
  async getAllGoals(token: string) {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch goals");
    return response.json();
  },

  async createGoal(
    token: string,
    goal: {
      title: string;
      description: string;
      category: string;
      targetDays: number;
      reminderTime?: string;
    }
  ) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(goal),
    });
    if (!response.ok) throw new Error("Failed to create goal");
    return response.json();
  },

  async updateGoal(
    token: string,
    goalId: string,
    updates: Record<string, unknown>
  ) {
    const response = await fetch(`${API_URL}/${goalId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update goal");
    return response.json();
  },

  async deleteGoal(token: string, goalId: string) {
    const response = await fetch(`${API_URL}/${goalId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete goal");
    return response.json();
  },

  async completeGoalToday(token: string, goalId: string) {
    const response = await fetch(`${API_URL}/${goalId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to complete goal");
    return response.json();
  },

  async getCompletionStats(token: string) {
    const response = await fetch(`${API_URL}/stats/completion`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch completion stats");
    return response.json();
  },

  async getWeeklyProgress(token: string) {
    const response = await fetch(`${API_URL}/stats/weekly`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch weekly progress");
    return response.json();
  },
};

export default goalsService;
