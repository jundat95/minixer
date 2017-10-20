<?php

namespace Minixer\Console;

use Minixer\Memcache;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class MemcacheKeysCommand extends Command
{
    private $memcached;

    public function __construct()
    {
        parent::__construct(null);
        $this->memcached = Memcache::getInstance('default');
    }

    public function configure()
    {
        $this->setName('memcached:keys');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $keys = $this->memcached->getAllKeys();
        foreach ($keys as $key) {
            echo $key;
            echo PHP_EOL;
        }
    }
}
