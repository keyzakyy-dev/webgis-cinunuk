<?php
/**
 * Konfigurasi database, aplikasi & koneksi PDO
 * Sesuaikan nilai di bawah ini sesuai hosting kamu.
 */

// ── Database ─────────────────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'sig_cinunuk');
define('DB_USER', 'root');         // username DB shared hosting
define('DB_PASS', '');             // password DB shared hosting
define('DB_CHARSET', 'utf8mb4');

// ── Aplikasi ─────────────────────────────────────────────────────────
define('APP_URL',  'http://localhost/backend'); // URL public backend
define('API_URL',  'http://localhost/backend'); // URL API (biasanya sama)
define('UPLOAD_DIR', __DIR__ . '/../public/uploads/');
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024); // 5 MB

// ── Session ──────────────────────────────────────────────────────────
define('SESSION_NAME', 'sig_cinunuk_session');

// ── CORS & Content-Type (hanya untuk request API) ───────────────────
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$isApi = str_contains($requestUri, '/api/');

if ($isApi) {
    header('Access-Control-Allow-Origin: http://localhost:5173');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json; charset=utf-8');

    // Handle preflight request
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// ── Koneksi PDO (singleton) ──────────────────────────────────────────

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=%s',
                DB_HOST, DB_NAME, DB_CHARSET
            );
            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Koneksi database gagal',
                ]);
                exit;
            }
        }
        return self::$instance;
    }

    private function __construct() {}
    private function __clone() {}
}