const express = require('express');
const http = require('http');
const cors = require('cors')
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => { 
       
    const users = [];

    for (let [id, socket] of io.of("/").sockets) {
        
        users.push({
            user_id: id,
            username: socket?.handshake?.auth?.username,
            avatar: socket?.handshake?.auth?.avatar,
        });
    };
    
    socket.emit("users", users);

    socket.broadcast.emit("user connected", {
        users: users,
    });

    socket.on("message", ({ content, to, time }) => {
        
        socket.to(to).emit("message", {
          content,
          from: socket.id,
          time: time,
          msg_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        });
    });

    socket.on('disconnect', function() {
      console.log(users, 'disconnect');
     });

});




server.listen(8000, () => {
  console.log('listening on *:8000');
});

