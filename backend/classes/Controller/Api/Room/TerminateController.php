<?php

namespace Minixer\Controller\Api\Room;

use Minixer\Config;
use Minixer\Controller\ControllerBase;
use Minixer\Service\RoomStateService;
use Symfony\Component\HttpFoundation\Request;

class TerminateController extends ControllerBase
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

        $adminUserIds = Config::getInstance()->get('admin_user_ids');
        if (!in_array($userId, $adminUserIds)) {
            return $this->returnJsonResponse(false);
        }

        $roomId = $request->request->get('room_id');
        $room = $this->roomStateService->getRoom($roomId);
        if (empty($room)) {
            return $this->returnJsonResponse(false, ['message' => 'ROOM_NOT_FOUND']);
        }

        $this->roomStateService->close($room, $userId);
        return $this->returnJsonResponse(true);
    }
}
