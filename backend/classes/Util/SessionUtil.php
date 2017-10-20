<?php

namespace Minixer\Util;

use Symfony\Component\HttpFoundation\Session\Session;

class SessionUtil
{
    const USER_KEY = 'session:user';

    /**
     * @return Session
     */
    public static function getSession() {
        return $GLOBALS['app']['session'];
    }

    public static function setUser($user)
    {
        self::getSession()->set(self::USER_KEY, $user);
    }

    public static function getUser()
    {
        return self::getSession()->get(self::USER_KEY);
    }

    public static function removeUser()
    {
        self::getSession()->remove(self::USER_KEY);
    }
}
