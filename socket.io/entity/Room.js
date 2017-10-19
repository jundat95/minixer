const MAX_EMOTION_LENGTH = 100;

class Room {
  constructor(id, user, passPhrase = null) {
    this.id = id;
    this.masterUserId = user.id;
    this.passPhrase = passPhrase;
    this.emotions = [];
    this.emotionCountById = {};
    this.users = {
      [user.id]: user,
    };
  }

  addUser(user, passPhrase) {
    if (this.passPhrase !== null) {
      if (this.passPhrase !== passPhrase) {
        return false;
      }
    }

    this.users[user.id] = user;
    return true;
  }

  delUser(id) {
    delete this.users[id];
  }

  addEmotion(emotion) {
    if (this.emotions.length >= MAX_EMOTION_LENGTH) {
      const deleteSize = this.emotions.length - MAX_EMOTION_LENGTH;
      this.emotions.splice(0, deleteSize + 1);
    }

    this.emotions.push(emotion);

    const id = emotion.id;
    if (this.emotionCountById[id] === undefined) {
      this.emotionCountById[id] = 0;
    }
    this.emotionCountById[id]++;
  }

  getUsers() {
    const obj = {};
    Object.values(this.users).forEach((user) => {
      obj[user.id] = user.toJSON();
    });

    return obj;
  }
}

module.exports = Room;
