<?php
require_once __DIR__ . '/../models/Auth.php';
Auth::required();
require_once __DIR__ . '/../models/Layer.php';

$model   = new Layer();
$id      = isset($_GET['id']) ? (int) $_GET['id'] : null;
$isEdit  = $id && $id > 0;
$layer   = $isEdit ? $model->findWithFeatures($id) : null;
$errors  = [];
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = [
        'nama_layer' => trim($_POST['nama_layer'] ?? ''),
        'tipe'       => $_POST['tipe'] ?? 'point',
        'warna'      => trim($_POST['warna'] ?? '#292524'),
        'grup'       => trim($_POST['grup'] ?? 'Lainnya'),
        'urutan'     => (int) ($_POST['urutan'] ?? 0),
        'is_active'  => isset($_POST['is_active']) ? 1 : 0,
    ];

    if (empty($data['nama_layer'])) $errors[] = 'Nama layer wajib diisi';

    if (!$errors) {
        if ($isEdit) {
            $model->update($id, $data);
        } else {
            $id = $model->create($data);
        }
        $success = true;
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= $isEdit ? 'Edit' : 'Tambah' ?> Layer — Admin SIG Cinunuk</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <?php include 'partials/header.php'; ?>

    <div class="admin-layout">
        <?php include 'partials/sidebar.php'; ?>

        <main class="admin-main">
            <div class="admin-content">
                <h1 class="admin-title"><?= $isEdit ? 'Edit Layer' : 'Tambah Layer Baru' ?></h1>

                <?php if ($success): ?>
                    <div class="flash flash--success">Layer berhasil disimpan. <a href="layers.php">Kembali ke daftar</a></div>
                <?php endif; ?>

                <?php foreach ($errors as $err): ?>
                    <div class="flash flash--error"><?= htmlspecialchars($err) ?></div>
                <?php endforeach; ?>

                <div class="form-card">
                    <form method="POST">
                        <div class="form-group">
                            <label>Nama Layer *</label>
                            <input type="text" name="nama_layer" value="<?= htmlspecialchars($layer['nama_layer'] ?? $_POST['nama_layer'] ?? '') ?>" required placeholder="mis. Wilayah RW">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Tipe *</label>
                                <select name="tipe">
                                    <?php
                                    $current = $layer['tipe'] ?? $_POST['tipe'] ?? 'point';
                                    foreach (['point' => 'Point (Titik)', 'line' => 'LineString (Garis)', 'polygon' => 'Polygon (Area)'] as $val => $lbl):
                                    ?>
                                    <option value="<?= $val ?>" <?= $current === $val ? 'selected' : '' ?>><?= $lbl ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Warna</label>
                                <input type="color" name="warna" value="<?= htmlspecialchars($layer['warna'] ?? $_POST['warna'] ?? '#292524') ?>">
                                <span class="hint">Pilih warna untuk layer ini</span>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Grup</label>
                                <input type="text" name="grup" value="<?= htmlspecialchars($layer['grup'] ?? $_POST['grup'] ?? 'Lainnya') ?>" placeholder="mis. Administrasi, Infrastruktur">
                            </div>
                            <div class="form-group">
                                <label>Urutan</label>
                                <input type="number" name="urutan" value="<?= $layer['urutan'] ?? $_POST['urutan'] ?? 0 ?>" min="0">
                                <span class="hint">Urutan tampilan di panel layer</span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>
                                <input type="checkbox" name="is_active" <?= ($layer['is_active'] ?? 1) ? 'checked' : '' ?>>
                                Layer aktif (tampil di panel layer)
                            </label>
                        </div>

                        <div class="form-actions">
                            <a href="layers.php" class="btn">Batal</a>
                            <button type="submit" class="btn btn--primary"><?= $isEdit ? 'Simpan Perubahan' : 'Tambah Layer' ?></button>
                        </div>
                    </form>
                </div>

                <?php if ($isEdit && !empty($layer['geojson']['features'])): ?>
                <section class="admin-section" style="margin-top:2rem">
                    <h2>Fitur di Layer Ini (<?= count($layer['geojson']['features']) ?>)</h2>
                    <p class="hint" style="margin-bottom:0.5rem">Kelola fitur individual di halaman <a href="features.php?layer_id=<?= $id ?>">Kelola Fitur</a></p>
                </section>
                <?php endif; ?>
            </div>
        </main>
    </div>
</body>
</html>