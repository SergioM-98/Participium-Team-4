import { createServer } from "node:http";
import { Server } from "socket.io";

const PORT = process.env.WS_PORT ? Number.parseInt(process.env.WS_PORT) : 4000;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", (roomId: string) => {
    socket.join(roomId);
  });

  socket.on("chat-message", (data) => {
    io.to(data.roomId).emit("chat-message", data.message);
  });

  socket.on("internal-note", (data) => {
    io.to(data.roomId).emit("internal-note", data.note);
  });

  socket.on("disconnect", () => {});
});

httpServer.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
