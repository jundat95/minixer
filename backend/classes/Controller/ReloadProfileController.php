<?php

namespace Minixer\Controller;

use Minixer\Entity\User;
use Minixer\Repository\TokenRepository;
use Minixer\Util\DateTimeUtil;
use Minixer\Util\SessionUtil;
use Minixer\Util\StringUtil;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class ReloadProfileController extends ControllerBase
{
    private $tokenRepository;

    public function __construct(TokenRepository $tokenRepository)
    {
        $this->tokenRepository = $tokenRepository;
    }

    public function __invoke(Request $request)
    {
        $user = SessionUtil::getUser();
        if (empty($user)) {
            throw new \Exception('invalid request');
        }

        // inhibit continuously twitter access
        $now = DateTimeUtil::getImmutableByNow();
        $lastLoadedAt = $user->getLastLoadedAt();
        $force = $request->get('force');
        if (!empty($lastLoadedAt) && $now->getTimestamp() - $lastLoadedAt->getTimestamp() < 300) {
            if (empty($force) || $GLOBALS['application_state'] === 'production') {
                return new RedirectResponse('/mypage');
            }
        }

        try {
            $consumerKey = $GLOBALS['app']['TWITTER_CONSUMER_KEY'];
            $consumerSecret = $GLOBALS['app']['TWITTER_CONSUMER_SECRET'];
            $oauth = new \OAuth($consumerKey, $consumerSecret, OAUTH_SIG_METHOD_HMACSHA1, OAUTH_AUTH_TYPE_URI);

            $oauthToken = $user->getOauthToken();
            $oauthTokenSecret = $user->getOauthTokenSecret();
            $oauth->setToken($oauthToken, $oauthTokenSecret);

            $oauth->fetch('https://api.twitter.com/1.1/account/verify_credentials.json');
            $json = json_decode($oauth->getLastResponse());

            $profileImageUrl = $json->profile_image_url_https;
            $profileImageUrl = str_replace('_normal.png', '.png', $profileImageUrl);
            $apiToken = StringUtil::getRandom(16);
            $userData = new User([
                'id' => $json->id_str,
                'name' => $json->screen_name,
                'api_token' => $apiToken,
                'oauth_token' => $oauthToken,
                'oauth_token_secret' => $oauthTokenSecret,
                'profile_image_url' => $profileImageUrl,
                'status' => 'reloaded',
                'last_loaded_at' => DateTimeUtil::getImmutableByNow(),
            ]);

            SessionUtil::setUser($userData);
            $this->tokenRepository->set($json->id_str, $apiToken);
        } catch (\Exception $e) {
            throw $e;
        }

        return new RedirectResponse('/mypage');
    }
}