export default class Util {
  static getRandom(max, min = 0) {
    return Math.round(Math.random() * ((max - min) + 1)) + min;
  }
}

