<?php

namespace Minixer\Entity;

use Minixer\ClassHelper;
use Minixer\SettableTrait;

class RoomEmotionList
{
    use SettableTrait;
    use ClassHelper {
        getString as public getRoomId;
        getArray as private getCountById;
    }

    public function getCountList()
    {
        $idCountList = $this->getCountById();

        $list = [];
        foreach ($idCountList as $id => $count) {
            $list[$id] = new RoomEmotion([
                'emotion_id' => (string)$id,
                'count' => (int)$count,
            ]);
        }

        return $list;
    }
}
