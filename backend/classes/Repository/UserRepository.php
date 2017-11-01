<?php

namespace Minixer\Repository;

use Minixer\Dao\UserDao;
use Minixer\Entity\User;

class UserRepository
{
    private $dao;

    public function __construct(UserDao $dao)
    {
        $this->dao = $dao;
    }

    public function set(User $user)
    {
        $userId = $user->getId();
        $row = [
            'id' => $user->getId(),
            'api_token' => $user->getApiToken(),
            'name' => $user->getName(),
            'profile_image_url' => $user->getProfileImageUrl(),
            'status' => $user->getStatus(),
        ];
        $this->dao->set($userId, $row);
    }

    public function get($id)
    {
        $row = $this->dao->get($id);
        if (empty($row)) {
            return null;
        }

        return new User($row);
    }

    public function isValidToken($userId, $token)
    {
        $user = $this->get($userId);
        if (empty($user)) {
            return false;
        }

        return $user->getApiToken() === $token;
    }
}
