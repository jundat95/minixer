const Https = require('https');
const fs = require('fs');
const SocketIO = require('socket.io');

const httpsServer = Https.createServer({
  key: fs.readFileSync('/etc/ssl/private/localhost.key').toString(),
  cert: fs.readFileSync('/etc/ssl/certs/localhost.crt').toString(),
});
httpsServer.listen(9999, '0.0.0.0');
const io = SocketIO.listen(
  httpsServer,
  {
    pingInterval: 5000,
    pingTimeout: 11000,
  }
);

const sockets = {};

const authenticate = (clientSocket, next) => {
  const id = clientSocket.handshake.query.id;
  // この辺でユーザー認証
  clientSocket.id = id;
  next();
};

io.use(authenticate);
io.on('connection', (socket) => {
  if (socket.id) {
    if (sockets[socket.id]) {
      sockets[socket.id].disconnect();
    }
    sockets[socket.id] = socket;
  }
  console.log('connection : ' + socket.id);

  socket.on('audio_buffer', (data, cb) => {
    if (typeof cb === 'function') {
      cb({ result: true });
    }
    io.sockets.emit('audio_buffer', data);
  });

  socket.on('broadcast_test', (data, cb) => {
    if (typeof cb === 'function') {
      cb({ result: true });
    }
    io.sockets.emit('broadcast_test', data);
  });
});
