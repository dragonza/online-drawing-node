var express = require('express');
var app = express();
var path = require('path');

const http = require('http').createServer(app);
const io = require('socket.io').listen(http)

app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + 'public/index.html');
// });

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
