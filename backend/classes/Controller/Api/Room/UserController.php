<?php

namespace Minixer\Controller\Api\Room;

use Minixer\Config;
use Minixer\Controller\ControllerBase;
use Minixer\Service\RoomStateService;
use Symfony\Component\HttpFoundation\Request;

class UserController extends ControllerBase
{
    private $roomStateService;

    public function __construct(RoomStateService $roomStateService)
    {
        $this->roomStateService = $roomStateService;
    }

    public function __invoke(Request $request)
    {
        $userId = $request->get('user_id');
        $token = $request->get('token');
        $this->roomStateService->validateToken($userId, $token);

        $roomUser = $this->roomStateService->getRoomUser($userId, true);
        $data = $this->roomStateService->getRoomUserProperties($roomUser);

        $adminUserIds = Config::getInstance()->get('admin_user_ids');
        $isAdminUser = in_array($userId, $adminUserIds);
        $data['is_admin_user'] = $isAdminUser;

        return $this->returnJsonResponse(true, $data);
    }
}
