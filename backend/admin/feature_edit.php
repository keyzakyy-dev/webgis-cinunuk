<?php
require_once __DIR__ . '/../models/Auth.php';
Auth::required();
require_once __DIR__ . '/../models/Feature.php';
require_once __DIR__ . '/../models/Layer.php';

$model  = new Feature();
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;
$isEdit = $id && $id > 0;
$feat   = $isEdit ? $model->find($id) : null;
$errors = [];
$success = false;

$defaultLayerId = isset($_GET['layer_id']) ? (int) $_GET['layer_id'] : ($feat['layer_id'] ?? null);
$layers = (new Layer())->all(false);

// Parse petunjuk_arah JSON untuk form
$petunjukArah = [];
if ($feat && $feat['petunjuk_arah']) {
    $petunjukArah = json_decode($feat['petunjuk_arah'], true) ?? [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama = trim($_POST['nama'] ?? '');
    $layerId = (int) ($_POST['layer_id'] ?? 0);

    if (empty($nama))   $errors[] = 'Nama wajib diisi';
    if ($layerId <= 0)  $errors[] = 'Pilih layer terlebih dahulu';

    // Petunjuk arah: ambil baris yang tidak kosong
    $petunjukLines = array_filter(array_map('trim', explode("\n", $_POST['petunjuk_arah'] ?? '')), fn($l) => $l !== '');

    if (!$errors) {
        $data = [
            'layer_id'          => $layerId,
            'nama'              => $nama,
            'deskripsi'         => trim($_POST['deskripsi'] ?? ''),
            'deskripsi_lengkap' => trim($_POST['deskripsi_lengkap'] ?? ''),
            'alamat'            => trim($_POST['alamat'] ?? ''),
            'jam_layanan'       => trim($_POST['jam_layanan'] ?? ''),
            'petunjuk_arah'     => array_values($petunjukLines),
            'lat'               => !empty($_POST['lat']) ? (float) $_POST['lat'] : null,
            'lng'               => !empty($_POST['lng']) ? (float) $_POST['lng'] : null,
            'foto_1'            => trim($_POST['foto_1'] ?? ''),
            'foto_2'            => trim($_POST['foto_2'] ?? ''),
            'foto_3'            => trim($_POST['foto_3'] ?? ''),
            'is_active'         => isset($_POST['is_active']) ? 1 : 0,
        ];

        // Geometry: ambil dari textarea (untuk polygon/line)
        if (!empty($_POST['geometry'])) {
            $data['geometry'] = json_decode($_POST['geometry'], true);
            if ($data['geometry'] === null) $errors[] = 'Format geometry GeoJSON tidak valid';
        }

        if (!$errors) {
            if ($isEdit) {
                $model->update($id, $data);
            } else {
                $id = $model->create($data);
            }
            $success = true;
            if ($isEdit) $feat = $model->find($id);
        }
    }
}

// Helpers untuk mengisi nilai form
function old(string $key, $feat): string {
    if (isset($_POST[$key])) return htmlspecialchars(trim($_POST[$key]));
    if ($feat && isset($feat[$key])) return htmlspecialchars((string) $feat[$key]);
    return '';
}
$oldLat = isset($_POST['lat']) ? (float)$_POST['lat'] : ($feat['lat'] ?? null);
$oldLng = isset($_POST['lng']) ? (float)$_POST['lng'] : ($feat['lng'] ?? null);
$oldGeom = isset($_POST['geometry']) ? $_POST['geometry'] : ($feat['geometry'] ?? '');
$oldPetunjuk = implode("\n", $petunjukArah);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= $isEdit ? 'Edit' : 'Tambah' ?> Fitur — Admin SIG Cinunuk</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <?php include 'partials/header.php'; ?>

    <div class="admin-layout">
        <?php include 'partials/sidebar.php'; ?>

        <main class="admin-main">
            <div class="admin-content">
                <h1 class="admin-title"><?= $isEdit ? 'Edit Fitur' : 'Tambah Fitur Baru' ?></h1>

                <?php if ($success): ?>
                    <div class="flash flash--success">Fitur berhasil disimpan. <a href="features.php<?= isset($_POST['layer_id']) ? '?layer_id=' . (int)$_POST['layer_id'] : '' ?>">Kembali ke daftar</a></div>
                <?php endif; ?>

                <?php foreach ($errors as $err): ?>
                    <div class="flash flash--error"><?= htmlspecialchars($err) ?></div>
                <?php endforeach; ?>

                <form method="POST">
                    <div class="form-card">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nama *</label>
                                <input type="text" name="nama" value="<?= old('nama', $feat) ?>" required placeholder="mis. SDN I Cinunuk">
                            </div>
                            <div class="form-group">
                                <label>Layer *</label>
                                <select name="layer_id" required>
                                    <option value="">— Pilih Layer —</option>
                                    <?php foreach ($layers as $l): ?>
                                    <option value="<?= $l['id'] ?>" <?= ($defaultLayerId === (int)$l['id']) ? 'selected' : '' ?>>
                                        <?= htmlspecialchars($l['nama_layer']) ?> (<?= $l['tipe'] ?>)
                                    </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Deskripsi Singkat</label>
                            <input type="text" name="deskripsi" value="<?= old('deskripsi', $feat) ?>" placeholder="Deskripsi 1-2 kalimat">
                        </div>

                        <div class="form-group">
                            <label>Deskripsi Lengkap</label>
                            <textarea name="deskripsi_lengkap" rows="4" placeholder="Deskripsi detail untuk halaman detail"><?= old('deskripsi_lengkap', $feat) ?></textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Alamat</label>
                                <input type="text" name="alamat" value="<?= old('alamat', $feat) ?>" placeholder="Jl. ...">
                            </div>
                            <div class="form-group">
                                <label>Jam Layanan</label>
                                <input type="text" name="jam_layanan" value="<?= old('jam_layanan', $feat) ?>" placeholder="Senin–Jumat, 08.00–14.00">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Petunjuk Arah (satu per baris)</label>
                            <textarea name="petunjuk_arah" rows="3" placeholder="Baris 1&#10;Baris 2&#10;Baris 3"><?= htmlspecialchars($oldPetunjuk) ?></textarea>
                        </div>
                    </div>

                    <div class="form-card" style="margin-top:1rem">
                        <h2 style="font-size:1rem;margin-bottom:0.75rem">Koordinat &amp; Geometry</h2>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Latitude</label>
                                <input type="number" step="any" name="lat" id="latInput" value="<?= $oldLat !== null ? $oldLat : '' ?>" placeholder="-7.1732">
                            </div>
                            <div class="form-group">
                                <label>Longitude</label>
                                <input type="number" step="any" name="lng" id="lngInput" value="<?= $oldLng !== null ? $oldLng : '' ?>" placeholder="107.9701">
                            </div>
                        </div>
                        <div class="hint" style="margin-bottom:0.75rem">Klik pada peta di bawah untuk mengisi koordinat (untuk titik/point).</div>

                        <div class="form-group">
                            <label>Geometry GeoJSON (opsional, untuk polygon/line)</label>
                            <textarea name="geometry" id="geomInput" rows="4" placeholder='{"type":"Point","coordinates":[107.9701,-7.1732]}'><?= htmlspecialchars(is_string($oldGeom) ? $oldGeom : json_encode($oldGeom)) ?></textarea>
                            <span class="hint">Isi JSON geometry GeoJSON. Untuk point, cukup klik peta di bawah — otomatis terisi.</span>
                        </div>

                        <div class="form-group">
                            <div id="editMap" style="height:300px;border:1px solid #e7e5e4;border-radius:8px;overflow:hidden"></div>
                        </div>
                    </div>

                    <div class="form-card" style="margin-top:1rem">
                        <h2 style="font-size:1rem;margin-bottom:0.75rem">Foto (URL)</h2>
                        <div class="form-row">
                            <div class="form-group"><label>Foto 1</label><input type="text" name="foto_1" value="<?= old('foto_1', $feat) ?>" placeholder="/uploads/poi/..."></div>
                            <div class="form-group"><label>Foto 2</label><input type="text" name="foto_2" value="<?= old('foto_2', $feat) ?>" placeholder="/uploads/poi/..."></div>
                            <div class="form-group"><label>Foto 3</label><input type="text" name="foto_3" value="<?= old('foto_3', $feat) ?>" placeholder="/uploads/poi/..."></div>
                        </div>
                        <div class="hint">Upload foto lewat halaman <a href="upload.php">Upload Foto</a> lalu tempel URL-nya di sini.</div>
                    </div>

                    <div class="form-card" style="margin-top:1rem">
                        <label>
                            <input type="checkbox" name="is_active" <?= (!isset($feat['is_active']) || $feat['is_active']) ? 'checked' : '' ?>>
                            Fitur aktif (tampil di peta)
                        </label>
                    </div>

                    <div class="form-actions">
                        <a href="features.php" class="btn">Batal</a>
                        <button type="submit" class="btn btn--primary"><?= $isEdit ? 'Simpan Perubahan' : 'Tambah Fitur' ?></button>
                    </div>
                </form>
            </div>
        </main>
    </div>

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const map = L.map('editMap').setView([-7.17364, 107.970141], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        let marker = null;
        const latInput = document.getElementById('latInput');
        const lngInput = document.getElementById('lngInput');
        const geomInput = document.getElementById('geomInput');

        function placeMarker(lat, lng) {
            if (marker) marker.remove();
            marker = L.marker([lat, lng]).addTo(map);
            latInput.value = lat.toFixed(8);
            lngInput.value = lng.toFixed(8);
            try {
                const g = JSON.parse(geomInput.value || 'null');
                if (!g || g.type !== 'Point') {
                    geomInput.value = JSON.stringify({ type: 'Point', coordinates: [lng, lat] });
                } else {
                    g.coordinates = [lng, lat];
                    geomInput.value = JSON.stringify(g);
                }
            } catch (e) {
                geomInput.value = JSON.stringify({ type: 'Point', coordinates: [lng, lat] });
            }
        }

        map.on('click', function (e) {
            placeMarker(e.latlng.lat, e.latlng.lng);
        });

        // Jika sudah ada koordinat, tampilkan marker
        const initLat = parseFloat(latInput.value);
        const initLng = parseFloat(lngInput.value);
        if (!isNaN(initLat) && !isNaN(initLng)) {
            placeMarker(initLat, initLng);
            map.setView([initLat, initLng], 16);
        }
    </script>
</body>
</html>