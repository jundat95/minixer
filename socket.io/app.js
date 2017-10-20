const Https = require('https');
const fs = require('fs');
const SocketIO = require('socket.io');

const User = require('./entity/User');
const ServerManager = require('./manager/ServerManager');

const httpsServer = Https.createServer({
  key: fs.readFileSync('/etc/ssl/private/localhost.key').toString(),
  cert: fs.readFileSync('/etc/ssl/certs/localhost.crt').toString(),
});
httpsServer.listen(9999, '0.0.0.0');
const io = SocketIO.listen(
  httpsServer,
  {
    reconnect: false,
    pingTimeout: 15000,
    pingInterval: 5000,
  }
);

const server = new ServerManager(io);

const authenticate = (clientSocket, next) => {
  // この辺でユーザー認証
  const { userId, roomId } = clientSocket.handshake.query;
  clientSocket.user = new User(userId, clientSocket);
  clientSocket.roomId = roomId;
  next();
};

io.use(authenticate);
io.on('connection', (socket) => {
  server.registerClient(socket);
});
