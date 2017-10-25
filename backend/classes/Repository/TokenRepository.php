<?php

namespace Minixer\Repository;

use Minixer\Dao\TokenDao;

class TokenRepository
{
    private $dao;

    public function __construct(TokenDao $dao)
    {
        $this->dao = $dao;
    }

    public function set($userId, $token)
    {
        $this->dao->set($userId, $token);
    }

    public function isValidToken($userId, $token)
    {
        $savedToken = $this->dao->get($userId);
        return ($token === $savedToken);
    }
}
