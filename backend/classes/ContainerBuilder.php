<?php

namespace Minixer;

use DI\Container;
use Doctrine\Common\Cache\ApcuCache;

class ContainerBuilder
{
    private function __construct()
    {
    }

    public static function getInstance()
    {
        static $instance;
        if (!($instance instanceof Container)) {
            $builder = new \DI\ContainerBuilder();
            if (!$GLOBALS['app']['debug']) {
                $cache = new ApcuCache();
                $builder->setDefinitionCache($cache);
                $builder->writeProxiesToFile(false);
            }
            $instance = $builder->build();
        }
        return $instance;
    }
}
