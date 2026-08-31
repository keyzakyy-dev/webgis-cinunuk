<?php
require_once __DIR__ . '/../models/Auth.php';
Auth::required();
require_once __DIR__ . '/../config/database.php';

$uploadDir = UPLOAD_DIR . 'poi';
$message   = '';
$uploaded = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_FILES['file']['tmp_name'])) {
    $file = $_FILES['file'];
    $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

    if (!in_array($ext, $allowed)) {
        $message = 'Ekstensi tidak diizinkan: ' . $ext;
    } elseif ($file['size'] > 5 * 1024 * 1024) {
        $message = 'Ukuran melebihi 5 MB';
    } elseif ($file['error'] !== UPLOAD_ERR_OK) {
        $message = 'Gagal upload (error: ' . $file['error'] . ')';
    } else {
        $filename = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
        if (move_uploaded_file($file['tmp_name'], $uploadDir . '/' . $filename)) {
            $uploaded  = '/uploads/poi/' . $filename;
            $message   = 'Upload berhasil!';
        } else {
            $message = 'Gagal menyimpan file ke server';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Upload Foto — Admin SIG Cinunuk</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <?php include 'partials/header.php'; ?>
    <div class="admin-layout">
        <?php include 'partials/sidebar.php'; ?>

        <main class="admin-main">
            <div class="admin-content">
                <h1 class="admin-title">Upload Foto</h1>

                <?php if ($message): ?>
                    <div class="flash <?= $uploaded ? 'flash--success' : 'flash--error' ?>"><?= $message ?></div>
                <?php endif; ?>

                <div class="form-card">
                    <form method="POST" enctype="multipart/form-data">
                        <div class="form-group">
                            <label>Pilih Foto (JPG, PNG, WebP, GIF, SVG — max 5 MB)</label>
                            <input type="file" name="file" accept="image/*" required style="padding:0.5rem">
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn--primary">Upload</button>
                        </div>
                    </form>
                </div>

                <?php if ($uploaded): ?>
                <div class="form-card" style="margin-top:1rem">
                    <strong>URL Foto:</strong>
                    <code style="display:block;padding:0.6rem 0.75rem;background:#fafaf9;border:1px solid #e7e5e4;border-radius:6px;margin:0.5rem 0;font-size:0.88rem;word-break:break-all"><?= $uploaded ?></code>
                    <span class="hint">Salin URL ini ke field "Foto" pada form edit fitur.</span>
                    <div style="margin-top:1rem;text-align:center">
                        <img src="<?= $uploaded ?>" alt="Preview" style="max-width:300px;max-height:300px;border-radius:8px;border:1px solid #e7e5e4">
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </main>
    </div>
</body>
</html>