<?php

namespace Minixer\Entity;

use Minixer\ClassHelper;
use Minixer\SettableTrait;

class RoomUser
{
    use SettableTrait;
    use ClassHelper {
        getString as public getUserId;
        getStringOrNull as public getRoomId;
        getDateTimeImmutableOrNull as public getUpdatedAt;
    }
}
