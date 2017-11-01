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
        $roomId = $user->getId();

        $config = Config::getInstance();
        $servers = $config->get('socket_io_servers');
        $serverCount = count($servers);
        $index = $roomId % $serverCount;
        $url = $servers[$index];

        $roomUrl = $config->get('base_url') . '/room/' . $roomId;
        $data = [
            'json' => [
                'socket_io_url' => $url,
                'room_id' => $roomId,
                'room_url' => $roomUrl,
            ],
        ];

        return $this->returnTemplateResponse('broadcast.twig', $data);
    }
}
