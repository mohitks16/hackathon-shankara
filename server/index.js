import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
// #region agent log
fetch('http://127.0.0.1:7542/ingest/ae9920c6-98d1-43cb-a31f-25abc51be2c0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b588c2'},body:JSON.stringify({sessionId:'b588c2',location:'index.js:after-routes',message:'all imports loaded',data:{port:!!process.env.PORT,token:!!process.env.GITHUB_TOKEN},hypothesisId:'H2',timestamp:Date.now()})}).catch(()=>{});
// #endregion

const app = express();
app.use(cors());
app.use(express.json());

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
