const fs = require('fs');

let config = null;
let lastConfigLoaded = 0;
const CONFIG_RELOAD_SEC = 60;

class Util {
  static getTimestamp() {
    return Math.floor(new Date().getTime() / 1000);
  }

  static getConfig() {
    const time = Util.getTimestamp();
    if (config !== null && time - lastConfigLoaded < CONFIG_RELOAD_SEC) {
      return config;
    }

    const json = fs.readFileSync(`${__dirname}/config.json`, { encoding: 'utf8' });
    let parsedConfig = {};
    try {
      parsedConfig = JSON.parse(json);
    } catch (e) {
      console.error(e);
    }

    // default setting
    config = Object.assign({}, {
      server_port: 9999,
      api_host: 'https://minixer.net',
      max_room_count: 100,
      max_room_user_count: 200,
      ssl_key_file: '/etc/ssl/private/localhost.key',
      ssl_cert_file: '/etc/ssl/certs/localhost.crt',
    }, parsedConfig);
    lastConfigLoaded = time;

    return config;
  }
}

module.exports = Util;
