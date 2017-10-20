<?php
return [
    'config_dir' => __DIR__,
    'app_name' => 'Minixer',
    'log' => [
        'enabled' => true,
        'dir' => __DIR__ . '/../../../logs',
        'level' => \Monolog\Logger::WARNING,
    ],
    'redis_key_prefix' => 'MINIXER',
];
