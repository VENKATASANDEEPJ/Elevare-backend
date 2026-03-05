const mongoose = require("mongoose");
const Goal = require("../models/Goal");
const Notification = require("../models/Notification");
const { sendError, sendSuccess } = require("../utils/response");

const CATEGORIES = [
  "Coding",
  "Fitness",
  "Language",
  "Reading",
  "Health",
  "Productivity",
  "Other",
];

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getWeekKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
  return `${year}-W${week}`;
};

const getPreviousDateKey = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

const getPreviousWeekKey = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - 7);
  return getWeekKey(d);
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const parseTime = (value) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

const createGoal = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const {
      title,
      description,
      category,
      frequencyType = "daily",
      requiredCount = 1,
      targetDays = 30,
      reminderTime = "09:00",
      startDate,
    } = req.body || {};

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    if (typeof title !== "string" || !title.trim()) {
      return sendError(res, 400, "Title is required");
    }

    if (!CATEGORIES.includes(category)) {
      return sendError(res, 400, "Category is invalid");
    }

    if (!["daily", "weekly"].includes(frequencyType)) {
      return sendError(res, 400, "Frequency type must be daily or weekly");
    }

    if (!Number.isInteger(requiredCount) || requiredCount < 1) {
      return sendError(res, 400, "Required count must be a positive integer");
    }

    if (!Number.isInteger(targetDays) || targetDays < 1) {
      return sendError(res, 400, "Target days must be a positive integer");
    }

    if (typeof reminderTime !== "string" || !parseTime(reminderTime)) {
      return sendError(res, 400, "Reminder time must be HH:MM format");
    }

    const parsedStartDate = startDate ? new Date(startDate) : new Date();

    if (Number.isNaN(parsedStartDate.getTime())) {
      return sendError(res, 400, "Start date is invalid");
    }

    const goal = await Goal.create({
      user: userId,
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      category,
      frequencyType,
      requiredCount,
      targetDays,
      reminderTime,
      startDate: parsedStartDate,
      completionHistory: [],
    });

    return sendSuccess(res, 201, "Goal created", goal);
  } catch {
    return sendError(res, 500, "Failed to create goal");
  }
};

const getGoals = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const goals = await Goal.find({ user: userId }).sort({ createdAt: -1 });
    return sendSuccess(res, 200, "Goals fetched", goals);
  } catch {
    return sendError(res, 500, "Failed to fetch goals");
  }
};

const getGoalById = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const goalId = req.params.id;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!isValidObjectId(goalId)) {
      return sendError(res, 400, "Invalid goal id");
    }

    const goal = await Goal.findById(goalId);

    if (!goal) {
      return sendError(res, 404, "Goal not found");
    }

    if (goal.user.toString() !== userId.toString()) {
      return sendError(res, 403, "Not authorized");
    }

    return sendSuccess(res, 200, "Goal fetched", goal);
  } catch {
    return sendError(res, 500, "Failed to fetch goal");
  }
};

const updateGoal = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const goalId = req.params.id;
    const {
      title,
      description,
      category,
      frequencyType,
      requiredCount,
      targetDays,
      reminderTime,
      active,
    } = req.body || {};

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!isValidObjectId(goalId)) {
      return sendError(res, 400, "Invalid goal id");
    }

    const goal = await Goal.findById(goalId);

    if (!goal) {
      return sendError(res, 404, "Goal not found");
    }

    if (goal.user.toString() !== userId.toString()) {
      return sendError(res, 403, "Not authorized");
    }

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return sendError(res, 400, "Title must be a non-empty string");
      }
      goal.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return sendError(res, 400, "Description must be a string");
      }
      goal.description = description.trim();
    }

    if (category !== undefined) {
      if (!CATEGORIES.includes(category)) {
        return sendError(res, 400, "Category is invalid");
      }
      goal.category = category;
    }

    if (frequencyType !== undefined) {
      if (!["daily", "weekly"].includes(frequencyType)) {
        return sendError(res, 400, "Frequency type must be daily or weekly");
      }
      goal.frequencyType = frequencyType;
    }

    if (requiredCount !== undefined) {
      if (!Number.isInteger(requiredCount) || requiredCount < 1) {
        return sendError(res, 400, "Required count must be a positive integer");
      }
      goal.requiredCount = requiredCount;
    }

    if (targetDays !== undefined) {
      if (!Number.isInteger(targetDays) || targetDays < 1) {
        return sendError(res, 400, "Target days must be a positive integer");
      }
      goal.targetDays = targetDays;
    }

    if (reminderTime !== undefined) {
      if (typeof reminderTime !== "string" || !parseTime(reminderTime)) {
        return sendError(res, 400, "Reminder time must be HH:MM format");
      }
      goal.reminderTime = reminderTime;
    }

    if (active !== undefined) {
      if (typeof active !== "boolean") {
        return sendError(res, 400, "Active must be a boolean");
      }
      goal.active = active;
    }

    await goal.save();
    return sendSuccess(res, 200, "Goal updated", goal);
  } catch {
    return sendError(res, 500, "Failed to update goal");
  }
};

const deleteGoal = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const goalId = req.params.id;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!isValidObjectId(goalId)) {
      return sendError(res, 400, "Invalid goal id");
    }

    const goal = await Goal.findById(goalId);

    if (!goal) {
      return sendError(res, 404, "Goal not found");
    }

    if (goal.user.toString() !== userId.toString()) {
      return sendError(res, 403, "Not authorized");
    }

    await goal.deleteOne();
    return sendSuccess(res, 200, "Goal deleted");
  } catch {
    return sendError(res, 500, "Failed to delete goal");
  }
};

const completeGoal = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const goalId = req.params.id;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!isValidObjectId(goalId)) {
      return sendError(res, 400, "Invalid goal id");
    }

    const goal = await Goal.findOne({ _id: goalId, user: userId });

    if (!goal) {
      return sendError(res, 404, "Goal not found");
    }

    const today = normalizeDate(new Date());
    const currentPeriodKey =
      goal.frequencyType === "daily" ? today.toISOString().split("T")[0] : getWeekKey(today);

    if (goal.lastPeriodKey === currentPeriodKey) {
      return sendError(res, 400, "Already completed for this period");
    }

    if (goal.lastPeriodKey) {
      const expectedPreviousPeriod =
        goal.frequencyType === "daily" ? getPreviousDateKey(today) : getPreviousWeekKey(today);

      if (goal.lastPeriodKey !== expectedPreviousPeriod) {
        goal.currentStreak = 0;
      }
    }

    goal.completionHistory.push({
      date: today,
      completed: true,
    });

    let completionCount = 0;

    if (goal.frequencyType === "daily") {
      completionCount = 1;
    } else {
      completionCount = goal.completionHistory.filter((entry) => {
        return getWeekKey(entry.date) === currentPeriodKey;
      }).length;
    }

    if (completionCount >= goal.requiredCount) {
      goal.currentStreak += 1;

      if (goal.currentStreak > goal.longestStreak) {
        goal.longestStreak = goal.currentStreak;
      }

      goal.lastPeriodKey = currentPeriodKey;
    }

    await goal.save();

    if (goal.currentStreak > 0 && goal.currentStreak % 7 === 0) {
      await Notification.create({
        user: userId,
        goal: goal._id,
        message: `${goal.currentStreak}-day streak on \"${goal.title}\"`,
        type: "milestone",
      });
    }

    return sendSuccess(res, 200, "Goal completion recorded", goal);
  } catch {
    return sendError(res, 500, "Failed to complete goal");
  }
};

const getCompletionStats = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const goals = await Goal.find({ user: userId });

    const totalGoals = goals.length;
    const activeGoals = goals.filter((g) => g.active).length;

    let totalCompletions = 0;
    let thisMonthCompletions = 0;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    goals.forEach((goal) => {
      totalCompletions += goal.completionHistory.filter((c) => c.completed).length;

      thisMonthCompletions += goal.completionHistory.filter((c) => {
        const cDate = new Date(c.date);
        return c.completed && cDate >= monthStart;
      }).length;
    });

    const highestStreak = Math.max(...goals.map((g) => g.longestStreak || 0), 0);

    return sendSuccess(res, 200, "Completion stats fetched", {
      totalGoals,
      activeGoals,
      totalCompletions,
      thisMonthCompletions,
      highestStreak,
    });
  } catch {
    return sendError(res, 500, "Failed to fetch stats");
  }
};

const getWeeklyProgress = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const goals = await Goal.find({ user: userId, active: true });
    const weekData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      let completedCount = 0;
      const total = goals.length;

      goals.forEach((goal) => {
        const completed = goal.completionHistory.find((entry) => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === date.getTime() && entry.completed;
        });

        if (completed) {
          completedCount += 1;
        }
      });

      weekData.push({
        date: date.toISOString().split("T")[0],
        completed: completedCount,
        total,
        percentage: total === 0 ? 0 : Math.round((completedCount / total) * 100),
      });
    }

    return sendSuccess(res, 200, "Weekly progress fetched", weekData);
  } catch {
    return sendError(res, 500, "Failed to fetch weekly progress");
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  completeGoal,
  getCompletionStats,
  getWeeklyProgress,
};
