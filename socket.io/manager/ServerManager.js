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
    socket.on('room_finish', (data, cb) => this.onRoomFinish(socket, data, cb));

    if (user.isAdminUser) {
      socket.on('room_terminate', (data, cb) => this.onRoomTerminate(socket, data, cb));
    }

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

    const roomCount = Object.keys(this.rooms).length;
    const config = Util.getConfig();
    if (roomCount >= config.max_room_count) {
      socket.emit('error', { reason: 'ROOM_COUNT_FULL' });
      return;
    }

    socket.join(userId, () => {
      if (this.rooms[userId] !== undefined) {
        this.rooms[userId].setUser(user);
      } else {
        this.rooms[userId] = new Room(user);
      }

      user.roomId = userId;
      socket.emit('room_join', this.rooms[userId].getRoomParams());
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
      return;
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
    if (typeof cb !== 'function') {
      return;
    }

    const check = this.checkRoom(roomId);
    if (check !== true) {
      cb(check);
      return;
    }
    if (!data.id) {
      cb({ result: false, reason: 'INVALID_PARAMETER' });
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
    if (typeof cb !== 'function') {
      return;
    }

    const check = this.checkRoom(roomId, user);
    if (check !== true) {
      cb(check);
      return;
    }

    const room = this.rooms[roomId];
    const extendTime = parseInt(data.time, 10);
    if (isNaN(extendTime)) {
      cb({ result: false, reason: 'INVALID_PARAMETER' });
      return;
    }
    if (extendTime > 3600 * 6) {
      cb({ result: false, reason: 'EXTEND_TIME_TOO_LONG' });
      return;
    }
    if (room.isExtended) {
      cb({ result: false, reason: 'ALREADY_EXTENDED' });
      return;
    }

    room.endTime += extendTime;
    room.isExtended = true;
    const remainTime = room.endTime - Util.getTimestamp();
    this.io.to(roomId).emit('room_extend', { extendTime, remainTime });
    cb({ result: true });
  }

  onRoomBroadcast(socket, data, cb) {
    const { user } = socket;
    const { roomId } = user;
    if (typeof cb !== 'function') {
      return;
    }

    const check = this.checkRoom(roomId, user);
    if (check !== true) {
      cb(check);
      return;
    }

    this.io.to(roomId).emit('room_broadcast', { payload: data });
    cb({ result: true });
  }

  onRoomFinish(socket, data, cb) {
    const { user } = socket;
    const { roomId } = user;
    if (typeof cb !== 'function') {
      return;
    }

    const check = this.checkRoom(roomId, user);
    if (check !== true) {
      cb(check);
      return;
    }

    const room = this.rooms[roomId];
    this.io.to(roomId).emit('room_end');
    Object.values(room.users).forEach(roomUser => roomUser.socket.leave(roomId));
    delete this.rooms[roomId];
  }

  onRoomTerminate(socket, data, cb) {
    if (typeof cb !== 'function') {
      return;
    }
    const { id } = data;
    if (this.rooms[id] === undefined) {
      cb({ result: false, reason: 'ALREADY_CLOSED' });
      return;
    }

    const room = this.rooms[id];
    this.io.to(id).emit('room_terminate');
    Object.values(room.users).forEach(user => user.socket.leave(id));
    delete this.rooms[id];
  }

  checkRoomState(room) {
    const currentTime = Util.getTimestamp();
    if (currentTime < room.endTime) {
      return;
    }

    const roomId = room.id;
    this.io.to(roomId).emit('room_end');
    Object.values(room.users).forEach(user => user.socket.leave(roomId));
    delete this.rooms[roomId];
  }
}

module.exports = ServerManager;
