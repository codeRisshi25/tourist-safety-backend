import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import { initializeSocket } from "./socket/socketService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount new routers
app.use("/api/location", locationRoutes);
app.use("/api/emergency", emergencyRoutes);

// Optionally keep the old routes if needed
// import routes from './routes/index.js';
// app.use('/api', routes);

const httpServer = http.createServer(app);
initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
