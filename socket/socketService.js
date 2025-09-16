import jwt from "jsonwebtoken";
import { Server } from "socket.io";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Hold io instance so controllers can emit events
let ioInstance = null;

export function getIo() {
  return ioInstance;
}

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Adjust for production
      methods: ["GET", "POST"],
    },
  });

  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.tourist = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Tourist connected via WebSocket:", socket.tourist.id);

    // Regular emergency pings from socket: emit to authorities only (do not persist)
    socket.on("emergency:ping", async (data) => {
      try {
        const { latitude, longitude, accuracy, speed, timestamp } = data;

        // Do NOT persist emergency pings to DB per requirements.
        io.to("authorities").emit("emergency:update", {
          touristId: socket.tourist.id,
          latitude,
          longitude,
          accuracyMeters: accuracy,
          speedMps: speed,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        });
      } catch (err) {
        console.error("WebSocket emergency:ping error:", err);
      }
    });

    // Allows authority dashboards to join the 'authorities' room
    socket.on("join:authority", () => {
      socket.join("authorities");
    });
  });

  return io;
}
