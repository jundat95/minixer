<?php

namespace Minixer\Dao;

class RoomMaxMemberCountDao extends RoomRedisDaoBase
{
    protected function getKey($id)
    {
        return 'MINIXER:ROOM_MAX_MEMBER_COUNT:' . $id;
    }

    public function get($id)
    {
        return (int)$this->getRedis($id)->get($this->getKey($id));
    }

    public function initialize($id, $ttl)
    {
        $this->getRedis($id)->setex($this->getKey($id), $ttl, 0);
    }

    public function set($id, $count)
    {
        $this->getRedis($id)->set($this->getKey($id), $count);
    }
}
