import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import { initializeSocket } from "./socket/socketService.js";
import { sequelize } from "./models";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/location", locationRoutes);
app.use("/api/emergency", emergencyRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).send({ error: "Not Found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something broke!" });
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
    const httpServer = http.createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

export default app;
