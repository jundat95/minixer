<?php

namespace Minixer\Dao;

use Minixer\Redis;

class RoomDao extends RoomRedisDaoBase
{
    protected function getKey($id)
    {
        return 'MINIXER:ROOM:' . $id;
    }

    public function get($id)
    {
        $json = $this->getRedis($id)->get($this->getKey($id));
        if (empty($json)) {
            return null;
        }

        $data = json_decode($json, true);
        $ttl = $this->getRedis($id)->ttl($this->getKey($id));
        $data['expire'] = $ttl;

        return $data;
    }

    public function set($data)
    {
        $id = $data['id'];
        $ttl = $data['expire'];
        unset($data['expire']);

        $json = json_encode($data);

        return $this->getRedis($id)->setex($this->getKey($id), $ttl, $json);
    }

    public function getIds()
    {
        $keyPrefix = $this->getKey('');
        $count = Redis::getShardingCount($keyPrefix);

        $keyList = [];
        for ($i = 0; $i < $count; $i++) {
            $keys = $this->getRedis($i)->keys($keyPrefix);
            $keyList = array_merge($keyList, $keys);
        }

        $ids = [];
        foreach ($keyList as $index => $key) {
            $exploded = explode(':', $key);
            $ids[] = $exploded[2];
        }

        return $ids;
    }
}
