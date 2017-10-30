import SocketIO from 'socket.io-client';

import FromServer from '../FromServer';

const user = FromServer.user;
const url = FromServer.socket_io_url;

class SocketService {
  constructor() {
    this.socket = SocketIO.connect(
      url,
      {
        autoConnect: true,
        reconnection: true,
        query: `userId=${user.id}&token=${user.token}&name=${user.name}`,
      }
    );
  }

  connect() {
    this.socket.open();
  }

  on(type, cb) {
    this.socket.on(type, cb);
  }

  emit(type, data, cb) {
    this.socket.emit(type, data, cb);
  }

  disconnect() {
    this.socket.close();
  }
}

export default new SocketService();
