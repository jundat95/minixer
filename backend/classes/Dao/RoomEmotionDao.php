<?php

namespace Minixer\Dao;

class RoomEmotionDao extends RoomRedisDaoBase
{
    protected function getKey($id)
    {
        return 'MINIXER:ROOM_EMOTION:' . $id;
    }

    public function getList($roomId)
    {
        return $this->getRedis($roomId)->hGetAll($this->getKey($roomId));
    }

    public function initialize($roomId, $ttl)
    {
        $this->getRedis($roomId)->del($this->getKey($roomId));
        $this->getRedis($roomId)->hSet($this->getKey($roomId), '0', 0);
        $this->getRedis($roomId)->expire($this->getKey($roomId), $ttl);
    }

    public function increment($roomId, $emotionId)
    {
        $this->getRedis($roomId)->hIncrBy($this->getKey($roomId), $emotionId, 1);
    }
}
