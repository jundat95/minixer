<?php

namespace Minixer\Util;

use Minixer\Entity\User;
use Symfony\Component\HttpFoundation\Session\Session;

class SessionUtil
{
    const USER_KEY = 'session:user';

    private function __construct()
    {
    }

    /**
     * @return Session
     */
    public static function getSession() {
        return $GLOBALS['app']['session'];
    }

    public static function setUser(User $user)
    {
        $row = [
            'id' => $user->getId(),
            'name' => $user->getName(),
            'api_token' => $user->getApiToken(),
            'oauth_token' => $user->getOauthToken(),
            'oauth_token_secret' => $user->getOauthTokenSecret(),
            'profile_image_url' => $user->getProfileImageUrl(),
            'status' => $user->getStatus(),
            'last_loaded_at' => !is_null($user->getLastLoadedAt()) ? $user->getLastLoadedAt()->getTimestamp() : null,
        ];

        self::getSession()->set(self::USER_KEY, $row);
    }

    public static function getUser()
    {
        $row = self::getSession()->get(self::USER_KEY);
        if (empty($row)) {
            return null;
        }

        $row['last_loaded_at'] =
            !empty($row['last_loaded_at']) ? DateTimeUtil::getImmutableByTimestamp($row['last_loaded_at']) : null;

        return new User($row);
    }

    public static function removeUser()
    {
        self::getSession()->remove(self::USER_KEY);
    }
}
