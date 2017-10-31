<?php

namespace Minixer\Repository;


use Minixer\Dao\RoomEmotionDao;
use Minixer\Entity\Room;
use Minixer\Entity\RoomEmotionList;

class RoomEmotionRepository
{
    private $roomEmotionDao;

    public function __construct(
        RoomEmotionDao $roomEmotionDao
    ) {
        $this->roomEmotionDao = $roomEmotionDao;
    }

    public function initialize(Room $room)
    {
        $this->roomEmotionDao->initialize($room->getId(), $room->getExpire());
    }

    public function changeExpire(Room $room)
    {
        $this->roomEmotionDao->changeExpire($room->getId(), $room->getExpire());
    }

    public function increment($roomId, $emotionId)
    {
        return $this->roomEmotionDao->increment($roomId, $emotionId);
    }

    public function get($roomId)
    {
        $list = $this->roomEmotionDao->getList($roomId);
        if (!is_array($list)) {
            $list = [];
        }

        return new RoomEmotionList([
            'room_id' => $roomId,
            'count_by_id' => $list,
        ]);
    }

    public function remove($roomId)
    {
        $this->roomEmotionDao->remove($roomId);
    }
}
