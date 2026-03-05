const express = require("express");
const protect = require("../middleware/authMiddleware");
const goalController = require("../controllers/goalController");

const router = express.Router();

router.use(protect);

router.post("/", goalController.createGoal);
router.get("/", goalController.getGoals);
router.get("/stats/completion", goalController.getCompletionStats);
router.get("/stats/weekly", goalController.getWeeklyProgress);
router.get("/:id", goalController.getGoalById);
router.put("/:id", goalController.updateGoal);
router.delete("/:id", goalController.deleteGoal);
router.post("/:id/complete", goalController.completeGoal);

module.exports = router;
