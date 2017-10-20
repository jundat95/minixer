<?php

namespace Minixer;

use Minixer\Util\SessionUtil;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

require_once __DIR__ . '/../bootstrap.php';

/** @var Application $app */
$app = $GLOBALS['app'];

$app->before(function (Request $request) use ($app) {
    if (strpos($request->headers->get('Content-Type'), 'application/json') === 0) {
        if ($request->getMethod() === 'POST') {
            $data = json_decode($request->getContent(), true);
            $request->request->replace(is_array($data) ? $data : []);
        }

        $app->error(function (\Exception $e, Request $request) {
            $response = [
                'error' => $e->getMessage(),
                'traces' => $e->getTrace(),
            ];
            return new JsonResponse($response, 500);
        });
    }
});

$loginRequired = function (Request $request, Application $app) {
    $user = SessionUtil::getUser();
    if (empty($user)) {
        return new RedirectResponse('/');
    }
    return null;
};

$app->get('/', 'Minixer\\Controller\\IndexController');
$app->get('/login', 'Minixer\\Controller\\LoginController');
$app->get('/login_callback', 'Minixer\\Controller\\LoginCallbackController');
$app->get('/logout', function () {
    SessionUtil::removeUser();
    return new RedirectResponse('/');
});
$app->get('/mypage', 'Minixer\\Controller\\MypageController')
    ->before($loginRequired);

$app->run();
