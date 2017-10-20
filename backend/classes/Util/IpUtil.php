<?php

namespace Minixer\Util;

trait IpUtil
{
    public static function cidrCheck($cidr, $ip)
    {
        if (strpos($cidr, '/') === false) {
            return ($cidr == $ip);
        }

        $network = $cidr;
        $maskBitLen = 32;
        $host = 32 - $maskBitLen;
        $net = ip2long($network) >> $host << $host;
        $ipNet = ip2long($ip) >> $host << $host;

        return $net === $ipNet;
    }
}