<?php
return [
    'config_dir' => __DIR__,
    'app_name' => 'Minixer',
    'log' => [
        'enabled' => true,
        'dir' => __DIR__ . '/../../../logs',
        'level' => \Monolog\Logger::DEBUG,
    ],
    'redis_key_prefix' => 'MINIXER',
    'socket_io_servers' => [
        'https://dev.minixer.net:19999',
    ],
    'admin_user_ids' => [
        '107481221',
    ],
];
