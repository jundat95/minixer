<?php
return [
    'config_dir' => __DIR__,
    'app_name' => 'Minixer',
    'log' => [
        'enabled' => true,
        'dir' => '/var/log/minixer',
        'level' => \Monolog\Logger::WARNING,
    ],
    'redis_key_prefix' => 'MINIXER',
];
