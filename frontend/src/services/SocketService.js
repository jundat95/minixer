import SocketIO from 'socket.io-client';

import FromServer from '../FromServer';

const user = FromServer.user;
const roomId = FromServer.room_id;
const url = FromServer.socket_io_url;

class SocketService {
  constructor() {
    this.socket = SocketIO.connect(
      url,
      {
        autoConnect: false,
        reconnection: false,
        query: `userId=${user.id}&token=${user.token}&name=${user.name}&roomId=${roomId}`,
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
