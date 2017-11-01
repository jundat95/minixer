<?php

namespace Minixer\Controller;

use Minixer\Config;
use Minixer\Entity\User;
use Minixer\Util\SessionUtil;
use Silex\Application\TwigTrait;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

abstract class ControllerBase
{
    protected function returnJsonResponse(bool $result, $data = null, $code = 200)
    {
        $responseData = ['result' => $result];
        if (is_array($data) || !empty($data)) {
            $responseData['data'] = $data;
        }

        return new JsonResponse($responseData, $code);
    }

    /**
     * @return TwigTrait
     */
    protected function getTwig()
    {
        $app = $GLOBALS['app'];
        return $app['twig'];
    }

    protected function returnTemplateResponse($name, array $data = [])
    {
        $user = SessionUtil::getUser();
        $templateData = [
            'json' => $this->getJsonData($data, $user),
        ];
        if (!empty($user) && !empty($user->getStatus())) {
            $newUser = $user->set(['status' => null]);
            SessionUtil::setUser($newUser);
        }

        if (isset($data['json'])) {
            unset($data['json']);
        }
        if (!empty($data)) {
            $templateData = array_merge($templateData, $data);
        }

        return $this->getTwig()->render($name, $templateData);
    }

    protected function getJsonData($data, $user)
    {
        $adminUserIds = Config::getInstance()->get('admin_user_ids');
        $responseData = [
            'user' => ($user instanceof User) ? [
                'id' => $user->getId(),
                'token' => $user->getApiToken(),
                'name' => $user->getName(),
                'profile_image' => $user->getProfileImageUrl(),
                'status' => $user->getStatus(),
                'last_loaded_at' => $user->getLastLoadedAt()->getTimestamp(),
                'is_admin_user' => in_array($user->getId(), $adminUserIds),
            ] : null,
            'is_debug' => $GLOBALS['app']['debug'],
        ];

        if (isset($data['json'])) {
            $responseData = array_merge($responseData, $data['json']);
        }

        return json_encode($responseData);
    }

    abstract public function __invoke(Request $request);
}
