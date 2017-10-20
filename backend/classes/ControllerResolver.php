<?php

namespace Minixer;

class ControllerResolver extends \Symfony\Component\HttpKernel\Controller\ControllerResolver
{
    protected function instantiateController($class)
    {
        // constructor injection によるインスタンス化をする
        // 各 Controller のコンストラクタの引数に入っているクラスをここで解決する
        $di = ContainerBuilder::getInstance();
        return $di->make($class);
    }
}
