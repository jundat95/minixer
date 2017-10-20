class User {
  constructor(id, socket) {
    this.id = id;
    this.socket = socket;
    this.roomId = null;
  }
}

module.exports = User;
