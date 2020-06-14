window.onload = function() {
  console.log('ello')

  if(!('getContext' in document.createElement('canvas'))){
    alert('Sorry, it looks like your browser does not support canvas!');
    return false;
  }

  const canvas = document.getElementById('paper')
  const url = 'http://localhost:8080';
  const id = Math.round(Date.now()*Math.random());
console.log('id', id);
  const socket = io(url);
  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
}
