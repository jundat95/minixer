class User {
  constructor(id, socket) {
    this.id = id;
    this.socket = socket;
    this.name = null;
    this.roomId = null;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}

module.exports = User;
