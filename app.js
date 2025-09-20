const dotenv = require("dotenv");
dotenv.config();

const { Client } = require('pg');
Client.prototype.family = 4;

const cors = require("cors");
const express = require("express");
const cookieParser = require('cookie-parser');
const db = require("./models/index.js");
const { sequelize } = db;

const app = express();

// Middleware to parse JSON bodies - MUST be before routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const apiRoutes = require('./routes/index.js');
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");

app.use('/api', apiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something broke!" });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).send({ error: "Not Found" });
});

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = app;
