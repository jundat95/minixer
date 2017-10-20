<?php

namespace Minixer\Controller;

use Symfony\Component\HttpFoundation\Request;

class MypageController extends ControllerBase
{
    public function __invoke(Request $request)
    {
        return $this->returnTemplateResponse('mypage.twig', []);
    }
}
