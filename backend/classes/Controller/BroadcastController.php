<?php

namespace Minixer\Controller;

use Minixer\Config;
use Minixer\Util\SessionUtil;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class BroadcastController extends ControllerBase
{
    public function __invoke(Request $request)
    {
        $user = SessionUtil::getUser();
        return new RedirectResponse('/room/' . $user->getId());
    }
}
