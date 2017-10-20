<?php

namespace Minixer;

/**
 * Trait SettableTrait
 * @package Minixer
 * @property array $helperProperties
 */
trait SettableTrait
{
    /**
     * @param array $properties
     * @return self
     */
    public function set(array $properties)
    {
        $entity = new self(array_merge($this->helperProperties, $properties));
        return $entity;
    }
}
