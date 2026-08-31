<?php
/**
 * Seed GeoJSON → database
 * Jalankan: php tools/seed_geojson.php
 *
 * Membaca semua file GeoJSON dari frontend/public/data dan
 * meng-import fiturnya ke layer yang sesuai berdasarkan nama.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Feature.php';
require_once __DIR__ . '/../models/Layer.php';

// Peta: nama layer (DB) => file geojson
$map = [
    'Batas Desa'             => 'batas-internal.geojson',
    'Wilayah RW'             => 'wilayah-rw.geojson',
    'Pemukiman'              => 'pemukiman.geojson',
    'Jalan'                  => 'jalan.geojson',
    'Sungai'                 => 'sungai.geojson',
    'Irigasi'                => 'irigasi.geojson',
    'Sekolah Dasar'          => 'sekolah.geojson',
    'Tempat Ibadah'          => 'tempat-ibadah.geojson',
    'Titik Batas & Landmark' => 'titik-batas.geojson',
    'Peralihan Hak Tanah'    => 'peralihan-hak-tanah.geojson',
];

// Cari folder data (cek beberapa lokasi, tergantung struktur deploy)
$candidates = [
    __DIR__ . '/../../frontend/public/data',
    __DIR__ . '/../public/data',
    __DIR__ . '/../../../frontend/public/data',
];
$dataDir = null;
foreach ($candidates as $c) {
    if (is_dir($c)) { $dataDir = $c; break; }
}
if (!$dataDir) {
    fwrite(STDERR, "ERROR: folder data tidak ditemukan. Coba salah satu:\n  " . implode("\n  ", $candidates) . "\n");
    exit(1);
}

$db = Database::getConnection();
$layerModel = new Layer();
$featureModel = new Feature();

// Ambil semua layer dari DB & map by nama_layer
$layers = [];
foreach ($layerModel->all(false) as $l) {
    $layers[$l['nama_layer']] = (int) $l['id'];
}

$totalImported = 0;

foreach ($map as $layerName => $file) {
    $path = $dataDir . '/' . $file;
    if (!file_exists($path)) {
        echo "SKIP: file tidak ada: {$file}\n";
        continue;
    }
    if (!isset($layers[$layerName])) {
        echo "SKIP: layer tidak ada di DB: {$layerName}\n";
        continue;
    }

    $geojson = json_decode(file_get_contents($path), true);
    if (!isset($geojson['features'])) {
        echo "SKIP: format tidak valid: {$file}\n";
        continue;
    }

    $layerId = $layers[$layerName];
    // Hapus data lama layer tsb agar idempotent
    $db->prepare('DELETE FROM features WHERE layer_id = ?')->execute([$layerId]);

    $count = $featureModel->importFromGeoJson($layerId, $geojson);
    $totalImported += $count;
    echo "OK: {$file} → {$layerName} ({$count} fitur)\n";
}

echo "\nSelesai. Total {$totalImported} fitur diimport.\n";
