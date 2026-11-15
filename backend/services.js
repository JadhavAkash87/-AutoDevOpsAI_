
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AutoDevOpsAI Services API is running!",
    services: [
      { id: 1, name: "AI Career Assistant" },
      { id: 2, name: "Job Search" },
      { id: 3, name: "Resume Builder" },
      { id: 4, name: "Skill Development" },
      { id: 5, name: "Application Tracker" }
    ]
  });
});

module.exports = router;
