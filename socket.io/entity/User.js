class User {
  constructor(id, token, socket, isAdminUser, roomId) {
    this.id = id;
    this.token = token;
    this.socket = socket;
    this.isAdminUser = isAdminUser;
    this.roomId = roomId;
    this.isGuest = false;
  }

  setGuest() {
    this.isGuest = true;
  }
}

module.exports = User;
