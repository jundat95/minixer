<?php

namespace Minixer\Util;

trait StringUtil
{
    public static function getRandom($n = 10)
    {
        return substr(str_shuffle(str_repeat('23456789abcdefghjklmnpqrstuvwxyz', $n)), 0, $n);
    }
}
