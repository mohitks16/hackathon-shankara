import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import db from "./db/db_config.js";


const app = express();
app.use(cors());
app.use(express.json());

// database 

db()

// Mount all routes
app.use("/", routes);



// 404 handler - return JSON instead of default Express HTML 404
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
    method: req.method,
    hint: "Try GET / or GET /health for available endpoints",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
