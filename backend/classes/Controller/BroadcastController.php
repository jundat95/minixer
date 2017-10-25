<?php

namespace Minixer\Controller;

use Minixer\Config;
use Minixer\Util\SessionUtil;
use Symfony\Component\HttpFoundation\Request;

class BroadcastController extends ControllerBase
{
    public function __invoke(Request $request)
    {
        $user = SessionUtil::getUser();

        $servers = Config::getInstance()->get('socket_io_servers');
        $serverCount = count($servers);
        $index = $user->getId() % $serverCount;
        $url = $servers[$index];

        $data = [
            'json' => [
                'socket_io_url' => $url,
                'room_id' => $user->getId(),
            ],
        ];

        return $this->returnTemplateResponse('broadcast.twig', $data);
    }
}
