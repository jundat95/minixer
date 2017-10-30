<?php

namespace Minixer\Controller;

use Minixer\Config;
use Minixer\Util\SessionUtil;
use Symfony\Component\HttpFoundation\Request;

class RoomController extends ControllerBase
{
    public function __invoke(Request $request)
    {
        $roomId = $request->get('room_id');

        $servers = Config::getInstance()->get('socket_io_servers');
        $serverCount = count($servers);
        $index = $roomId % $serverCount;
        $url = $servers[$index];

        $data = [
            'json' => [
                'socket_io_url' => $url,
                'room_id' => $roomId,
            ],
        ];

        return $this->returnTemplateResponse('broadcast.twig', $data);
    }
}
