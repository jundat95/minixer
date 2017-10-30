<?php

namespace Minixer\Dao;

class RoomUserDao extends RoomRedisDaoBase
{
    protected function getKey($id)
    {
        return 'MINIXER:ROOM_USER:' . $id;
    }

    public function get($userId)
    {
        $json = $this->getRedis()->get($this->getKey($userId));
        if (empty($json)) {
            return null;
        }

        $data = json_decode($json, true);
        return $data;
    }

    public function set($data)
    {
        $userId = $data['user_id'];

        $json = json_encode($data);
        return $this->getRedis()->set($this->getKey($userId), $json);
    }
}
