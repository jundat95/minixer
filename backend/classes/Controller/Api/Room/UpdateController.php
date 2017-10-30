<?php

namespace Minixer\Controller\Api\Room;

use Minixer\Controller\ControllerBase;
use Minixer\Service\RoomStateService;
use Minixer\Util\SessionUtil;
use Symfony\Component\HttpFoundation\Request;

class UpdateController extends ControllerBase
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
            return $this->returnJsonResponse(false);
        }

        $row = [];
        $data = $request->request;
        $keys = [
            'name',
            'mood_message',
        ];
        foreach ($keys as $key) {
            if ($data->has($key)) {
                $row[$key] = $data->get($key);
            }
        }

        if (empty($row)) {
            return $this->returnJsonResponse(true, [
                'room' => $this->roomStateService->getRoomProperties($room),
            ]);
        }

        $newRoom = $room->set($row);
        $this->roomStateService->update($newRoom, $userId);

        return $this->returnJsonResponse(true, [
            'room' => $this->roomStateService->getRoomProperties($newRoom),
        ]);
    }
}
