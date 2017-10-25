<?php

namespace Minixer\Dao;

use Minixer\Redis;

class TokenDao
{
    /** @var \Redis */
    private $redis;

    public function __construct()
    {
        $this->redis = Redis::getInstance('default');
    }

    private static function getKey($userId)
    {
        return 'MINIXER:TOKEN:' . $userId;
    }

    public function set($userId, $token)
    {
        $this->redis->set(self::getKey($userId), $token);
    }

    public function get($userId)
    {
        return $this->redis->get(self::getKey($userId));
    }
}