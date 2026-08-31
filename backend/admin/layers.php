<?php
require_once __DIR__ . '/../models/Auth.php';
Auth::required();
require_once __DIR__ . '/../models/Layer.php';

// Handle delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_id'])) {
    (new Layer())->delete((int) $_POST['delete_id']);
    header('Location: layers.php');
    exit;
}

$layers = (new Layer())->all(false);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kelola Layer — Admin SIG Cinunuk</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <?php include 'partials/header.php'; ?>

    <div class="admin-layout">
        <?php include 'partials/sidebar.php'; ?>

        <main class="admin-main">
            <div class="admin-content">
                <div class="admin-section__head">
                    <h1 class="admin-title">Kelola Layer</h1>
                    <a href="layer_edit.php" class="btn btn--primary">+ Tambah Layer</a>
                </div>

                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Nama Layer</th>
                            <th>Tipe</th>
                            <th>Grup</th>
                            <th>Warna</th>
                            <th>Urutan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($layers as $l): ?>
                        <tr>
                            <td><?= htmlspecialchars($l['nama_layer']) ?></td>
                            <td><span class="badge badge--type"><?= $l['tipe'] ?></span></td>
                            <td><?= htmlspecialchars($l['grup']) ?></td>
                            <td><span class="color-swatch" style="background: <?= $l['warna'] ?>"></span> <?= $l['warna'] ?></td>
                            <td><?= $l['urutan'] ?></td>
                            <td><span class="badge <?= $l['is_active'] ? 'badge--active' : 'badge--inactive' ?>"><?= $l['is_active'] ? 'Aktif' : 'Nonaktif' ?></span></td>
                            <td>
                                <a href="layer_edit.php?id=<?= $l['id'] ?>" class="btn btn--sm">Edit</a>
                                <form method="POST" style="display:inline" onsubmit="return confirm('Hapus layer ini beserta semua fiturnya?')">
                                    <input type="hidden" name="delete_id" value="<?= $l['id'] ?>">
                                    <button type="submit" class="btn btn--sm btn--danger">Hapus</button>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</body>
</html>