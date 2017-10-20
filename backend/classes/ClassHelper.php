<?php

namespace Minixer;

use MagicSpice;

trait ClassHelper
{
    use MagicSpice\ClassHelper;

    protected function magicIsClassHelperTraitName($traitName)
    {
        return $traitName === __TRAIT__;
    }

    private function validateTypeDateTimeImmutable($value)
    {
        return !($value instanceof \DateTimeImmutable);
    }

    /**
     * @return \DateTimeImmutable
     */
    private function getDateTimeImmutable()
    {
        static $name;
        if (!$name) {
            $name = $this->magicGetPropertyName();
        }

        return $this->helperProperties[$name];
    }

    /**
     * @return \DateTimeImmutable|null
     */
    private function getDateTimeImmutableOrNull()
    {
        static $name;
        if (!$name) {
            $name = $this->magicGetPropertyName();
        }

        return $this->helperProperties[$name];
    }
}
