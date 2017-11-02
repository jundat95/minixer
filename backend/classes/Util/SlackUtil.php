<?php
namespace Minixer\Util;

use GuzzleHttp\Client;

trait SlackUtil
{
    public static function sendToLogin($text)
    {
        $app = $GLOBALS['app'];
        self::send($app['SLACK_WEB_HOOK_LOGIN'], $text);
    }

    public static function sendToRoomCreated($text)
    {
        $app = $GLOBALS['app'];
        self::send($app['SLACK_WEB_HOOK_ROOM_CREATE'], $text);
    }

    public static function sendToError($text)
    {
        $app = $GLOBALS['app'];
        self::send($app['SLACK_WEB_HOOK_ERROR'], $text);
    }

    public static function send($path, $text)
    {
        $url = 'https://hooks.slack.com/services' . $path;
        $options = [
            'form_params' => [
                'payload' => json_encode(['text' => $text]),
            ],
        ];
        $client = new Client();
        $res = $client->post($url, $options);

        return $res->getStatusCode() === 200;
    }
}
