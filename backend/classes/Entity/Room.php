<?php

namespace Minixer\Entity;

use Minixer\ClassHelper;
use Minixer\SettableTrait;

class Room
{
    use SettableTrait;
    use ClassHelper {
        getString as public getId;
        getString as public getUserId;
        getString as public getName;
        getStringOrNull as public getMoodMessage;
        getInt as public getExtendCount;
        getInt as public getExpire;
        getInt as public getCurrentMemberCount;
        getInt as public getMaxMemberCount;
        getDateTimeImmutable as public getCreatedAt;
    }
}
