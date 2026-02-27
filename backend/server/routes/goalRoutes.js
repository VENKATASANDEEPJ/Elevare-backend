const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  completeGoalToday,
  getCompletionStats,
  getWeeklyProgress,
} = require("../controllers/goalController");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Goal CRUD routes
router.post("/", createGoal);
router.get("/", getGoals);
router.get("/stats/completion", getCompletionStats);
router.get("/stats/weekly", getWeeklyProgress);
router.get("/:id", getGoalById);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

// Streak tracking route
router.post("/:id/complete", completeGoalToday);

module.exports = router;
