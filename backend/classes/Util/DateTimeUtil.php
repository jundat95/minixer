<?php

namespace Minixer\Util;

trait DateTimeUtil
{
    public static function getImmutableByString($string, $timezone = null)
    {
        if (is_null($timezone)) {
            $timezone = self::getDefaultTimezone();
        }
        return new \DateTimeImmutable($string, $timezone);
    }

    public static function getImmutableByNow($timezone = null)
    {
        if (is_null($timezone)) {
            $timezone = self::getDefaultTimezone();
        }
        return self::getImmutableByString('now', $timezone);
    }

    public static function getImmutableByTimestamp(int $timestamp, $timezone = null)
    {
        if (is_null($timezone)) {
            $timezone = self::getDefaultTimezone();
        }
        return self::getImmutableByString('@' . $timestamp, $timezone);
    }

    public static function getDefaultTimezone()
    {
        return new \DateTimeZone('Asia/Tokyo');
    }
}
