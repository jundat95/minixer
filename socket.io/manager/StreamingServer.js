const User = require('../entity/User');
const Room = require('../entity/Room');

class StreamingServer {
  constructor(io) {
    this.io = io;

    this.users = {};
    this.rooms = {};
  }

  registerClient(socket) {
    const { userId } = socket;
    if (!userId) {
      socket.disconnect();
      return;
    }
    if (this.users[userId]) {
      const oldUser = this.users[userId];
      oldUser.socket.disconnect();
      delete this.users[userId];
    }

    this.users[userId] = new User(userId, socket);

    socket.on('change_name', (data, cb) => this.onChangeName(socket, data, cb));
    socket.on('room_create', (data, cb) => this.onRoomCreate(socket, data, cb));
    socket.on('room_join', (data, cb) => this.onRoomJoin(socket, data, cb));
    socket.on('room_leave', (data, cb) => this.onRoomLeave(socket, data, cb));
    socket.on('room_close', (data, cb) => this.onRoomClose(socket, data, cb));
    socket.on('audio_buffer', (data, cb) => this.onAudioBuffer(socket, data, cb));
  }

  onChangeName(socket, data, cb) {
    const { userId } = socket;
    const user = this.users[userId];
    user.name = data.name;
    cb({ result: true, name: data.name });
  }

  onRoomCreate(socket, data, cb) {
    const { userId } = socket;
    const user = this.users[userId];

    const roomId = data.id;
    const pass = data.pass || null;
    if (this.rooms[roomId] !== undefined) {
      // cb({ result: false, reason: 'ALREADY_CREATED_SAME_ID_ROOMS' });
      // return;
    }
    if (user.roomId !== null) {
      cb({ result: false, reason: 'ALREADY_IN_ROOM' });
      return;
    }

    socket.join(roomId, () => {
      this.rooms[roomId] = new Room(roomId, user, pass);
      user.roomId = roomId;
      if (typeof cb === 'function') {
        cb({ result: true, roomId });
      }
    });
  }

  onRoomJoin(socket, data, cb) {
    const { userId } = socket;
    const user = this.users[userId];

    const roomId = data.id;
    const pass = data.pass;
    if (this.rooms[roomId] === undefined) {
      cb({ result: false, reason: 'NOT_FOUND_ROOM' });
      return;
    }

    const room = this.rooms[roomId];
    if (!room.addUser(user, pass)) {
      cb({ result: false, reason: 'CANNOT_IN_ROOM' });
    }

    socket.join(roomId, () => {
      user.roomId = roomId;
      cb({ result: true, users: room.getUsers(), emotionCounts: room.emotionCountById });
    });
  }

  onRoomLeave(socket, data, cb) {
    const { userId } = socket;
    const user = this.users[userId];

    if (user.roomId === null) {
      cb({ result: false, reason: 'NOT_IN_ROOM' });
      return;
    }

    this.roomLeave(socket, user);
    cb({ result: true });
  }

  roomLeave(socket, user, broadcast = true) {
    const { roomId } = user;
    const room = this.rooms[roomId];
    room.delUser(user.id);
    user.roomId = null;
    socket.leave(roomId);

    if (broadcast) {
      this.io.to(roomId).emit('room_leave', { userId: user.id });
    }
  }

  onRoomClose(socket, data, cb) {
    const { userId } = socket;
    const user = this.users[userId];

    const { roomId } = user;
    if (this.rooms[roomId] === undefined) {
      return;
    }
    const room = this.rooms[roomId];
    if (room.masterUserId !== user.id) {
      return;
    }

    this.io.to(roomId).emit('room_close', data);

    // 視聴者
    const roomUsers = room.users;
    Object.values(roomUsers).forEach(roomUser => this.roomLeave(socket, roomUser, false));

    // 放送者
    this.roomLeave(socket, user, false);

    delete this.rooms[roomId];
    cb({ result: true });
  }

  onAudioBuffer(socket, data, cb) {
    const { userId } = socket;
    const user = this.users[userId];

    const { roomId } = user;
    if (this.rooms[roomId] === undefined) {
      return;
    }
    const room = this.rooms[roomId];
    if (room.masterUserId !== user.id) {
      return;
    }

    this.io.to(roomId).emit('audio_buffer', data);
    cb({ result: true });
  }
}

module.exports = StreamingServer;
