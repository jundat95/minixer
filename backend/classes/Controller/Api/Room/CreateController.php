<?php

namespace Minixer\Controller\Api\Room;

use Minixer\Controller\ControllerBase;
use Minixer\Entity\Room;
use Minixer\Service\RoomStateService;
use Minixer\Util\SessionUtil;
use Symfony\Component\HttpFoundation\Request;

class CreateController extends ControllerBase
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
        $user = $this->roomStateService->getUser($userId, $token);

        $name = $user->getName();
        $result = $this->roomStateService->create($userId, $name);

        /** @var Room $room */
        $room = $result['room'];
        $roomUser = $result['room_user'];

        $roomEmotions = $this->roomStateService->getRoomEmotion($room->getId());

        return $this->returnJsonResponse(true, [
            'room' => $this->roomStateService->getRoomProperties($room),
            'room_user' => $this->roomStateService->getRoomUserProperties($roomUser),
            'room_emotions' => $this->roomStateService->getRoomEmotionProperties($roomEmotions),
            'is_room_master' => true,
        ]);
    }
}
