<?php

namespace Minixer;

class Config
{
    const CONFIG_FILE_NAME = 'config.php';
    private $data = [];
    private $configDir = null;

    private function __construct()
    {
    }

    public static function getInstance()
    {
        static $instance;
        if (!($instance instanceof Config)) {
            $instance = new self();
            $instance->initialize();
        }
        return $instance;
    }

    private function initialize()
    {
        $configDir = __DIR__ . '/../config/' . $GLOBALS['application_state'];
        $this->configDir = $configDir;
        $this->data = require $configDir . '/' . self::CONFIG_FILE_NAME;
    }

    public function get($key)
    {
        if (!isset($this->data[$key])) {
            return null;
        }
        return $this->data[$key];
    }

    public function exists($key)
    {
        return isset($this->data[$key]);
    }

    public function getConfigDir()
    {
        return $this->configDir;
    }
}