<?php
require_once __DIR__ . '/../models/Auth.php';
Auth::required();
$user = Auth::check();

require_once __DIR__ . '/../models/Layer.php';
$layers = (new Layer())->all(false);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dashboard — Admin SIG Cinunuk</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <?php include 'partials/header.php'; ?>

    <div class="admin-layout">
        <?php include 'partials/sidebar.php'; ?>

        <main class="admin-main">
            <div class="admin-content">
                <h1 class="admin-title">Dashboard</h1>

                <div class="admin-stats">
                    <div class="stat">
                        <span class="stat__value"><?= count($layers) ?></span>
                        <span class="stat__label">Total Layer</span>
                    </div>
                    <div class="stat">
                        <span class="stat__value"><?= count(array_filter($layers, fn($l) => $l['is_active'])) ?></span>
                        <span class="stat__label">Layer Aktif</span>
                    </div>
                </div>

                <section class="admin-section">
                    <div class="admin-section__head">
                        <h2>Daftar Layer</h2>
                        <a href="layer_edit.php" class="btn btn--primary">Tambah Layer</a>
                    </div>
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nama Layer</th>
                                <th>Tipe</th>
                                <th>Grup</th>
                                <th>Warna</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($layers as $l): ?>
                            <tr>
                                <td><?= $l['id'] ?></td>
                                <td><?= htmlspecialchars($l['nama_layer']) ?></td>
                                <td><span class="badge badge--type"><?= $l['tipe'] ?></span></td>
                                <td><?= htmlspecialchars($l['grup']) ?></td>
                                <td><span class="color-swatch" style="background: <?= $l['warna'] ?>"></span> <?= $l['warna'] ?></td>
                                <td>
                                    <span class="badge <?= $l['is_active'] ? 'badge--active' : 'badge--inactive' ?>">
                                        <?= $l['is_active'] ? 'Aktif' : 'Nonaktif' ?>
                                    </span>
                                </td>
                                <td>
                                    <a href="layer_edit.php?id=<?= $l['id'] ?>" class="btn btn--sm">Edit</a>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </section>
            </div>
        </main>
    </div>
</body>
</html>