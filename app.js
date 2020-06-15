var express = require("express");
var app = express();
var path = require("path");

const http = require("http").createServer(app);
const io = require("socket.io").listen(http);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("mousemove", function (data) {
    console.log("data", data);
    // This line sends the event (broadcasts it)
    // to everyone except the originating client.
    socket.broadcast.emit("moving", data);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

http.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
