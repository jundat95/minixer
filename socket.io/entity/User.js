class User {
  constructor(id, name, socket, isAdminUser) {
    this.id = id;
    this.name = name;
    this.socket = socket;
    this.roomId = null;
    this.isAdminUser = isAdminUser;
  }
}

module.exports = User;
