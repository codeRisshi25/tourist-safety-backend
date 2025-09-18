import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import db from "./models/index.js";
const { sequelize } = db;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


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

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

export default app;
