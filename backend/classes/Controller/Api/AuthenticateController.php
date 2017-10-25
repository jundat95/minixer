<?php

namespace Minixer\Controller\Api;

use Minixer\Config;
use Minixer\Controller\ControllerBase;
use Minixer\Repository\TokenRepository;
use Symfony\Component\HttpFoundation\Request;

class AuthenticateController extends ControllerBase
{
    private $tokenRepository;

    public function __construct(TokenRepository $tokenRepository)
    {
        $this->tokenRepository = $tokenRepository;
    }

    public function __invoke(Request $request)
    {
        $userId = $request->get('user_id');
        $token = $request->get('token');

        $result = $this->tokenRepository->isValidToken($userId, $token);
        $isAdminUser = false;
        if ($result) {
            $adminUserIds = Config::getInstance()->get('admin_user_ids');
            $isAdminUser = in_array($userId, $adminUserIds);
        }

        return $this->returnJsonResponse($result, ['is_admin_user' => $isAdminUser]);
    }
}