<?php

namespace Minixer\Repository;

use Minixer\Dao\RoomDao;
use Minixer\Dao\RoomMaxMemberCountDao;
use Minixer\Dao\RoomUserListDao;
use Minixer\Entity\Room;
use Minixer\Util\DateTimeUtil;

class RoomRepository
{
    private $roomDao;
    private $roomUserListDao;
    private $roomMaxMemberCountDao;

    public function __construct(
        RoomDao $roomDao,
        RoomUserListDao $roomUserListDao,
        RoomMaxMemberCountDao $roomMaxMemberDao
    ) {
        $this->roomDao = $roomDao;
        $this->roomUserListDao = $roomUserListDao;
        $this->roomMaxMemberCountDao = $roomMaxMemberDao;
    }

    public function set(Room $room, $new = false)
    {
        $row = [
            'id' => $room->getId(),
            'user_id' => $room->getUserId(),
            'name' => $room->getName(),
            'mood_message' => $room->getMoodMessage(),
            'extend_count' => $room->getExtendCount(),
            'expire' => $room->getExpire(),
            'created_at' => $room->getCreatedAt()->getTimestamp(),
        ];
        $this->roomDao->set($row);

        if ($new) {
            $this->roomUserListDao->initialize($room->getId(), $room->getExpire());
            $this->roomMaxMemberCountDao->initialize($room->getId(), $room->getExpire());
        }

        return true;
    }

    public function get($roomId)
    {
        $row = $this->roomDao->get($roomId);
        $count = $this->roomUserListDao->getCount($roomId);
        $maxCount = $this->roomMaxMemberCountDao->get($roomId);
        return $this->createEntity($row, $count, $maxCount);
    }

    private function createEntity($row, $count, $maxCount)
    {
        if (empty($row)) {
            return null;
        }

        $row['current_member_count'] = $count;
        $row['max_member_count'] = $maxCount;
        $row['created_at'] = DateTimeUtil::getImmutableByTimestamp($row['created_at']);
        return new Room($row);
    }

    public function joinUser($roomId, $userId)
    {
        $this->roomUserListDao->add($roomId, $userId);
        $count = $this->roomUserListDao->getCount($roomId);
        $maxCount = $this->roomMaxMemberCountDao->get($roomId);
        if ($maxCount < $count) {
            $this->roomMaxMemberCountDao->set($roomId, $count);
            $maxCount = $count;
        }

        $row = $this->roomDao->get($roomId);
        return $this->createEntity($row, $count, $maxCount);
    }

    public function leaveUser($roomId, $userId)
    {
        $this->roomUserListDao->del($roomId, $userId);
        return $this->get($roomId);
    }

    public function changeExpire(Room $room)
    {
        $this->roomUserListDao->changeExpire($room->getId(), $room->getExpire());
        $this->roomMaxMemberCountDao->changeExpire($room->getId(), $room->getExpire());
    }

    public function remove($roomId)
    {
        $this->roomDao->remove($roomId);
        $this->roomUserListDao->remove($roomId);
        $this->roomMaxMemberCountDao->remove($roomId);
    }

    public function getIds()
    {
        return $this->roomDao->getIds();
    }
}
