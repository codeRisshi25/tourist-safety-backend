const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const db = require("./models/index.js");
const { sequelize } = db;

dotenv.config();

const app = express();

// Middleware to parse JSON bodies - MUST be before routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiRoutes = require('./routes/index.js');
app.use('/api', apiRoutes);


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
