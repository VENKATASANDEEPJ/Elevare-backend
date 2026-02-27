const Goal = require("../models/Goal");
const User = require("../models/User");
const Notification = require("../models/Notification");

// CREATE GOAL
const createGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, category, targetDays, reminderTime } = req.body;

    const goal = await Goal.create({
      user: userId,
      title,
      description,
      category,
      targetDays,
      reminderTime,
      startDate: new Date(),
      completionHistory: [],
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: "Failed to create goal" });
  }
};

// GET ALL GOALS FOR USER
const getGoals = async (req, res) => {
  try {
    const userId = req.user.userId;
    const goals = await Goal.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

// GET SINGLE GOAL
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.user.toString() !== req.user.userId.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goal" });
  }
};

// UPDATE GOAL
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.user.toString() !== req.user.userId.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { title, description, category, targetDays, reminderTime, active } = req.body;

    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (category) goal.category = category;
    if (targetDays) goal.targetDays = targetDays;
    if (reminderTime) goal.reminderTime = reminderTime;
    if (active !== undefined) goal.active = active;

    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ error: "Failed to update goal" });
  }
};

// DELETE GOAL
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.user.toString() !== req.user.userId.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await goal.deleteOne();
    res.status(200).json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete goal" });
  }
};

// MARK GOAL COMPLETE FOR TODAY
const completeGoalToday = async (req, res) => {
  try {
    const userId = req.user.userId;
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.user.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already completed today
    const completedToday = goal.completionHistory.find((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (completedToday && completedToday.completed) {
      return res.status(400).json({ message: "Goal already completed today" });
    }

    // Add completion entry
    goal.completionHistory.push({
      date: today,
      completed: true,
    });

    // Calculate streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const completedYesterday = goal.completionHistory.find((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === yesterday.getTime() && entry.completed;
    });

    if (completedYesterday) {
      goal.currentStreak += 1;
    } else {
      goal.currentStreak = 1;
    }

    if (goal.currentStreak > goal.longestStreak) {
      goal.longestStreak = goal.currentStreak;
    }

    await goal.save();

    // Create notification for milestone
    if (goal.currentStreak % 7 === 0) {
      await Notification.create({
        user: userId,
        goal: goal._id,
        message: `🔥 ${goal.currentStreak}-day streak on "${goal.title}"!`,
        type: "milestone",
      });
    }

    res.status(200).json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to complete goal" });
  }
};

// GET COMPLETION STATS
const getCompletionStats = async (req, res) => {
  try {
    const userId = req.user.userId;
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

    const highestStreak = Math.max(...goals.map((g) => g.longestStreak), 0);

    res.status(200).json({
      totalGoals,
      activeGoals,
      totalCompletions,
      thisMonthCompletions,
      highestStreak,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// GET WEEKLY PROGRESS
const getWeeklyProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const goals = await Goal.find({ user: userId, active: true });

    const weekData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      let completedCount = 0;
      const totalGoals = goals.length;

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
        total: totalGoals,
        percentage: totalGoals === 0 ? 0 : Math.round((completedCount / totalGoals) * 100),
      });
    }

    res.status(200).json(weekData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weekly progress" });
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  completeGoalToday,
  getCompletionStats,
  getWeeklyProgress,
};
