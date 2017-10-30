class User {
  constructor(id, token, socket, isAdminUser, roomId) {
    this.id = id;
    this.token = token;
    this.socket = socket;
    this.isAdminUser = isAdminUser;
    this.roomId = roomId;
  }
}

module.exports = User;
