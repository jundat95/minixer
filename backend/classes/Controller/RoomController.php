<?php

namespace Minixer\Controller;

use Minixer\Config;
use Minixer\Entity\User;
use Minixer\Memcache;
use Minixer\Util\SessionUtil;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class RoomController extends ControllerBase
{
    public function __invoke(Request $request)
    {
        $roomId = $request->get('room_id');
        if (empty($roomId)) {
            return new Response('error!');
        }

        $user = SessionUtil::getUser();
        if ($user instanceof User) {
            $id = $user->getId();
            if ($roomId === $id) {
                return new RedirectResponse('/broadcast');
            }
        }

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

        if (empty($user)) {
            $guestId = SessionUtil::getGuestId();
            if (empty($guestId)) {
                $guestId = $this->createGuestId();
                SessionUtil::setGuestId($guestId);
            }
            $data['json']['guest_id'] = $guestId;
        }

        return $this->returnTemplateResponse('broadcast.twig', $data);
    }

    private function createGuestId()
    {
        $mem = Memcache::getInstance('default');
        $key = 'MINIXER:GUEST_ID:SEQ';
        if (!$mem->get($key)) {
            $mem->set($key, 1);
            return 1;
        }
        return $mem->increment($key);
    }
}
