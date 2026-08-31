<?php
/**
 * Controller Upload — /api/upload
 */

require_once __DIR__ . '/../models/Auth.php';
require_once __DIR__ . '/../config/database.php';

class UploadController
{
    /** POST /api/upload  (multipart/form-data: file, subfolder) */
    public static function handle(): void
    {
        Auth::required();

        if (empty($_FILES['file']['tmp_name'])) {
            self::fail(422, 'File wajib diisi');
        }

        $subfolder = isset($_POST['subfolder'])
            ? preg_replace('/[^a-z0-9\-\/]/i', '', $_POST['subfolder'])
            : 'poi';

        $file = $_FILES['file'];
        $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
        if (!in_array($ext, $allowed)) {
            self::fail(422, 'Ekstensi file tidak diizinkan: ' . $ext);
        }

        if ($file['size'] > MAX_UPLOAD_SIZE) {
            self::fail(422, 'Ukuran file melebihi ' . (MAX_UPLOAD_SIZE / 1024 / 1024) . ' MB');
        }

        // Cek upload error
        if ($file['error'] !== UPLOAD_ERR_OK) {
            self::fail(500, 'Gagal upload (error code: ' . $file['error'] . ')');
        }

        // Generate nama unik
        $filename = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

        $destDir = UPLOAD_DIR . $subfolder;
        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }

        $dest = $destDir . '/' . $filename;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            self::fail(500, 'Gagal menyimpan file');
        }

        // Return URL path (relative)
        $url = '/uploads/' . $subfolder . '/' . $filename;

        echo json_encode([
            'success' => true,
            'data'    => [
                'url'      => $url,
                'filename' => $filename,
            ],
        ]);
    }

    private static function fail(int $code, string $msg): void
    {
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $msg]);
        exit;
    }
}