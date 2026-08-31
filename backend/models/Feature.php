<?php
require_once __DIR__ . '/../config/database.php';

class Feature
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Ambil semua fitur (untuk admin list)
     */
    public function all(?int $layerId = null): array
    {
        $sql = 'SELECT f.*, l.nama_layer AS layer_name, l.tipe AS layer_type
                FROM features f JOIN layers l ON f.layer_id = l.id';
        $params = [];
        if ($layerId) {
            $sql .= ' WHERE f.layer_id = ?';
            $params[] = $layerId;
        }
        $sql .= ' ORDER BY l.urutan, f.nama';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Detail satu fitur
     */
    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT f.*, l.nama_layer AS layer_name, l.tipe AS layer_type, l.warna AS layer_warna
             FROM features f JOIN layers l ON f.layer_id = l.id WHERE f.id = ?'
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Tambah fitur baru
     */
    public function create(array $data): int
    {
        $petunjuk = isset($data['petunjuk_arah'])
            ? json_encode($data['petunjuk_arah'])
            : null;

        $stmt = $this->db->prepare(
            'INSERT INTO features
             (layer_id, nama, deskripsi, deskripsi_lengkap, alamat, jam_layanan,
              petunjuk_arah, lat, lng, geometry, foto_1, foto_2, foto_3, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['layer_id'],
            $data['nama'],
            $data['deskripsi']        ?? null,
            $data['deskripsi_lengkap'] ?? null,
            $data['alamat']           ?? null,
            $data['jam_layanan']      ?? null,
            $petunjuk,
            $data['lat']              ?? null,
            $data['lng']              ?? null,
            is_array($data['geometry'] ?? null) ? json_encode($data['geometry']) : ($data['geometry'] ?? null),
            $data['foto_1']           ?? null,
            $data['foto_2']           ?? null,
            $data['foto_3']           ?? null,
            $data['is_active']        ?? 1,
        ]);
        return (int) $this->db->lastInsertId();
    }

    /**
     * Update fitur
     */
    public function update(int $id, array $data): bool
    {
        $petunjuk = isset($data['petunjuk_arah'])
            ? json_encode($data['petunjuk_arah'])
            : null;

        $stmt = $this->db->prepare(
            'UPDATE features SET
              layer_id=?, nama=?, deskripsi=?, deskripsi_lengkap=?, alamat=?, jam_layanan=?,
              petunjuk_arah=?, lat=?, lng=?, geometry=?, foto_1=?, foto_2=?, foto_3=?, is_active=?,
              updated_at=NOW()
             WHERE id=?'
        );
        $stmt->execute([
            $data['layer_id'],
            $data['nama'],
            $data['deskripsi']         ?? null,
            $data['deskripsi_lengkap'] ?? null,
            $data['alamat']            ?? null,
            $data['jam_layanan']       ?? null,
            $petunjuk,
            $data['lat']               ?? null,
            $data['lng']               ?? null,
            is_array($data['geometry'] ?? null) ? json_encode($data['geometry']) : ($data['geometry'] ?? null),
            $data['foto_1']            ?? null,
            $data['foto_2']            ?? null,
            $data['foto_3']            ?? null,
            $data['is_active']         ?? 1,
            $id,
        ]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Hapus fitur
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM features WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Parse GeoJSON file yang di-upload → insert ke features
     */
    public function importFromGeoJson(int $layerId, array $geojson): int
    {
        $count = 0;
        foreach ($geojson['features'] as $feat) {
            $props = $feat['properties'] ?? [];
            $geom  = $feat['geometry'] ?? null;

            $lat = null;
            $lng = null;
            if ($geom) {
                if ($geom['type'] === 'Point' && isset($geom['coordinates'])) {
                    $lng = $geom['coordinates'][0];
                    $lat = $geom['coordinates'][1];
                } elseif (isset($geom['coordinates'][0][0])) {
                    // polygon/linestring: ambil centroid sederhana
                    $first = $geom['coordinates'][0];
                    if (is_array($first) && count($first) >= 3) {
                        $total = count($first);
                        $sumLat = 0;
                        $sumLng = 0;
                        foreach ($first as $coord) {
                            $sumLng += (float) $coord[0];
                            $sumLat += (float) $coord[1];
                        }
                        $lng = $sumLng / $total;
                        $lat = $sumLat / $total;
                    }
                }
            }

            $this->create([
                'layer_id'    => $layerId,
                'nama'        => $props['Name'] ?? $props['name'] ?? 'Tanpa Nama',
                'deskripsi'   => $props['description'] ?? null,
                'lat'         => $lat,
                'lng'         => $lng,
                'geometry'    => $geom,
                'is_active'   => 1,
            ]);
            $count++;
        }
        return $count;
    }
}
