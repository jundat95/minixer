import SocketIO from 'socket.io-client';

import FromServer from '../FromServer';

const { user } = FromServer;
const url = FromServer.socket_io_url;

class SocketService {
  constructor() {
    let query = '';
    if (user !== null) {
      query = `userId=${user.id}&token=${user.token}&name=${user.name}`;
    } else {
      query = `guestId=${FromServer.guest_id}`;
    }

    this.socket = SocketIO.connect(
      url,
      {
        autoConnect: true,
        reconnection: true,
        query,
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
