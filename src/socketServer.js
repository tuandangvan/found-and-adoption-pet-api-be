import { Server } from "socket.io";
const socketServer = (server) => {
  const io = new Server(server, { cors: "https://localhost:8050" });
  console.log("Running socket!");
  let onlineUsers = [];
  // Lắng nghe kết nối từ các client
  io.on("connection", (socket) => {
    console.log("A client connected");
    socket.on("addNewUser", (data) => {
      !onlineUsers.some((user) => data.userId === user.userId) &&
        onlineUsers.push({
          userId: data.userId,
          socketId: socket.id
        });
      console.log("localUser", onlineUsers);
      io.emit("getOnlineUsers", onlineUsers);
    });

    // Lắng nghe sự kiện 'comment' từ client
    socket.on("comment", (data) => {
      console.log("New comment:", data);
      console.log("localUser", onlineUsers);

      // Phát sự kiện 'comment' đến tất cả các client kết nối
      io.emit("comment", data);
    });

    // Xử lý sự kiện khi client disconnect
    socket.on("disconnect", () => {
      console.log("A client disconnected");
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      io.emit("getOnlineUsers", onlineUsers);
      console.log("localUser", onlineUsers);
    });
  });
};

module.exports = socketServer;
