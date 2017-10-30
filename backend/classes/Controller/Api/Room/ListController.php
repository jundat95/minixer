<?php

namespace Minixer\Controller\Api\Room;

use Minixer\Config;
use Minixer\Controller\ControllerBase;
use Minixer\Service\RoomStateService;
use Minixer\Util\SessionUtil;
use Symfony\Component\HttpFoundation\Request;

class ListController extends ControllerBase
{
    private $roomStateService;

    public function __construct(RoomStateService $roomStateService)
    {
        $this->roomStateService = $roomStateService;
    }

    public function __invoke(Request $request)
    {
        $user = SessionUtil::getUser();
        $userId = $user->getId();

        $adminUserIds = Config::getInstance()->get('admin_user_ids');
        $isAdminUser = in_array($userId, $adminUserIds);
        if (!$isAdminUser) {
            return $this->returnJsonResponse(false);
        }

        $ids = $this->roomStateService->getIds();
        return $this->returnJsonResponse(true, $ids);
    }
}
