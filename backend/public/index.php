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
$app->get('/reload_profile', 'Minixer\\Controller\\ReloadProfileController')
    ->before($loginRequired);
$app->get('/broadcast', 'Minixer\\Controller\\BroadcastController')
    ->before($loginRequired);
$app->get('/room/{room_id}', 'Minixer\\Controller\\RoomController')
    ->before($loginRequired);

$app->get('/api/room/user', 'Minixer\\Controller\\Api\\Room\\UserController');
$app->post('/api/room/create', 'Minixer\\Controller\\Api\\Room\\CreateController');
$app->post('/api/room/join', 'Minixer\\Controller\\Api\\Room\\JoinController');
$app->post('/api/room/leave', 'Minixer\\Controller\\Api\\Room\\LeaveController');
$app->post('/api/room/update', 'Minixer\\Controller\\Api\\Room\\UpdateController');
$app->post('/api/room/emotion', 'Minixer\\Controller\\Api\\Room\\EmotionController');
$app->post('/api/room/extend', 'Minixer\\Controller\\Api\\Room\\ExtendController');
$app->post('/api/room/close', 'Minixer\\Controller\\Api\\Room\\CloseController');
$app->post('/api/room/terminate', 'Minixer\\Controller\\Api\\Room\\TerminateController');
$app->get('/api/room/list', 'Minixer\\Controller\\Api\\Room\\ListController');

$app->run();
