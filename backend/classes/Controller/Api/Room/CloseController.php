<?php

namespace Minixer\Controller\Api\Room;

use Minixer\Controller\ControllerBase;
use Minixer\Service\RoomStateService;
use Minixer\Util\SessionUtil;
use Symfony\Component\HttpFoundation\Request;

class CloseController extends ControllerBase
{
    private $roomStateService;

    public function __construct(RoomStateService $roomStateService)
    {
        $this->roomStateService = $roomStateService;
    }

    public function __invoke(Request $request)
    {
        $userId = $request->request->get('user_id');
        $token = $request->request->get('token');
        $this->roomStateService->validateToken($userId, $token);

        $roomUser = $this->roomStateService->getRoomUser($userId);
        if (empty($roomUser->getRoomId())) {
            return $this->returnJsonResponse(false);
        }

        $roomId = $roomUser->getRoomId();
        $room = $this->roomStateService->getRoom($roomId);
        if (empty($room)) {
            return $this->returnJsonResponse(false, ['message' => 'ROOM_NOT_FOUND']);
        }

        $this->roomStateService->close($room, $userId);
        return $this->returnJsonResponse(true);
    }
}
