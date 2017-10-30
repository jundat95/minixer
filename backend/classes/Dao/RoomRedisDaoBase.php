<?php

namespace Minixer\Dao;

use Minixer\Redis;

abstract class RoomRedisDaoBase
{
    protected function getRedis($id = null)
    {
        if (empty($id)) {
            return Redis::getInstance('default');
        }

        $namespace = Redis::getNamespaceForSharding('room', $id);
        return Redis::getInstance($namespace);
    }

    public function changeExpire($id, $ttl)
    {
        $this->getRedis($id)->expire($this->getKey($id), $ttl);
    }

    public function remove($id)
    {
        $this->getRedis($id)->del($this->getKey($id));
    }

    abstract protected function getKey($id);
}
