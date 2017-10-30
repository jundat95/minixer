<?php

namespace Minixer\Entity;

use Minixer\ClassHelper;
use Minixer\SettableTrait;

class RoomEmotion
{
    use SettableTrait;
    use ClassHelper {
        getString as public getEmotionId;
        getInt as public getCount;
    }
}
