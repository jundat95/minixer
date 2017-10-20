<?php

namespace Minixer\Util;

trait ClassUtil
{
    public static function getClassesByDirectory($dir)
    {
        $files = [];
        $iterator = new \RecursiveDirectoryIterator($dir);
        $iterator = new \RecursiveIteratorIterator($iterator);
        /** @var \SplFileInfo $info */
        foreach ($iterator as $info) {
            if (!$info->isFile()) {
                continue;
            }
            $name = str_replace('.php', '', $info->getFilename());
            $dirName = str_replace($dir, '', $info->getPath());
            if (!empty($dirName)) {
                $name = str_replace('/', '\\', substr($dirName, 1)) . '\\' . $name;
            }
            $files[] = $name;
        }

        return $files;
    }
}
