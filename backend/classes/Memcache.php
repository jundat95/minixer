<?php

namespace Minixer;

class Memcache
{
    private static $memcacheInstances = [];
    private static $config = [];

    private function __construct()
    {
    }

    /**
     * @param $namespace
     * @return \Memcached
     */
    public static function getInstance($namespace)
    {
        if (!isset(self::$memcacheInstances[$namespace])) {
            list($host, $port) = self::getConfig($namespace);
            $memcache = new \Memcached();
            $memcache->addServer($host, $port);
            self::$memcacheInstances[$namespace] = $memcache;
        }
        return self::$memcacheInstances[$namespace];
    }

    private static function getConfig($namespace)
    {
        self::loadConfig();
        self::validateConfig($namespace);

        $config = self::$config;
        $default = $config['default'];
        $namespaceConf = $config[$namespace];
        $host = $namespaceConf['host'] ?? $default['host'];
        $port = $namespaceConf['port'] ?? $default['port'];

        return [$host, $port];
    }

    private static function loadConfig()
    {
        if (empty(self::$config)) {
            $configDir = Config::getInstance()->get('config_dir');
            $configPath = $configDir . '/memcache.ini.php';
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

        $keys = ['host', 'port'];
        foreach ($keys as $key) {
            if (!isset($config['default'][$key])) {
                throw new \RuntimeException('cannot find config : default.' . $key);
            }
        }
    }
}
