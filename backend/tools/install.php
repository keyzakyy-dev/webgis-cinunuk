<?php
/**
 * Script instalasi — jalankan SATU KALI setelah upload ke hosting.
 * Buka: http://localhost/gis/backend/tools/install.php
 *
 * LINDUNGI file ini dengan menambah password HTTP atau hapus setelah instalasi.
 */

require_once __DIR__ . '/../config/database.php';

$errors  = [];
$step    = 1;

// Cek apakah sudah terinstall (tabel users ada & ada data admin)
try {
    $db   = Database::getConnection();
    $stmt = $db->query('SELECT COUNT(*) FROM users');
    $usersCount = (int) $stmt->fetchColumn();
    if ($usersCount > 0) {
        $step = 3; // Sudah terinstall
    }
} catch (PDOException $e) {
    $step = 1; // Tabel belum ada
}

// ── STEP 1: Buat tabel ──────────────────────────────────────────────
if ($step === 1 && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['create_tables'])) {
    $sqlFile = file_get_contents(__DIR__ . '/../database.sql');
    $statements = array_filter(array_map('trim', explode(';', $sqlFile)));
    $errors = [];
    foreach ($statements as $sql) {
        if (empty($sql)) continue;
        try {
            $db->exec($sql);
        } catch (PDOException $e) {
            if ($e->getCode() !== '42S01') {
                $errors[] = $e->getMessage();
            }
        }
    }
    if (!$errors) {
        $step = 2;
    }
}

// ── STEP 2: Buat admin ──────────────────────────────────────────────
if ($step >= 1 && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['create_admin'])) {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $nama     = trim($_POST['nama'] ?? 'Administrator');

    if (strlen($username) < 3) $errors[] = 'Username minimal 3 karakter';
    if (strlen($password) < 6) $errors[] = 'Password minimal 6 karakter';

    if (!$errors) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $db->exec("DELETE FROM users WHERE username = 'admin'");
        $stmt = $db->prepare(
            'INSERT INTO users (username, password, nama, role) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$username, $hash, $nama, 'admin']);
        $step = 3;
    } else {
        $step = 2;
    }
}

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Instalasi — SIG Cinunuk</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; }
        body { font-family: system-ui, sans-serif; background: #fafaf9; color: #292524; min-height: 100vh; display: grid; place-items: center; padding: 1rem; }
        .wrap { width: 100%; max-width: 520px; }
        .card { background: #fff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        h1 { font-size: 1.3rem; margin-bottom: 0.5rem; text-align: center; }
        .subtitle { text-align: center; color: #a8a29e; font-size: 0.85rem; margin-bottom: 1.5rem; }
        .step { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; padding: 0.6rem 0.8rem; border-radius: 8px; font-size: 0.88rem; font-weight: 600; }
        .step--done { background: #f0fdf4; color: #15803d; }
        .step--active { background: #292524; color: #fff; }
        .step--pending { background: #f5f5f4; color: #a8a29e; }
        .field { margin-bottom: 0.85rem; }
        .field label { display: block; font-size: 0.82rem; font-weight: 600; color: #57534e; margin-bottom: 0.2rem; }
        .field input { width: 100%; padding: 0.55rem 0.7rem; border: 1px solid #e7e5e4; border-radius: 6px; font-size: 0.92rem; outline: none; }
        .field input:focus { border-color: #292524; }
        .btn { display: block; width: 100%; padding: 0.65rem; border: none; border-radius: 8px; font-size: 0.92rem; font-weight: 700; cursor: pointer; }
        .btn--primary { background: #292524; color: #fff; }
        .btn--primary:hover { background: #44403c; }
        .error { background: #fef2f2; color: #991b1b; padding: 0.6rem 0.8rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1rem; border: 1px solid #fecaca; }
        .success-box { background: #f0fdf4; color: #15803d; padding: 0.8rem; border-radius: 8px; font-size: 0.88rem; text-align: center; margin-bottom: 1rem; border: 1px solid #bbf7d0; }
        .warning { background: #fffbeb; color: #92400e; padding: 0.8rem; border-radius: 8px; font-size: 0.82rem; border: 1px solid #fde68a; margin-top: 1rem; }
        a { color: #292524; font-weight: 600; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="card">
            <h1>Instalasi SIG Cinunuk</h1>
            <p class="subtitle">Setup database & admin akun</p>

            <div class="step <?= $step > 1 ? 'step--done' : ($step === 1 ? 'step--active' : 'step--pending') ?>">
                <span>1</span> Buat tabel database
            </div>
            <div class="step <?= $step > 2 ? 'step--done' : ($step === 2 ? 'step--active' : 'step--pending') ?>">
                <span>2</span> Buat akun admin
            </div>
            <div class="step <?= $step === 3 ? 'step--done' : 'step--pending' ?>">
                <span>3</span> Selesai
            </div>

            <?php foreach ($errors as $err): ?>
                <div class="error"><?= htmlspecialchars($err) ?></div>
            <?php endforeach; ?>

            <?php if ($step === 1): ?>
                <p style="font-size:0.88rem;color:#57534e;margin-bottom:0.75rem">Buat tabel database dari <code>database.sql</code>.</p>
                <form method="POST">
                    <button type="submit" name="create_tables" class="btn btn--primary">Buat Tabel Database</button>
                </form>
            <?php elseif ($step === 2): ?>
                <p style="font-size:0.88rem;color:#57534e;margin-bottom:0.75rem">Masukkan username & password admin.</p>
                <form method="POST">
                    <div class="field"><label>Username</label><input type="text" name="username" value="admin" required></div>
                    <div class="field"><label>Password</label><input type="password" name="password" required placeholder="min. 6 karakter"></div>
                    <div class="field"><label>Nama Lengkap</label><input type="text" name="nama" value="Administrator"></div>
                    <button type="submit" name="create_admin" class="btn btn--primary">Buat Akun Admin</button>
                </form>
            <?php elseif ($step === 3): ?>
                <div class="success-box">Instalasi selesai! Akun admin sudah siap.</div>
                <a href="../admin/login.php" class="btn btn--primary" style="display:block;text-align:center;text-decoration:none;color:#fff">
                    Buka Panel Admin
                </a>
                <div class="warning">
                    <strong>Penting:</strong> Hapus file <code>tools/install.php</code> ini setelah instalasi agar tidak bisa dijalankan ulang.
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>