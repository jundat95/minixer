<?php

use Minixer\Application;
use Minixer\Memcache;
use Minixer\Config;
use Minixer\ControllerResolver;
use Silex\Provider\MonologServiceProvider;
use Silex\Provider\SessionServiceProvider;
use Silex\Provider\TwigServiceProvider;
use Symfony\Component\HttpFoundation\Session\Storage\Handler\MemcachedSessionHandler;

require_once __DIR__ . '/../vendor/autoload.php';

ini_set('error_log', __DIR__ . '/../logs');

$statePath = __DIR__ . '/../.state';
if (!file_exists($statePath)) {
    $state = 'develop';
} else {
    $state = file_get_contents(__DIR__ . '/../.state');
    $state = trim($state);
    if (empty($state)) {
        $state = 'develop';
    }
}
$GLOBALS['application_state'] = $state;

$config = Config::getInstance();
$app = new Application([], $config);

$app['session_memcached'] = function () {
    return Memcache::getInstance('default');
};
$app['session.storage.handler'] = function () use ($app) {
    return new MemcachedSessionHandler($app['session_memcached'], [
        'prefix' => 'MINIXER_SESSION:',
        'expiretime' => 86400 * 30,
    ]);
};

if ($state !== 'production') {
    $app['debug'] = true;
}

$twitterConfig = parse_ini_file(__DIR__ . '/../.twitter-secrets');
$app['TWITTER_CONSUMER_KEY'] = $twitterConfig['CONSUMER_KEY'];
$app['TWITTER_CONSUMER_SECRET'] = $twitterConfig['CONSUMER_SECRET'];

$GLOBALS['app'] = $app;
