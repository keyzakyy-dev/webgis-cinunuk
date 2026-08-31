<?php
require_once __DIR__ . '/../models/Auth.php';
Auth::required();
require_once __DIR__ . '/../models/Feature.php';
require_once __DIR__ . '/../models/Layer.php';

$model = new Feature();
$filterLayer = isset($_GET['layer_id']) ? (int) $_GET['layer_id'] : null;

// Handle delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_id'])) {
    $model->delete((int) $_POST['delete_id']);
    $qs = $filterLayer ? '?layer_id=' . $filterLayer : '';
    header('Location: features.php' . $qs);
    exit;
}

$features = $model->all($filterLayer);
$layers   = (new Layer())->all(false);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kelola Fitur — Admin SIG Cinunuk</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <?php include 'partials/header.php'; ?>

    <div class="admin-layout">
        <?php include 'partials/sidebar.php'; ?>

        <main class="admin-main">
            <div class="admin-content">
                <div class="admin-section__head">
                    <h1 class="admin-title">Kelola Fitur</h1>
                    <a href="feature_edit.php<?= $filterLayer ? '?layer_id=' . $filterLayer : '' ?>" class="btn btn--primary">+ Tambah Fitur</a>
                </div>

                <!-- Filter layer -->
                <form method="GET" style="margin-bottom:1rem">
                    <select name="layer_id" onchange="this.form.submit()" style="padding:0.5rem 0.75rem;border:1px solid #e7e5e4;border-radius:6px;font-size:0.85rem">
                        <option value="">Semua Layer</option>
                        <?php foreach ($layers as $l): ?>
                        <option value="<?= $l['id'] ?>" <?= $filterLayer === (int) $l['id'] ? 'selected' : '' ?>>
                            <?= htmlspecialchars($l['nama_layer']) ?> (<?= $l['tipe'] ?>)
                        </option>
                        <?php endforeach; ?>
                    </select>
                </form>

                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Layer</th>
                            <th>Tipe</th>
                            <th>Lat/Lng</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($features)): ?>
                        <tr><td colspan="6" style="text-align:center;color:#a8a29e;padding:2rem">Belum ada fitur. Klik "Tambah Fitur" atau import GeoJSON.</td></tr>
                        <?php endif; ?>
                        <?php foreach ($features as $f): ?>
                        <tr>
                            <td><?= htmlspecialchars($f['nama']) ?></td>
                            <td><?= htmlspecialchars($f['layer_name']) ?></td>
                            <td><span class="badge badge--type"><?= $f['layer_type'] ?></span></td>
                            <td><?= $f['lat'] ? number_format((float)$f['lat'], 6) . ', ' . number_format((float)$f['lng'], 6) : '—' ?></td>
                            <td><span class="badge <?= $f['is_active'] ? 'badge--active' : 'badge--inactive' ?>"><?= $f['is_active'] ? 'Aktif' : 'Nonaktif' ?></span></td>
                            <td>
                                <a href="feature_edit.php?id=<?= $f['id'] ?>" class="btn btn--sm">Edit</a>
                                <form method="POST" style="display:inline" onsubmit="return confirm('Hapus fitur ini?')">
                                    <input type="hidden" name="delete_id" value="<?= $f['id'] ?>">
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