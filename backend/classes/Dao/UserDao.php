<?php

namespace Minixer\Dao;

use Minixer\Redis;

class UserDao
{
    /** @var \Redis */
    private $redis;

    public function __construct()
    {
        $this->redis = Redis::getInstance('default');
    }

    private static function getKey($userId)
    {
        return 'MINIXER:USER:' . $userId;
    }

    public function set($userId, $row)
    {
        $json = json_encode($row);
        $this->redis->set(self::getKey($userId), $json);
    }

    public function get($userId)
    {
        $json = $this->redis->get(self::getKey($userId));
        if (empty($json)) {
            return null;
        }

        return json_decode($json, true);
    }
}