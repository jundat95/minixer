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
        $user = $this->getSessionUser();

        $additionalParams = [
            'user_json' => !empty($user) ? json_encode([
                'id' => $user->getId(),
                'name' => $user->getName(),
                'token' => $user->getApiToken(),
                'profile_image_url' => $user->getProfileImageUrlHttps(),
            ]) : null,
        ];
        $data = array_merge($data, $additionalParams);

        return $this->getTwig()->render($name, $data);
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
