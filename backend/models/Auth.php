<?php
/**
 * Helper authentication sederhana dengan session PHP
 */

require_once __DIR__ . '/../config/database.php';

class Auth
{
    public static function login(string $username, string $password): bool
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM users WHERE username = ? AND role IN (?,?)');
        $stmt->execute([$username, 'admin', 'editor']);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            if (session_status() === PHP_SESSION_NONE) {
                session_name(SESSION_NAME);
                session_start();
            }
            $_SESSION['user_id']    = $user['id'];
            $_SESSION['username']   = $user['username'];
            $_SESSION['nama']       = $user['nama'];
            $_SESSION['role']       = $user['role'];
            return true;
        }
        return false;
    }

    public static function logout(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_name(SESSION_NAME);
            session_start();
        }
        session_destroy();
    }

    public static function check(): ?array
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_name(SESSION_NAME);
            session_start();
        }
        if (!empty($_SESSION['user_id'])) {
            return [
                'id'       => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'nama'     => $_SESSION['nama'],
                'role'     => $_SESSION['role'],
            ];
        }
        return null;
    }

    public static function required(): void
    {
        if (!self::check()) {
            $isApi = str_starts_with($_SERVER['REQUEST_URI'] ?? '', '/api');
            if ($isApi) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                exit;
            }
            header('Location: login.php');
            exit;
        }
    }
}