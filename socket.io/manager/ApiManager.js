const Axios = require('axios');
const Util = require('../Util');

const successFunction = (response, cb) => {
  const { data } = response;
  cb(data);
};

const errorFunction = (error, cb) => {
  console.error(error);
  cb({ result: false });
};

class ApiManager {
  static getRequest(path, params, cb) {
    const host = Util.getConfig().api_host;
    return Axios.get(`${host}${path}`, { params })
      .then(response => successFunction(response, cb))
      .catch(error => errorFunction(error, cb));
  }

  static postRequest(path, params, cb) {
    const host = Util.getConfig().api_host;
    return Axios.post(`${host}${path}`, params)
      .then(response => successFunction(response, cb))
      .catch(error => errorFunction(error, cb));
  }

  static roomUser(userId, token, cb) {
    const params = {
      user_id: userId,
      token,
    };

    ApiManager.getRequest('/api/room/user', params, cb);
  }

  static roomCreate(userId, token, cb) {
    const params = {
      user_id: userId,
      token,
    };

    ApiManager.postRequest('/api/room/create', params, cb);
  }

  static roomJoin(userId, token, roomId, cb) {
    const params = {
      user_id: userId,
      token,
      room_id: roomId,
    };

    ApiManager.postRequest('/api/room/join', params, cb);
  }

  static roomJoinGuest(guestId, roomId, cb) {
    const params = {
      guest_id: guestId,
      room_id: roomId,
    };

    ApiManager.postRequest('/api/room/join', params, cb);
  }

  static roomLeave(userId, token, roomId, cb) {
    const params = {
      user_id: userId,
      token,
      room_id: roomId,
    };

    ApiManager.postRequest('/api/room/leave', params, cb);
  }

  static roomLeaveGuest(guestId, roomId, cb) {
    const params = {
      guest_id: guestId,
      room_id: roomId,
    };

    ApiManager.postRequest('/api/room/leave', params, cb);
  }

  static roomUpdate(userId, token, updateData, cb) {
    const params = Object.assign({}, {
      user_id: userId,
      token,
    }, updateData);

    ApiManager.postRequest('/api/room/update', params, cb);
  }

  static roomEmotion(roomId, emotionId, cb) {
    const params = {
      room_id: roomId,
      emotion_id: emotionId,
    };

    ApiManager.postRequest('/api/room/emotion', params, cb);
  }

  static roomExtend(userId, token, count, cb) {
    const params = {
      user_id: userId,
      token,
      count,
    };

    ApiManager.postRequest('/api/room/extend', params, cb);
  }

  static roomClose(userId, token, cb) {
    const params = {
      user_id: userId,
      token,
    };

    ApiManager.postRequest('/api/room/close', params, cb);
  }

  static roomTerminate(userId, token, cb) {
    const params = {
      user_id: userId,
      token,
    };

    ApiManager.postRequest('/api/room/terminate', params, cb);
  }
}

module.exports = ApiManager;
