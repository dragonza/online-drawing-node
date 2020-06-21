var express = require("express");
var app = express();
var path = require("path");
const PORT = process.env.port || 3000;
const http = require("http").createServer(app);
const io = require("socket.io").listen(http);

app.use(express.static(path.join(__dirname, "public")));
let onlineUsers = [];
io.on("connection", (socket) => {
  let currentUser = "";
  socket.on("newUser", function ({ id }) {
    currentUser = id;
    onlineUsers.push(id);
    console.log(currentUser + " connected");
  });

  socket.on("mousemove", function (data) {
    // This line sends the event (broadcasts it)
    // to everyone except the originating client.
    socket.broadcast.emit("moving", data);
  });
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((id) => id !== currentUser);
    console.log(currentUser + " disconnected");
    socket.broadcast.emit("disconnected", currentUser);
  });
});

http.listen(PORT, () => {
  console.log("listening on " + PORT);
});
