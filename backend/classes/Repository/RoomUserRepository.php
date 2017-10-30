<?php

namespace Minixer\Repository;


use Minixer\Dao\RoomUserDao;
use Minixer\Entity\RoomUser;
use Minixer\Util\DateTimeUtil;

class RoomUserRepository
{
    private $roomUserDao;

    public function __construct(
        RoomUserDao $roomUserDao
    ) {
        $this->roomUserDao = $roomUserDao;
    }

    /**
     * @param $userId
     * @return RoomUser
     */
    public function get($userId)
    {
        $row = $this->roomUserDao->get($userId);
        if (empty($row)) {
            return new RoomUser([
                'user_id' => (string)$userId,
                'updated_at' => DateTimeUtil::getImmutableByNow(),
            ]);
        }

        return new RoomUser([
            'user_id' => $row['user_id'],
            'room_id' => $row['room_id'],
            'updated_at' => DateTimeUtil::getImmutableByTimestamp($row['updated_at']),
        ]);
    }

    /**
     * @param RoomUser $roomUser
     * @return RoomUser
     */
    public function set(RoomUser $roomUser)
    {
        $now = DateTimeUtil::getImmutableByNow();
        $row = [
            'user_id' => $roomUser->getUserId(),
            'room_id' => $roomUser->getRoomId(),
            'updated_at' => $now->getTimestamp(),
        ];

        $this->roomUserDao->set($row);

        return $roomUser->set(['updated_at' => $now]);
    }
}
