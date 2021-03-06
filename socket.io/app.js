const Https = require('https');
const fs = require('fs');
const SocketIO = require('socket.io');
const SocketIORedis = require('socket.io-redis');

const User = require('./entity/User');
const ServerManager = require('./manager/ServerManager');
const Util = require('./Util');
const ApiManager = require('./manager/ApiManager');

const config = Util.getConfig();

const httpsServer = Https.createServer({
  key: fs.readFileSync(config.ssl_key_file).toString(),
  cert: fs.readFileSync(config.ssl_cert_file).toString(),
});
httpsServer.listen(config.server_port, '0.0.0.0');
const io = SocketIO.listen(
  httpsServer,
  {
    reconnect: false,
    pingTimeout: 15000,
    pingInterval: 5000,
  }
);
io.adapter(SocketIORedis({ host: '127.0.0.1', port: 6379 }));

const server = new ServerManager(io);

const authenticate = (clientSocket, next) => {
  const { userId, token, guestId } = clientSocket.handshake.query;

  const host = config.api_host;
  if (host.indexOf('dev.minixer.net') !== -1) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  if (userId) {
    ApiManager.roomUser(
      userId,
      token,
      (data) => {
        if (!data.result) {
          console.error(`detect invalid user access, ${userId}, ${token}`);
          next(new Error('authentication failed'));
          return;
        }

        console.info(`connected, ${userId}, ${token}`);
        const isAdminUser = data.is_admin_user || false;
        const roomId = data.room_id;
        clientSocket.user = new User(userId, token, clientSocket, isAdminUser, roomId);
        next();
      }
    );
  } else {
    console.info(`connected guest, ${guestId}`);
    clientSocket.user = new User(guestId, '', clientSocket, false, null);
    clientSocket.user.setGuest();
    next();
  }
};

io.use(authenticate);
io.on('connection', (socket) => {
  server.registerClient(socket);
});
