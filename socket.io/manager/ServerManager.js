const Util = require('../Util');
const Room = require('../entity/Room');

const MAX_ROOM_MEMBER_COUNT = 200;

class ServerManager {
  constructor(io) {
    this.io = io;
    this.rooms = {};

    // 10秒おきにルームの状態をチェックする
    setInterval(() => {
      Object.values(this.rooms).forEach(room => this.checkRoomState(room));
    }, 10000);
  }

  registerClient(socket) {
    const { user } = socket;

    if (user.id === socket.roomId) {
      this.createRoom(socket);
    } else {
      this.joinRoom(socket);
    }

    socket.on('room_extend', (data, cb) => this.onRoomExtend(socket, data, cb));
    socket.on('room_emotion', (data, cb) => this.onRoomEmotion(socket, data, cb));
    socket.on('room_broadcast', (data, cb) => this.onRoomBroadcast(socket, data, cb));

    socket.on('disconnect', () => this.unregisterClient(socket));
  }

  unregisterClient(socket) {
    const { user } = socket;
    const { roomId } = user;
    socket.leave(roomId);

    if (this.rooms[roomId] === undefined) {
      return;
    }

    const room = this.rooms[roomId];
    room.delUser(user.id);
  }

  createRoom(socket) {
    const user = socket.user;
    const userId = user.id;

    socket.join(userId, () => {
      if (this.rooms[userId] !== undefined) {
        this.rooms[userId].setUser(user);
      } else {
        this.rooms[userId] = new Room(user);
      }

      user.roomId = userId;
      socket.emit('room_create', this.rooms[userId].getRoomParams());
    });
  }

  joinRoom(socket) {
    const user = socket.user;
    const roomId = socket.roomId;

    if (this.rooms[roomId] === undefined) {
      socket.emit('error', { reason: 'ROOM_NOT_IN_PLAY' });
      return;
    }
    const room = this.rooms[roomId];
    const isInRoom = (room.users[user.id] !== undefined);
    if (!isInRoom && room.getCurrentUserCount() >= MAX_ROOM_MEMBER_COUNT) {
      socket.emit('error', { reason: 'ROOM_MEMBER_COUNT_FULL' });
    }

    socket.join(roomId, () => {
      user.roomId = roomId;
      room.setUser(user);
      socket.emit('room_join', room.getRoomParams());
    });
  }

  onRoomEmotion(socket, data, cb) {
    const { user } = socket;
    const roomId = user.roomId;

    const check = this.checkRoom(roomId);
    if (check !== true) {
      cb(check);
      return;
    }
    if (!data.id) {
      return;
    }

    const room = this.rooms[roomId];
    room.addEmotion(data.id);
    const { emotionCountById } = room;
    this.io.to(roomId).emit('room_emotion', { id: data.id, emotionCountById });
  }

  checkRoom(roomId, roomMaster = null) {
    if (roomId === null) {
      return { result: false, reason: 'NOT_IN_ROOM' };
    }
    if (this.rooms[roomId] === undefined) {
      return { result: false, reason: 'ROOM_NOT_IN_PLAY' };
    }
    if (roomMaster === null) {
      return true;
    }
    if (roomId !== roomMaster.id) {
      return { result: false, reason: 'IS_NOT_ROOM_MASTER' };
    }

    return true;
  }

  onRoomExtend(socket, data, cb) {
    const { user } = socket;
    const { roomId } = user;

    const check = this.checkRoom(roomId, user);
    if (check !== true) {
      cb(check);
      return;
    }


    const extendTime = parseInt(data, 10);
    if (isNaN(extendTime)) {
      return;
    }

    const room = this.rooms[roomId];
    room.endTime += extendTime;
    const remainTime = room.endTime - Util.getTimestamp();
    this.io.to(roomId).emit('room_extend', { extendTime, remainTime });
  }

  onRoomBroadcast(socket, data, cb) {
    const { user } = socket;
    const { roomId } = user;

    const check = this.checkRoom(roomId, user);
    if (check !== true) {
      cb(check);
      return;
    }

    this.io.to(roomId).emit('room_broadcast', data);
    cb({ result: true });
  }

  checkRoomState(room) {
    const currentTime = Util.getTimestamp();
    if (currentTime > room.endTime) {
      return;
    }

    const roomId = room.id;
    Object.values(room.users).forEach(user => user.socket.leave(roomId));
    delete this.rooms[roomId];
  }
}

module.exports = ServerManager;
