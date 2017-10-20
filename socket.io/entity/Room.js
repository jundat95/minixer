const Util = require('../Util');

class Room {
  constructor(user) {
    this.id = user.id;
    this.emotionCountById = {};
    this.users = { [user.id]: user };
    this.endTime = Util.getTimestamp() + (60 * 30);
    this.maxUserCount = 0;
  }

  getCurrentUserCount() {
    return Object.keys(this.users).length;
  }

  getRoomParams() {
    const { emotionCountById, maxUserCount } = this;
    const remainTime = this.endTime - Util.getTimestamp();
    const currentUserCount = this.getCurrentUserCount();

    return {
      remainTime,
      emotionCountById,
      maxUserCount,
      currentUserCount,
    };
  }

  setUser(user) {
    this.users[user.id] = user;
    const count = this.getCurrentUserCount();
    if (count > this.maxUserCount) {
      this.maxUserCount = count;
    }
  }

  delUser(id) {
    if (this.users[id] !== undefined) {
      delete this.users[id];
    }
  }

  addEmotion(id) {
    if (this.emotionCountById[id] === undefined) {
      this.emotionCountById[id] = 0;
    }
    this.emotionCountById[id]++;
  }
}

module.exports = Room;
