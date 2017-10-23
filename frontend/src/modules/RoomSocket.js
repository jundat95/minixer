import SocketIO from 'socket.io-client';

import FromServer from '../FromServer';

const user = FromServer.user;
const roomId = FromServer.room_id;

const socket = SocketIO.connect(
  'https://192.168.101.21:9999',
  {
    autoConnect: false,
    reconnection: true,
    query: `id=${user.id}&token=${user.token}&room_id=${roomId}`,
  }
);
