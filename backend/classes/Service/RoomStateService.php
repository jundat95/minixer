<?php

namespace Minixer\Service;

use Minixer\Config;
use Minixer\Entity\Room;
use Minixer\Entity\RoomEmotion;
use Minixer\Entity\RoomEmotionList;
use Minixer\Entity\RoomUser;
use Minixer\Repository\RoomEmotionRepository;
use Minixer\Repository\RoomRepository;
use Minixer\Repository\RoomUserRepository;
use Minixer\Repository\UserRepository;
use Minixer\Util\DateTimeUtil;
use Minixer\Util\SlackUtil;

class RoomStateService
{
    const INIT_EXPIRE = 1800;
    const MAX_EXTEND_COUNT = 11;

    private $roomUserRepository;
    private $roomRepository;
    private $roomEmotionRepository;
    private $userRepository;

    public function __construct(
        RoomUserRepository $roomUserRepository,
        RoomRepository $roomRepository,
        RoomEmotionRepository $roomEmotionRepository,
        UserRepository $userRepository
    ) {
        $this->roomUserRepository = $roomUserRepository;
        $this->roomRepository = $roomRepository;
        $this->roomEmotionRepository = $roomEmotionRepository;
        $this->userRepository = $userRepository;
    }

    public function validateToken($userId, $token)
    {
        if (!$this->userRepository->isValidToken($userId, $token)) {
            throw new \Exception('cannot authorization');
        }
    }

    public function getUser($userId, $token)
    {
        $user = $this->userRepository->get($userId);
        if (empty($user)) {
            throw new \Exception('cannot find user');
        }

        if ($user->getApiToken() !== $token) {
            throw new \Exception('cannot authorization');
        }

        return $user;
    }

    public function getRoomUserProperties(RoomUser $roomUser)
    {
        return [
            'user_id' => $roomUser->getUserId(),
            'room_id' => $roomUser->getRoomId(),
            'updated_at' => $roomUser->getUpdatedAt()->getTimestamp(),
        ];
    }

    public function getRoomProperties(Room $room)
    {
        return [
            'id' => $room->getId(),
            'user_id' => $room->getUserId(),
            'name' => $room->getName(),
            'mood_message' => $room->getMoodMessage(),
            'extend_count' => $room->getExtendCount(),
            'expire' => $room->getExpire(),
            'current_member_count' => $room->getCurrentMemberCount(),
            'max_member_count' => $room->getMaxMemberCount(),
            'created_at' => $room->getCreatedAt()->getTimestamp(),
            'accessed_at' => DateTimeUtil::getImmutableByNow()->getTimestamp(),
        ];
    }

    public function getRoomEmotionProperties(RoomEmotionList $roomEmotionList)
    {
        $list = [];
        /** @var RoomEmotion $roomEmotion */
        foreach ($roomEmotionList->getCountList() as $roomEmotion) {
            $list[$roomEmotion->getEmotionId()] = $roomEmotion->getCount();
        }

        return $list;
    }

    /**
     * @param $userId
     * @param bool $checkRoom
     * @return RoomUser
     */
    public function getRoomUser($userId, $checkRoom = false)
    {
        $roomUser = $this->roomUserRepository->get($userId);
        if (!$checkRoom) {
            return $roomUser;
        }

        $roomId = $roomUser->getRoomId();
        if (empty($roomId)) {
            return $roomUser;
        }

        $room = $this->roomRepository->get($roomId);
        if (empty($room)) {
            $roomUser = $roomUser->set(['room_id' => null]);
            $this->roomUserRepository->set($roomUser);
        }

        return $roomUser;
    }

    public function create($userId, $name)
    {
        $roomUser = $this->roomUserRepository->get($userId);
        $roomId = $roomUser->getRoomId();
        if (!empty($roomId)) {
            $room = $this->roomRepository->get($roomId);
            if (!empty($room)) {
                return [
                    'room' => $room,
                    'room_user' => $roomUser,
                ];
            }
        }

        $roomId = $userId;

        $room = new Room([
            'id' => $roomId,
            'user_id' => $userId,
            'name' => $name,
            'extend_count' => 0,
            'expire' => self::INIT_EXPIRE,
            'current_member_count' => 0,
            'max_member_count' => 0,
            'created_at' => DateTimeUtil::getImmutableByNow(),
        ]);

        $this->roomRepository->set($room, true);
        $this->roomEmotionRepository->initialize($room);

        $newRoomUser = $roomUser->set([
            'room_id' => $roomId,
        ]);
        $newRoomUser = $this->roomUserRepository->set($newRoomUser);

        $this->sendToSlackCreated($room);

        return [
            'room' => $room,
            'room_user' => $newRoomUser,
        ];
    }

    private function sendToSlackCreated(Room $room)
    {
        try {
            $id = $room->getId();
            $url = Config::getInstance()->get('base_url') . '/room/' . $id;
            $text = sprintf("Name: %s\nID: %s\nURL: <%s>", $room->getName(), $id, $url);
            SlackUtil::sendToRoomCreated($text);
        } catch (\Exception $e) {
        }
    }

    public function getRoom($roomId)
    {
        return $this->roomRepository->get($roomId);
    }

    public function getRoomEmotion($roomId)
    {
        return $this->roomEmotionRepository->get($roomId);
    }

    public function update(Room $room, $userId)
    {
        if ($room->getUserId() !== $userId) {
            throw new \Exception('cannot update room');
        }
        $this->roomRepository->set($room);
    }

    public function join(Room $room, $userId)
    {
        $newRoom = $this->roomRepository->joinUser($room->getId(), $userId);
        return $newRoom;
    }

    public function leave(Room $room, $userId)
    {
        $newRoom = $this->roomRepository->leaveUser($room->getId(), $userId);
        return $newRoom;
    }

    public function close(Room $room, $userId)
    {
        if ($room->getUserId() !== $userId) {
            throw new \Exception('cannot close by not room master');
        }

        $this->roomRepository->remove($room->getId());
        $this->roomEmotionRepository->remove($room->getId());
    }

    public function incrementEmotion(Room $room, $emotionId)
    {
        $this->roomEmotionRepository->increment($room->getId(), $emotionId);

        return $this->getRoomEmotion($room->getId());
    }

    /**
     * @param Room $room
     * @param $userId
     * @param $count
     * @return Room
     * @throws \Exception
     */
    public function extend(Room $room, $userId, $count)
    {
        if ($room->getUserId() !== $userId) {
            throw new \Exception('cannot extend by not room master');
        }

        $extendCount = $room->getExtendCount();
        if ($extendCount >= self::MAX_EXTEND_COUNT) {
            throw new \Exception('max extend count leached');
        }

        $afterCount = $extendCount + $count;
        if ($afterCount >= self::MAX_EXTEND_COUNT) {
            $afterCount = self::MAX_EXTEND_COUNT;
            $count = $afterCount - $extendCount;
        }

        $expire = $room->getExpire();
        $afterExpire = $expire + self::INIT_EXPIRE * $count;
        $newRoom = $room->set([
            'extend_count' => $afterCount,
            'expire' => $afterExpire,
        ]);

        $this->roomRepository->set($newRoom);
        $this->roomRepository->changeExpire($newRoom);
        $this->roomEmotionRepository->changeExpire($newRoom);

        return $newRoom;
    }

    public function getIds()
    {
        return $this->roomRepository->getIds();
    }
}
