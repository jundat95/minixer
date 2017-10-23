<?php

namespace Minixer\Controller;

use Minixer\ContainerBuilder;
use Minixer\Entity\AdminUser;
use Minixer\Entity\User;
use Minixer\Service\SessionService;
use Minixer\Util\SessionUtil;
use Minixer\Util\StringUtil;
use Silex\Application\TwigTrait;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

abstract class ControllerBase
{
    private $sessionUser = null;

    protected function returnJsonResponse(bool $result, $data = null, $code = 200)
    {
        $responseData = ['result' => $result];
        if (!empty($data)) {
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

    protected function returnTemplateResponse($name, array $data)
    {
        $templateData = [
            'json' => $this->getJsonData($data),
        ];

        if (isset($data['json'])) {
            unset($data['json']);
        }
        if (!empty($data)) {
            $templateData = array_merge($templateData, $data);
        }

        return $this->getTwig()->render($name, $templateData);
    }

    protected function getJsonData($data)
    {
        $user = $this->getSessionUser();
        $responseData = [
            'user' => !empty($user) ? [
                'id' => $user->getId(),
                'token' => $user->getApiToken(),
                'name' => $user->getName(),
                'profile_image' => $user->getProfileImageUrl(),
            ] : null,
        ];

        if (isset($data['json'])) {
            $responseData = array_merge($responseData, $data['json']);
        }

        return json_encode($responseData);
    }

    protected function getSessionUser()
    {
        if ($this->sessionUser === null) {
            $sessionUser = SessionUtil::getUser();
            if (!empty($sessionUser) && $this->sessionUser === null) {
                $this->sessionUser = new User($sessionUser);
            }
        }

        return $this->sessionUser;
    }

    abstract public function __invoke(Request $request);
}
