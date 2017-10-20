<?php

use Minixer\ContainerBuilder;
use Minixer\Util\ClassUtil;

set_time_limit(0);
ini_set('memory_limit', -1);

require __DIR__ . '/bootstrap.php';

$classes = ClassUtil::getClassesByDirectory(__DIR__ . '/classes/Console');

$di = ContainerBuilder::getInstance();
$app = new \Symfony\Component\Console\Application();

// abstract や interface など実行対象に含めないものは ignoreClasses に入れる
$ignoreClasses = [
    'Command',
];
foreach ($classes as $class) {
    if (in_array($class, $ignoreClasses)) {
        continue;
    }

    // constructor injection の解決
    $fullNamespace = 'Minixer\\Console\\' . $class;
    $app->add($di->make($fullNamespace));
}
$app->run();
