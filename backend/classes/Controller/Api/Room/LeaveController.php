<?php

namespace Minixer\Controller\Api\Room;

use Minixer\Controller\ControllerBase;
use Minixer\Service\RoomStateService;
use Minixer\Util\SessionUtil;
use Symfony\Component\HttpFoundation\Request;

class LeaveController extends ControllerBase
{
    private $roomStateService;

    public function __construct(RoomStateService $roomStateService)
    {
        $this->roomStateService = $roomStateService;
    }

    public function __invoke(Request $request)
    {
        $userId = $request->request->get('user_id');
        $guestId = $request->request->get('guest_id');
        if (!empty($userId)) {
            $token = $request->request->get('token');
            $this->roomStateService->validateToken($userId, $token);
        } else {
            $userId = 'guest-' . $guestId;
        }

        $roomId = $request->request->get('room_id');
        $room = $this->roomStateService->getRoom($roomId);
        if (empty($room)) {
            return $this->returnJsonResponse(false, ['message' => 'ROOM_NOT_FOUND']);
        }

        $newRoom = $this->roomStateService->leave($room, $userId);
        return $this->returnJsonResponse(true, [
            'room' => $this->roomStateService->getRoomProperties($newRoom),
        ]);
    }
}
