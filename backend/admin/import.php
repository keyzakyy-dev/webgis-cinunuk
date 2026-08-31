<?php
require_once __DIR__ . '/../models/Auth.php';
Auth::required();
require_once __DIR__ . '/../models/Feature.php';
require_once __DIR__ . '/../models/Layer.php';

$model   = new Feature();
$layers  = (new Layer())->all(false);
$message = '';
$errors  = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $layerId = (int) ($_POST['layer_id'] ?? 0);
    if ($layerId <= 0) {
        $errors[] = 'Pilih layer terlebih dahulu';
    }
    if (empty($_FILES['geojson']['tmp_name'])) {
        $errors[] = 'File GeoJSON wajib diupload';
    }

    if (!$errors) {
        $content = file_get_contents($_FILES['geojson']['tmp_name']);
        $geojson = json_decode($content, true);
        if (!isset($geojson['features'])) {
            $errors[] = 'Format GeoJSON tidak valid (harus FeatureCollection)';
        } else {
            $count = $model->importFromGeoJson($layerId, $geojson);
            $message = "Berhasil import {$count} fitur ke layer.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Import GeoJSON — Admin SIG Cinunuk</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <?php include 'partials/header.php'; ?>
    <div class="admin-layout">
        <?php include 'partials/sidebar.php'; ?>

        <main class="admin-main">
            <div class="admin-content">
                <h1 class="admin-title">Import GeoJSON</h1>

                <?php if ($message): ?>
                    <div class="flash flash--success"><?= $message ?></div>
                <?php endif; ?>
                <?php foreach ($errors as $err): ?>
                    <div class="flash flash--error"><?= htmlspecialchars($err) ?></div>
                <?php endforeach; ?>

                <div class="form-card">
                    <form method="POST" enctype="multipart/form-data">
                        <div class="form-group">
                            <label>Import ke Layer *</label>
                            <select name="layer_id" required>
                                <option value="">— Pilih Layer —</option>
                                <?php foreach ($layers as $l): ?>
                                <option value="<?= $l['id'] ?>">
                                    <?= htmlspecialchars($l['nama_layer']) ?> (<?= $l['tipe'] ?>)
                                </option>
                                <?php endforeach; ?>
                            </select>
                            <span class="hint">Semua fitur dari file GeoJSON akan ditambahkan ke layer ini.</span>
                        </div>

                        <div class="form-group">
                            <label>File GeoJSON *</label>
                            <input type="file" name="geojson" accept=".geojson,.json" required style="padding:0.5rem">
                            <span class="hint">Format: FeatureCollection GeoJSON (hasil export QGIS / ArcGIS)</span>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn--primary">Import</button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    </div>
</body>
</html>