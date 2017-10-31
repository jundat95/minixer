const ApiManager = require('./ApiManager');

class ServerManager {
  constructor(io) {
    this.io = io;
  }

  registerClient(socket) {
    socket.on('room_create', (data, cb) => this.onRoomCreate(socket, data, cb));
    socket.on('room_join', (data, cb) => this.onRoomJoin(socket, data, cb));
    socket.on('disconnect', () => this.unregisterClient(socket));

    const { user } = socket;
    if (user.isAdminUser) {
      socket.on('room_terminate', (data, cb) => this.onRoomTerminate(socket, data, cb));
    }

    socket.emit('connected_minixer', {
      userId: user.id,
      token: user.token,
      roomId: user.roomId,
      isAdminUser: user.isAdminUser,
    });
  }

  unregisterClient(socket) {
    const { user } = socket;

    if (user.roomId && user.roomId !== user.id) {
      ApiManager.roomLeave(user.id, user.token, user.roomId, (response) => {
        console.info(`room leaved: ${user.id} -> ${user.roomId}`);
        const responseData = response.data;
        socket.to(user.roomId).emit('room_leaved', responseData);
      });
    }
  }

  onRoomCreate(socket, data, cb) {
    const { user } = socket;
    const userId = user.id;
    const token = user.token;

    ApiManager.roomCreate(userId, token, (response) => {
      if (!response.result) {
        cb({ result: false });
        return;
      }

      const responseData = response.data;
      const roomId = responseData.room.id;
      socket.join(roomId, () => {
        user.roomId = roomId;
        socket.emit('room_join', responseData);
      });

      socket.on('room_broadcast', (data2, cb2) => this.onRoomBroadcast(socket, data2, cb2));
      socket.on('room_extend', (data2, cb2) => this.onRoomExtend(socket, data2, cb2));
      socket.on('room_finish', (data2, cb2) => this.onRoomFinish(socket, data2, cb2));
    });
  }

  onRoomJoin(socket, data, cb) {
    const { user } = socket;
    const userId = user.id;
    const token = user.token;
    const roomId = data.roomId;

    ApiManager.roomJoin(userId, token, roomId, (response) => {
      if (!response.result) {
        const message = response.data !== undefined ? response.data.message : null;
        cb({ result: false, message });
        return;
      }

      const responseData = response.data;
      socket.join(roomId, () => {
        user.roomId = roomId;
        socket.emit('room_join', responseData);
        socket.to(roomId).emit('room_joined', responseData);
        console.info(`room joined: ${user.id} -> ${roomId}`);
      });

      socket.on('room_emotion', (data2, cb2) => this.onRoomEmotion(socket, data2, cb2));
    });
  }

  onRoomEmotion(socket, data, cb) {
    const { user } = socket;
    const roomId = user.roomId;
    if (typeof cb !== 'function') {
      return;
    }

    ApiManager.roomEmotion(user.id, user.token, roomId, data.id, (response) => {
      if (!response.result) {
        cb({ result: false });
        return;
      }

      const responseData = response.data;
      this.io.to(roomId).emit('room_emotion', responseData);
    });
  }

  onRoomExtend(socket, data, cb) {
    const { user } = socket;
    const { roomId } = user;
    if (typeof cb !== 'function') {
      return;
    }

    ApiManager.roomExtend(user.id, user.token, data.count, (response) => {
      if (!response.result) {
        cb({ result: false });
        return;
      }

      const responseData = response.data;
      this.io.to(roomId).emit('room_extend', responseData);
    });
  }

  onRoomBroadcast(socket, data, cb) {
    const { user } = socket;
    const { roomId } = user;
    if (typeof cb !== 'function') {
      return;
    }

    this.io.to(roomId).emit('room_broadcast', { payload: data });
  }

  onRoomFinish(socket, data, cb) {
    const { user } = socket;
    const { roomId } = user;
    if (typeof cb !== 'function') {
      return;
    }

    ApiManager.roomClose(user.id, user.token, (response) => {
      if (!response.result) {
        cb({ result: false });
        return;
      }

      this.io.to(roomId).emit('room_end');
    });
  }

  onRoomTerminate(socket, data, cb) {
    if (typeof cb !== 'function') {
      return;
    }
    const { id } = data;
    const { user } = socket;

    ApiManager.roomTerminate(user.id, user.token, id, (response) => {
      if (!response.result) {
        cb({ result: false });
        return;
      }

      this.io.to(id).emit('room_terminate');
    });
  }
}

module.exports = ServerManager;
