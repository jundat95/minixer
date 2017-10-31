<?php

namespace Minixer;

class Redis
{
    private static $redisInstances = [];
    private static $config = [];

    private function __construct()
    {
    }

    /**
     * @param $namespace
     * @return \Redis
     */
    public static function getInstance($namespace)
    {
        if (!isset(self::$redisInstances[$namespace])) {
            list($host, $port, $timeout, $db) = self::getConfig($namespace);
            $redis = new \Redis();
            $redis->connect($host, $port, $timeout);
            $redis->select($db);
            self::$redisInstances[$namespace] = $redis;
        }
        return self::$redisInstances[$namespace];
    }

    public static function getShardingCount($prefix)
    {
        $keys = array_keys(self::$config);
        $count = 0;
        foreach ($keys as $key) {
            if (strpos($key, $prefix) === 0) {
                ++$count;
            }
        }
        return $count;
    }

    public static function getNamespaceForSharding($prefix, $id)
    {
        $count = self::getShardingCount($prefix);
        if ($count < 1) {
            return 'default';
        }

        $index = $id % $count;
        $targetKey = $prefix . '_' . $index;
        if (!isset(self::$config[$targetKey])) {
            return 'default';
        }

        return $targetKey;
    }

    /**
     * @param $namespace
     * @return array
     */
    public static function getConfig($namespace)
    {
        self::loadConfig();
        self::validateConfig($namespace);

        $config = self::$config;
        $default = $config['default'];
        $namespaceConf = $config[$namespace];
        $host = $namespaceConf['host'] ?? $default['host'];
        $port = $namespaceConf['port'] ?? $default['port'];
        $timeout = $namespaceConf['timeout'] ?? $default['timeout'];
        $db = $namespaceConf['db'] ?? $default['db'];

        return [$host, $port, $timeout, $db];
    }

    private static function loadConfig()
    {
        if (empty(self::$config)) {
            $configDir = Config::getInstance()->get('config_dir');
            $configPath = $configDir . '/redis.ini.php';
            self::$config = require $configPath;
        }
    }

    private static function validateConfig($namespace)
    {
        $config = self::$config;
        if (!isset($config[$namespace])) {
            throw new \InvalidArgumentException('cannot find namespace : ' . $namespace);
        }
        if (empty($config['default'])) {
            throw new \RuntimeException('default config is empty');
        }

        $keys = ['host', 'port', 'timeout', 'db'];
        foreach ($keys as $key) {
            if (!isset($config['default'][$key])) {
                throw new \RuntimeException('cannot find config : default.' . $key);
            }
        }
    }
}