<?php

namespace Minixer\Dao;

class RoomUserListDao extends RoomRedisDaoBase
{
    protected function getKey($id)
    {
        return 'MINIXER:ROOM_USER_LIST:' . $id;
    }

    public function initialize($roomId, $ttl)
    {
        $this->getRedis($roomId)->del($this->getKey($roomId));
        $this->getRedis($roomId)->sAdd($this->getKey($roomId), '0');
        $this->getRedis($roomId)->expire($this->getKey($roomId), $ttl);
    }

    public function add($roomId, $userId)
    {
        $this->getRedis($roomId)->sAdd($this->getKey($roomId), $userId);
    }

    public function del($roomId, $userId)
    {
        $this->getRedis($roomId)->sRem($this->getKey($roomId), $userId);
    }

    public function getCount($roomId)
    {
        return (int)$this->getRedis($roomId)->sCard($this->getKey($roomId));
    }
}
