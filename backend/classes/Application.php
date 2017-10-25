<?php

namespace Minixer;

use Silex\Provider\MonologServiceProvider;
use Silex\Provider\SessionServiceProvider;
use Silex\Provider\TwigServiceProvider;

class Application extends \Silex\Application
{
    public function __construct(array $values = array(), Config $config)
    {
        parent::__construct($values);

        $this->register(new TwigServiceProvider(), [
            'twig.path' => __DIR__ . '/../templates',
        ]);
        $this->register(new SessionServiceProvider());

        $logConfig = $config->get('log');
        if ($logConfig['enabled']) {
            $this->register(new MonologServiceProvider(), array(
                'monolog.logfile' => $logConfig['dir'] . '/application.log',
                'monolog.level' => $logConfig['level'],
            ));
        }

        $this['resolver'] = new ControllerResolver();
    }
}
