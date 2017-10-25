const Https = require('https');
const fs = require('fs');
const SocketIO = require('socket.io');
const Request = require('request');

const User = require('./entity/User');
const ServerManager = require('./manager/ServerManager');
const Util = require('./Util');

const config = Util.getConfig();

const httpsServer = Https.createServer({
  key: fs.readFileSync('/etc/ssl/private/localhost.key').toString(),
  cert: fs.readFileSync('/etc/ssl/certs/localhost.crt').toString(),
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

const server = new ServerManager(io);

const authenticate = (clientSocket, next) => {
  // この辺でユーザー認証
  const { userId, name, roomId, token } = clientSocket.handshake.query;

  const host = config.api_host;
  if (host.indexOf('dev.minixer.net') !== -1) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  const query = `${host}/api/authenticate?user_id=${userId}&token=${token}`;
  Request(query, (error, response, body) => {
    const data = body !== undefined ? JSON.parse(body) : null;
    if (!data || !data.result) {
      console.error(`detect invalid user access, ${userId}, ${token}`);
      next(new Error('authentication failed'));
      return;
    }

    console.log(`connected, ${userId}, ${name}, ${token}`);
    const isAdminUser = data.is_admin_user;
    clientSocket.user = new User(userId, name, clientSocket, isAdminUser);
    clientSocket.apiServerToken = token;
    clientSocket.roomId = roomId;
    next();
  });
};

io.use(authenticate);
io.on('connection', (socket) => {
  server.registerClient(socket);
});
