<?php

namespace Minixer;

use Monolog\Handler\HandlerInterface;
use Monolog\Handler\RotatingFileHandler;

class Logger
{
    private static $loggers;

    /**
     * @param $name
     * @param int $logLevel
     * @param HandlerInterface|array|null $additionalHandler
     * @return \Monolog\Logger
     */
    public static function get($name, $logLevel = \Monolog\Logger::DEBUG, $additionalHandler = null)
    {
        if (empty(self::$loggers[$name])) {
            $config = Config::getInstance()->get('log');
            $path = $config['dir'];
            $handlers = [];

            if ($config['enabled']) {
                $filename = sprintf('%s/%s.log', $path, $name);
                $handlers[] = new RotatingFileHandler($filename, 0, $logLevel);
            }

            if (is_object($additionalHandler) && $additionalHandler instanceof HandlerInterface) {
                $handlers[] = $additionalHandler;
            } elseif (is_array($additionalHandler)) {
                $handlers = array_merge($handlers, $additionalHandler);
            }

            self::$loggers[$name] = new \Monolog\Logger($name, $handlers);
        }
        return self::$loggers[$name];
    }
}
