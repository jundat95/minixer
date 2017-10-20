class Util {
  static getTimestamp() {
    return Math.floor(new Date().getTime() / 1000);
  }
}

module.exports = Util;
