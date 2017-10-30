<?php

namespace Minixer\Controller\Api\Room;

use Minixer\Controller\ControllerBase;
use Minixer\Service\RoomStateService;
use Minixer\Util\SessionUtil;
use Symfony\Component\HttpFoundation\Request;

class EmotionController extends ControllerBase
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

        $roomId = $request->request->get('room_id');
        $room = $this->roomStateService->getRoom($roomId);
        if (empty($room)) {
            return $this->returnJsonResponse(false);
        }

        $emotionId = $request->request->get('emotion_id');
        if (empty($emotionId)) {
            return $this->returnJsonResponse(false);
        }

        $newEmotions = $this->roomStateService->incrementEmotion($room, $emotionId);
        return $this->returnJsonResponse(true, [
            'room_emotions' => $this->roomStateService->getRoomEmotionProperties($newEmotions),
        ]);
    }
}
