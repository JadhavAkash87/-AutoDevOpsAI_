  const express = require("express");
  const path = require("path");
  const cors = require("cors");
  require("dotenv").config();

  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "html")));
  app.use("/api/services", require("./services"));
  app.use("/api/users", require("./users"));
  console.log("Users route loaded");
  app.get("/api/services", (req, res) => {
    res.json({
      success: true,
      message: "AutoDevOpsAI Services API is running!",
      services: ["AI Career Assistant", "Job Search", "Resume Builder"]
    });
  });
  app.get("/api/health", async (req, res) => {
    const { Pool } = require("pg");

    const pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),

          user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    try {
      const result = await pool.query("SELECT NOW()");
      res.json({
        success: true,
        message: "Database connected successfully!",
        time: result.rows[0].now
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: error.message
      });
    } finally {
      await pool.end();
    }
  });

  app.get("/", (req, res) => {
    res.json({
      message: "AutoDevOpsAI Backend is running!",
      status: "success"
    });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // AutoDevOps AI - Improved Live Job Search API
  app.get("/api/jobs", async (req, res) => {
    try {
      const keyword = String(req.query.q || "").trim();

      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: "Please enter a job title or skill."
        });
      }

      const apiUrl = new URL("https://himalayas.app/jobs/api/search");
      apiUrl.searchParams.set("q", keyword);
      apiUrl.searchParams.set("page", "1");
      apiUrl.searchParams.set("sort", "recent");

      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        return res.status(502).json({
          success: false,
          message: "Live Jobs API request failed.",
          upstreamStatus: response.status
        });
      }

      const data = await response.json();

      const jobs = (data.jobs || []).map(job => ({
        id: job.id || job.slug || null,
        title: job.title || "Job Title Not Available",
        company:
          job.companyName ||
          job.company?.name ||
          "Company Not Available",
        location:
          job.location ||
          job.locationRestrictions?.join(", ") ||
          "Location Not Specified",
        description:
          job.description ||
          job.excerpt ||
          "Description Not Available",
        salary:
          job.salary ||
          job.salaryRange ||
          "Not specified",
        experience:
          job.experience ||
          job.experienceLevel ||
          "Not specified",
        jobType:
          job.employmentType ||
          job.type ||
          "Not specified",
        postedDate:
          job.pubDate ||
          job.publishedAt ||
          "Not specified",
        applyLink:
          job.applicationLink ||
          job.applicationUrl ||
          job.url ||
          "",
        source: "Himalayas",
        sourceLink: "https://himalayas.app"
      }));

      res.json({
        success: true,
        keyword,
        total: jobs.length,
        source: "Himalayas",
        jobs
      });

    } catch (error) {
      console.error("Live Job Search Error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to fetch live jobs."
      });
    }
  });
