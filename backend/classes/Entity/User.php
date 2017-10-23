<?php

namespace Minixer\Entity;

use Minixer\ClassHelper;
use Minixer\SettableTrait;

class User
{
    use SettableTrait;
    use ClassHelper {
        getStringOrNull as public getId;
        getStringOrNull as public getName;
        getStringOrNull as public getApiToken;
        getStringOrNull as public getOauthToken;
        getStringOrNull as public getOauthTokenSecret;
        getStringOrNull as public getProfileImageUrl;
    }
}
