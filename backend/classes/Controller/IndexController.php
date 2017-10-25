<?php

namespace Minixer\Controller;

use Symfony\Component\HttpFoundation\Request;

class IndexController extends ControllerBase
{
    public function __invoke(Request $request)
    {
        return $this->returnTemplateResponse('index.twig');
    }
}
