<?php

namespace Minixer\ClassHelper\Coerce;

trait IntToDateTimeImmutable
{
    /**
     * @param $int
     * @return \DateTimeImmutable
     */
    protected function convertIntToDateTimeImmutable($int)
    {
        return new \DateTimeImmutable('@' . $int);
    }
}
