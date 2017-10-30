export default class Util {
  static getRandom(max, min = 0) {
    return Math.round(Math.random() * ((max - min) + 1)) + min;
  }

  static getTimestamp() {
    return Math.floor(new Date().getTime() / 1000);
  }

  static getFormattedDate(time) {
    const mtime = (time * 1000);
    const date = new Date(mtime);
    const Y = date.getFullYear();
    const M = `0${date.getMonth() + 1}`.slice(-2);
    const D = `0${date.getDate()}`.slice(-2);
    const h = `0${date.getHours()}`.slice(-2);
    const m = `0${date.getMinutes()}`.slice(-2);
    const s = `0${date.getSeconds()}`.slice(-2);

    return `${Y}/${M}/${D} ${h}:${m}:${s}`;
  }
}
