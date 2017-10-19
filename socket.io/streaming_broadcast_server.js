const Https = require('https');
const fs = require('fs');
const SocketIO = require('socket.io');

const StreamingServer = require('./manager/StreamingServer');

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

const server = new StreamingServer(io);

const authenticate = (clientSocket, next) => {
  // この辺でユーザー認証
  clientSocket.userId = clientSocket.handshake.query.id;
  next();
};

io.use(authenticate);
io.on('connection', (socket) => {
  server.registerClient(socket);
});
