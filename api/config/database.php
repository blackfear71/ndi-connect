<?php
class Database
{
    private $host = "localhost";
    private $db_name = "ndi_connect_db";
    private $username = "root";
    private $password = "root"; // TODO : changer le mot de passe pour publier
    public $conn;

    public function getConnection()
    {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
        } catch (PDOException $exception) {
            echo "Erreur de connexion : " . $exception->getMessage();
        }

        return $this->conn;
    }
}
