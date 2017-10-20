<?php

namespace Minixer\Controller;

use Minixer\Util\SessionUtil;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class LoginController extends ControllerBase
{
    public function __invoke(Request $request)
    {
        $user = $this->getSessionUser();
        if (!empty($user) && !empty($user->getId())) {
            return new RedirectResponse('/');
        }

        $consumerKey = $GLOBALS['app']['TWITTER_CONSUMER_KEY'];
        $consumerSecret = $GLOBALS['app']['TWITTER_CONSUMER_SECRET'];
        $oauth = new \OAuth($consumerKey, $consumerSecret, OAUTH_SIG_METHOD_HMACSHA1, OAUTH_AUTH_TYPE_URI);
        $requestToken = $oauth->getRequestToken('https://twitter.com/oauth/request_token');

        $data = [
            'oauth_token' => $requestToken['oauth_token'],
            'oauth_token_secret' => $requestToken['oauth_token_secret'],
        ];
        SessionUtil::setUser($data);

        return new RedirectResponse(
            'https://twitter.com/oauth/authenticate?oauth_token=' . $requestToken['oauth_token']
        );
    }
}